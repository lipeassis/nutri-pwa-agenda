import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, User, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useDataSource } from '@/lib/apiMigration';
import { Agendamento, Usuario, LocalAtendimento, Servico } from '@/types';
import { format, subMonths, parseISO, isWithinInterval, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosOperacionais() {
  const [periodoMeses, setPeriodoMeses] = useState<number>(6);
  const [localSelecionado, setLocalSelecionado] = useState<string>('');

  const { data: agendamentos } = useDataSource<Agendamento[]>('nutriapp-agendamentos', []);
  const { data: usuarios } = useDataSource<Usuario[]>('nutriapp-usuarios', []);
  const { data: locais } = useDataSource<LocalAtendimento[]>('nutriapp-locais', []);
  const { data: servicos } = useDataSource<Servico[]>('nutriapp-servicos', []);

  const profissionais = usuarios.filter(u => u.role === 'profissional');

  // Dados processados
  const dadosProcessados = useMemo(() => {
    const agora = new Date();
    const dataLimite = subMonths(agora, periodoMeses);

    let agendamentosFiltrados = agendamentos.filter(ag => {
      const dataAg = parseISO(ag.data);
      return isWithinInterval(dataAg, { start: dataLimite, end: agora });
    });

    if (localSelecionado) {
      agendamentosFiltrados = agendamentosFiltrados.filter(ag => ag.localId === localSelecionado);
    }

    // Produtividade por profissional
    const produtividadeProfissional = profissionais.map(prof => {
      const agendamentosProfissional = agendamentosFiltrados.filter(ag => ag.profissionalId === prof.id);
      const realizados = agendamentosProfissional.filter(ag => ag.status === 'realizado').length;
      const cancelados = agendamentosProfissional.filter(ag => ag.status === 'cancelado').length;
      const total = agendamentosProfissional.length;
      const taxaRealizacao = total > 0 ? (realizados / total) * 100 : 0;

      return {
        nome: prof.nome,
        total,
        realizados,
        cancelados,
        taxaRealizacao
      };
    }).filter(item => item.total > 0);

    // Utilização por local
    const utilizacaoLocal = locais.map(local => {
      const agendamentosLocal = agendamentosFiltrados.filter(ag => ag.localId === local.id);
      const realizados = agendamentosLocal.filter(ag => ag.status === 'realizado').length;
      const total = agendamentosLocal.length;
      const taxaOcupacao = total > 0 ? (realizados / total) * 100 : 0;

      return {
        nome: local.nome,
        total,
        realizados,
        taxaOcupacao
      };
    }).filter(item => item.total > 0);

    // Horários de pico
    const horariosPico = agendamentosFiltrados.reduce((acc, ag) => {
      const hora = getHours(parseISO(`${ag.data}T${ag.hora}`));
      const faixaHoraria = `${hora.toString().padStart(2, '0')}:00`;
      
      if (!acc[faixaHoraria]) {
        acc[faixaHoraria] = { total: 0, realizados: 0 };
      }
      
      acc[faixaHoraria].total++;
      if (ag.status === 'realizado') {
        acc[faixaHoraria].realizados++;
      }
      
      return acc;
    }, {} as Record<string, { total: number; realizados: number }>);

    const horariosPicoArray = Object.entries(horariosPico)
      .map(([horario, dados]) => ({
        horario,
        ...dados,
        taxaRealizacao: dados.total > 0 ? (dados.realizados / dados.total) * 100 : 0
      }))
      .sort((a, b) => a.horario.localeCompare(b.horario));

    // Serviços mais demandados
    const servicosDemandados = agendamentosFiltrados.reduce((acc, ag) => {
      ag.servicosNomes.forEach(servicoNome => {
        if (!acc[servicoNome]) {
          acc[servicoNome] = { total: 0, realizados: 0 };
        }
        acc[servicoNome].total++;
        if (ag.status === 'realizado') {
          acc[servicoNome].realizados++;
        }
      });
      return acc;
    }, {} as Record<string, { total: number; realizados: number }>);

    const servicosDemandadosArray = Object.entries(servicosDemandados)
      .map(([servico, dados]) => ({
        servico,
        ...dados,
        taxaRealizacao: dados.total > 0 ? (dados.realizados / dados.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Evolução operacional mensal
    const evolucaoMensal = [];
    for (let i = periodoMeses - 1; i >= 0; i--) {
      const mes = subMonths(agora, i);
      const agendamentosMes = agendamentosFiltrados.filter(ag => {
        const dataAg = parseISO(ag.data);
        return dataAg.getMonth() === mes.getMonth() && dataAg.getFullYear() === mes.getFullYear();
      });

      const realizados = agendamentosMes.filter(ag => ag.status === 'realizado').length;
      const cancelados = agendamentosMes.filter(ag => ag.status === 'cancelado').length;
      const total = agendamentosMes.length;
      const taxaOcupacao = total > 0 ? (realizados / total) * 100 : 0;

      evolucaoMensal.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        total,
        realizados,
        cancelados,
        taxaOcupacao
      });
    }

    // Distribuição de status
    const distribuicaoStatus = agendamentosFiltrados.reduce((acc, ag) => {
      acc[ag.status] = (acc[ag.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Totais
    const totalAgendamentos = agendamentosFiltrados.length;
    const totalRealizados = agendamentosFiltrados.filter(ag => ag.status === 'realizado').length;
    const taxaOcupacaoGeral = totalAgendamentos > 0 ? (totalRealizados / totalAgendamentos) * 100 : 0;
    const profissionalMaisAtivo = produtividadeProfissional.reduce((prev, current) => 
      prev.realizados > current.realizados ? prev : current, produtividadeProfissional[0] || { nome: 'N/A', realizados: 0 });

    return {
      produtividadeProfissional,
      utilizacaoLocal,
      horariosPico: horariosPicoArray,
      servicosDemandados: servicosDemandadosArray,
      evolucaoMensal,
      distribuicaoStatus: Object.entries(distribuicaoStatus).map(([status, quantidade]) => ({ status, quantidade })),
      totalAgendamentos,
      totalRealizados,
      taxaOcupacaoGeral,
      profissionalMaisAtivo
    };
  }, [agendamentos, profissionais, locais, servicos, periodoMeses, localSelecionado]);

  const CORES = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--secondary))'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Operacionais</h1>
          <p className="text-muted-foreground">Análise de produtividade e eficiência operacional</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={periodoMeses.toString()} onValueChange={(value) => setPeriodoMeses(Number(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={localSelecionado} onValueChange={setLocalSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os locais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os locais</SelectItem>
              {locais.map(local => (
                <SelectItem key={local.id} value={local.id}>{local.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Atendimentos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dadosProcessados.totalAgendamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dadosProcessados.taxaOcupacaoGeral.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atendimentos Realizados</CardTitle>
            <User className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{dadosProcessados.totalRealizados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profissional Mais Ativo</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">{dadosProcessados.profissionalMaisAtivo?.nome}</div>
            <p className="text-xs text-muted-foreground">
              {dadosProcessados.profissionalMaisAtivo?.realizados} atendimentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Operacional Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Operacional Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosProcessados.evolucaoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="realizados" stroke="hsl(var(--success))" strokeWidth={2} name="Realizados" />
                <Line type="monotone" dataKey="cancelados" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cancelados" />
                <Line type="monotone" dataKey="taxaOcupacao" stroke="hsl(var(--primary))" strokeWidth={2} name="Taxa Ocupação %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtividade por Profissional */}
        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.produtividadeProfissional.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="realizados" fill="hsl(var(--success))" name="Realizados" />
                <Bar dataKey="cancelados" fill="hsl(var(--destructive))" name="Cancelados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horários de Pico */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.horariosPico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="horario" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilização por Local */}
        <Card>
          <CardHeader>
            <CardTitle>Utilização por Local</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.utilizacaoLocal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="realizados" fill="hsl(var(--success))" name="Realizados" />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Serviços Mais Demandados */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Demandados</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosProcessados.servicosDemandados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="servico" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(var(--primary))" name="Total de Solicitações" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useDataSource } from '@/lib/apiMigration';
import { Agendamento, Usuario, Servico, LocalAtendimento } from '@/types';
import { format, subMonths, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosAgendamentos() {
  const [periodoMeses, setPeriodoMeses] = useState<number>(6);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('todos');
  const [localSelecionado, setLocalSelecionado] = useState<string>('todos');

  const { data: agendamentos } = useDataSource<Agendamento[]>('nutriapp-agendamentos', []);
  const { data: usuarios } = useDataSource<Usuario[]>('nutriapp-usuarios', []);
  const { data: servicos } = useDataSource<Servico[]>('nutriapp-servicos', []);
  const { data: locais } = useDataSource<LocalAtendimento[]>('nutriapp-locais', []);

  const profissionais = usuarios.filter(u => u.role === 'profissional');

  // Dados processados
  const dadosProcessados = useMemo(() => {
    const agora = new Date();
    const dataLimite = subMonths(agora, periodoMeses);

    let agendamentosFiltrados = agendamentos.filter(ag => {
      const dataAgendamento = parseISO(ag.data);
      return isWithinInterval(dataAgendamento, { start: dataLimite, end: agora });
    });

    if (profissionalSelecionado && profissionalSelecionado !== 'todos') {
      agendamentosFiltrados = agendamentosFiltrados.filter(ag => ag.profissionalId === profissionalSelecionado);
    }

    if (localSelecionado && localSelecionado !== 'todos') {
      agendamentosFiltrados = agendamentosFiltrados.filter(ag => ag.localId === localSelecionado);
    }

    // Agendamentos por status
    const porStatus = agendamentosFiltrados.reduce((acc, ag) => {
      acc[ag.status] = (acc[ag.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agendamentos por mês
    const agendamentosPorMes = [];
    for (let i = periodoMeses - 1; i >= 0; i--) {
      const mes = subMonths(agora, i);
      const agendamentosDoMes = agendamentosFiltrados.filter(ag => {
        const dataAg = parseISO(ag.data);
        return dataAg.getMonth() === mes.getMonth() && dataAg.getFullYear() === mes.getFullYear();
      });

      const realizados = agendamentosDoMes.filter(ag => ag.status === 'realizado').length;
      const cancelados = agendamentosDoMes.filter(ag => ag.status === 'cancelado').length;
      const agendados = agendamentosDoMes.filter(ag => ag.status === 'agendado').length;

      agendamentosPorMes.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        realizados,
        cancelados,
        agendados,
        total: agendamentosDoMes.length
      });
    }

    // Agendamentos por profissional
    const porProfissional = agendamentosFiltrados.reduce((acc, ag) => {
      const prof = profissionais.find(p => p.id === ag.profissionalId);
      const nome = prof?.nome || 'Profissional não encontrado';
      
      if (!acc[nome]) {
        acc[nome] = { realizados: 0, cancelados: 0, total: 0 };
      }
      
      acc[nome].total++;
      if (ag.status === 'realizado') acc[nome].realizados++;
      if (ag.status === 'cancelado') acc[nome].cancelados++;
      
      return acc;
    }, {} as Record<string, { realizados: number; cancelados: number; total: number }>);

    // Agendamentos por local
    const porLocal = agendamentosFiltrados.reduce((acc, ag) => {
      const local = locais.find(l => l.id === ag.localId);
      const nome = local?.nome || 'Local não encontrado';
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agendamentos por serviço
    const porServico = agendamentosFiltrados.reduce((acc, ag) => {
      ag.servicosNomes.forEach(servicoNome => {
        acc[servicoNome] = (acc[servicoNome] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Taxa de no-show
    const totalAgendamentos = agendamentosFiltrados.length;
    const realizados = porStatus.realizado || 0;
    const cancelados = porStatus.cancelado || 0;
    const taxaRealizacao = totalAgendamentos > 0 ? (realizados / totalAgendamentos) * 100 : 0;
    const taxaCancelamento = totalAgendamentos > 0 ? (cancelados / totalAgendamentos) * 100 : 0;

    return {
      porStatus: Object.entries(porStatus).map(([status, quantidade]) => ({ status, quantidade })),
      agendamentosPorMes,
      porProfissional: Object.entries(porProfissional).map(([nome, dados]) => ({
        nome,
        ...dados,
        taxaRealizacao: dados.total > 0 ? (dados.realizados / dados.total) * 100 : 0
      })),
      porLocal: Object.entries(porLocal).map(([local, quantidade]) => ({ local, quantidade })),
      porServico: Object.entries(porServico).map(([servico, quantidade]) => ({ servico, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade).slice(0, 10),
      totalAgendamentos,
      realizados,
      cancelados,
      agendados: porStatus.agendado || 0,
      taxaRealizacao,
      taxaCancelamento
    };
  }, [agendamentos, profissionais, locais, periodoMeses, profissionalSelecionado, localSelecionado]);

  const CORES = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios de Agendamentos</h1>
          <p className="text-muted-foreground">Análise de produtividade e ocupação da agenda</p>
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

          <Select value={profissionalSelecionado} onValueChange={setProfissionalSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os profissionais</SelectItem>
              {profissionais.map(prof => (
                <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={localSelecionado} onValueChange={setLocalSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os locais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os locais</SelectItem>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dadosProcessados.totalAgendamentos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Realizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{dadosProcessados.realizados}</div>
            <p className="text-xs text-muted-foreground">
              {dadosProcessados.taxaRealizacao.toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{dadosProcessados.cancelados}</div>
            <p className="text-xs text-muted-foreground">
              {dadosProcessados.taxaCancelamento.toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Realização</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dadosProcessados.taxaRealizacao.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.agendamentosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="realizados" fill="hsl(var(--success))" name="Realizados" />
                <Bar dataKey="cancelados" fill="hsl(var(--destructive))" name="Cancelados" />
                <Bar dataKey="agendados" fill="hsl(var(--warning))" name="Agendados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosProcessados.porStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {dadosProcessados.porStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
              <BarChart data={dadosProcessados.porProfissional.slice(0, 5)}>
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

        {/* Serviços Mais Solicitados */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.porServico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="servico" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Users, TrendingUp, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useDataSource } from '@/lib/apiMigration';
import { ProgramaNutricional, ClientePrograma, Cliente } from '@/types';
import { format, subMonths, parseISO, isWithinInterval, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosProgramas() {
  const [periodoMeses, setPeriodoMeses] = useState<number>(12);
  const [programaSelecionado, setProgramaSelecionado] = useState<string>('');

  const { data: programas } = useDataSource<ProgramaNutricional[]>('nutriapp-programas', []);
  const { data: clientesProgramas } = useDataSource<ClientePrograma[]>('nutriapp-cliente-programas', []);
  const { data: clientes } = useDataSource<Cliente[]>('nutriapp-clientes', []);

  // Dados processados
  const dadosProcessados = useMemo(() => {
    const agora = new Date();
    const dataLimite = subMonths(agora, periodoMeses);

    let clientesProgramasFiltrados = clientesProgramas.filter(cp => {
      const dataInicio = parseISO(cp.dataInicio);
      return isWithinInterval(dataInicio, { start: dataLimite, end: agora });
    });

    if (programaSelecionado) {
      clientesProgramasFiltrados = clientesProgramasFiltrados.filter(cp => cp.programaId === programaSelecionado);
    }

    // Adesão por programa
    const adesaoPorPrograma = programas.map(programa => {
      const clientesDoPrograma = clientesProgramasFiltrados.filter(cp => cp.programaId === programa.id);
      const clientesAtivos = clientesDoPrograma.filter(cp => cp.ativo).length;
      const clientesInativos = clientesDoPrograma.filter(cp => !cp.ativo).length;
      const receitaTotal = clientesDoPrograma.reduce((acc, cp) => acc + cp.preco, 0);

      return {
        nome: programa.nome,
        total: clientesDoPrograma.length,
        ativos: clientesAtivos,
        inativos: clientesInativos,
        receita: receitaTotal,
        taxaAdesao: clientesDoPrograma.length > 0 ? (clientesAtivos / clientesDoPrograma.length) * 100 : 0
      };
    }).filter(item => item.total > 0);

    // Evolução mensal de adesões
    const adesoesPorMes = [];
    for (let i = periodoMeses - 1; i >= 0; i--) {
      const mes = subMonths(agora, i);
      const adesoesMes = clientesProgramasFiltrados.filter(cp => {
        const dataInicio = parseISO(cp.dataInicio);
        return dataInicio.getMonth() === mes.getMonth() && dataInicio.getFullYear() === mes.getFullYear();
      });

      const receitaMes = adesoesMes.reduce((acc, cp) => acc + cp.preco, 0);

      adesoesPorMes.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        adesoes: adesoesMes.length,
        receita: receitaMes
      });
    }

    // Duração média dos programas
    const duracaoMedia = clientesProgramasFiltrados.map(cp => {
      const dataInicio = parseISO(cp.dataInicio);
      const dataFim = cp.dataFim ? parseISO(cp.dataFim) : agora;
      return differenceInDays(dataFim, dataInicio);
    });

    const duracaoMediaDias = duracaoMedia.length > 0 ? 
      duracaoMedia.reduce((acc, dias) => acc + dias, 0) / duracaoMedia.length : 0;

    // Status dos programas
    const statusProgramas = clientesProgramasFiltrados.reduce((acc, cp) => {
      const status = cp.ativo ? 'Ativo' : 'Inativo';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Receita por programa
    const receitaPorPrograma = adesaoPorPrograma
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 8);

    // Programas mais populares
    const programasPopulares = adesaoPorPrograma
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Totais
    const totalClientes = clientesProgramasFiltrados.length;
    const clientesAtivos = clientesProgramasFiltrados.filter(cp => cp.ativo).length;
    const receitaTotal = clientesProgramasFiltrados.reduce((acc, cp) => acc + cp.preco, 0);
    const precoMedio = totalClientes > 0 ? receitaTotal / totalClientes : 0;

    return {
      adesaoPorPrograma,
      adesoesPorMes,
      statusProgramas: Object.entries(statusProgramas).map(([status, quantidade]) => ({ status, quantidade })),
      receitaPorPrograma,
      programasPopulares,
      totalClientes,
      clientesAtivos,
      receitaTotal,
      precoMedio,
      duracaoMediaDias,
      taxaRetencao: totalClientes > 0 ? (clientesAtivos / totalClientes) * 100 : 0
    };
  }, [programas, clientesProgramas, clientes, periodoMeses, programaSelecionado]);

  const CORES = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios de Programas</h1>
          <p className="text-muted-foreground">Análise de performance e adesão aos programas nutricionais</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={periodoMeses.toString()} onValueChange={(value) => setPeriodoMeses(Number(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Últimos 12 meses</SelectItem>
              <SelectItem value="24">Últimos 24 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={programaSelecionado} onValueChange={setProgramaSelecionado}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os programas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os programas</SelectItem>
              {programas.map(programa => (
                <SelectItem key={programa.id} value={programa.id}>{programa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dadosProcessados.totalClientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{dadosProcessados.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {dadosProcessados.taxaRetencao.toFixed(1)}% de retenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {dadosProcessados.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preço Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {dadosProcessados.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Duração média: {dadosProcessados.duracaoMediaDias.toFixed(0)} dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Adesões */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Adesões Mensais</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosProcessados.adesoesPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="adesoes" stroke="hsl(var(--primary))" strokeWidth={2} name="Adesões" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Programas */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Programas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosProcessados.statusProgramas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  <Cell fill="hsl(var(--success))" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Programas Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Programas Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.programasPopulares}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total de Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita por Programa */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.receitaPorPrograma}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="receita" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Programa</th>
                  <th className="text-right p-2">Total Clientes</th>
                  <th className="text-right p-2">Ativos</th>
                  <th className="text-right p-2">Taxa Adesão</th>
                  <th className="text-right p-2">Receita</th>
                </tr>
              </thead>
              <tbody>
                {dadosProcessados.adesaoPorPrograma.map((programa) => (
                  <tr key={programa.nome} className="border-b">
                    <td className="p-2">{programa.nome}</td>
                    <td className="text-right p-2">{programa.total}</td>
                    <td className="text-right p-2">{programa.ativos}</td>
                    <td className="text-right p-2">{programa.taxaAdesao.toFixed(1)}%</td>
                    <td className="text-right p-2">
                      R$ {programa.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
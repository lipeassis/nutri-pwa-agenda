import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useDataSource } from '@/lib/apiMigration';
import { Agendamento, TransacaoFinanceira, Servico, Convenio } from '@/types';
import { format, subMonths, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosFinanceiro() {
  const [periodoMeses, setPeriodoMeses] = useState<number>(12);
  const [tipoAnalise, setTipoAnalise] = useState<string>('receita');

  const { data: agendamentos } = useDataSource<Agendamento[]>('nutriapp-agendamentos', []);
  const { data: transacoes } = useDataSource<TransacaoFinanceira[]>('nutriapp-transacoes', []);
  const { data: servicos } = useDataSource<Servico[]>('nutriapp-servicos', []);
  const { data: convenios } = useDataSource<Convenio[]>('nutriapp-convenios', []);

  // Função para calcular valor da consulta
  const calcularValorConsulta = (agendamento: Agendamento): number => {
    let valorTotal = 0;
    
    agendamento.servicosIds.forEach(servicoId => {
      const servico = servicos.find(s => s.id === servicoId);
      if (servico) {
        if (agendamento.convenioId && servico.valoresConvenios[agendamento.convenioId]) {
          valorTotal += servico.valoresConvenios[agendamento.convenioId];
        } else {
          valorTotal += servico.valorParticular;
        }
      }
    });
    
    return valorTotal;
  };

  // Dados processados
  const dadosProcessados = useMemo(() => {
    const agora = new Date();
    const dataLimite = subMonths(agora, periodoMeses);

    // Filtrar dados pelo período
    const agendamentosPeriodo = agendamentos.filter(ag => {
      const dataAg = parseISO(ag.data);
      return isWithinInterval(dataAg, { start: dataLimite, end: agora }) && ag.status === 'realizado';
    });

    const transacoesPeriodo = transacoes.filter(tr => {
      const datatr = parseISO(tr.data);
      return isWithinInterval(datatr, { start: dataLimite, end: agora });
    });

    // Receita por mês dos agendamentos
    const receitaPorMes = [];
    for (let i = periodoMeses - 1; i >= 0; i--) {
      const mes = subMonths(agora, i);
      const agendamentosDoMes = agendamentosPeriodo.filter(ag => {
        const dataAg = parseISO(ag.data);
        return dataAg.getMonth() === mes.getMonth() && dataAg.getFullYear() === mes.getFullYear();
      });

      const receitaConsultas = agendamentosDoMes.reduce((acc, ag) => acc + calcularValorConsulta(ag), 0);
      
      const transacoesDoMes = transacoesPeriodo.filter(tr => {
        const dataTr = parseISO(tr.data);
        return dataTr.getMonth() === mes.getMonth() && dataTr.getFullYear() === mes.getFullYear();
      });

      const entradas = transacoesDoMes.filter(tr => tr.tipo === 'entrada').reduce((acc, tr) => acc + tr.valor, 0);
      const saidas = transacoesDoMes.filter(tr => tr.tipo === 'saida').reduce((acc, tr) => acc + tr.valor, 0);

      receitaPorMes.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        consultas: receitaConsultas,
        entradas: entradas + receitaConsultas,
        saidas,
        lucro: (entradas + receitaConsultas) - saidas,
        consultasQtd: agendamentosDoMes.length
      });
    }

    // Receita por serviço
    const receitaPorServico = agendamentosPeriodo.reduce((acc, ag) => {
      ag.servicosIds.forEach((servicoId, index) => {
        const servicoNome = ag.servicosNomes[index] || 'Serviço não identificado';
        const servico = servicos.find(s => s.id === servicoId);
        let valor = 0;
        
        if (servico) {
          if (ag.convenioId && servico.valoresConvenios[ag.convenioId]) {
            valor = servico.valoresConvenios[ag.convenioId];
          } else {
            valor = servico.valorParticular;
          }
        }
        
        if (!acc[servicoNome]) {
          acc[servicoNome] = { receita: 0, quantidade: 0 };
        }
        
        acc[servicoNome].receita += valor;
        acc[servicoNome].quantidade += 1;
      });
      return acc;
    }, {} as Record<string, { receita: number; quantidade: number }>);

    // Receita por convênio vs particular
    const receitaPorTipo = agendamentosPeriodo.reduce((acc, ag) => {
      const valor = calcularValorConsulta(ag);
      const tipo = ag.convenioId ? ag.convenioNome || 'Convênio' : 'Particular';
      
      acc[tipo] = (acc[tipo] || 0) + valor;
      return acc;
    }, {} as Record<string, number>);

    // Despesas por categoria
    const despesasPorCategoria = transacoesPeriodo
      .filter(tr => tr.tipo === 'saida')
      .reduce((acc, tr) => {
        acc[tr.categoria] = (acc[tr.categoria] || 0) + tr.valor;
        return acc;
      }, {} as Record<string, number>);

    // Totais
    const totalReceita = receitaPorMes.reduce((acc, mes) => acc + mes.entradas, 0);
    const totalDespesas = receitaPorMes.reduce((acc, mes) => acc + mes.saidas, 0);
    const lucroTotal = totalReceita - totalDespesas;
    const ticketMedio = agendamentosPeriodo.length > 0 ? 
      agendamentosPeriodo.reduce((acc, ag) => acc + calcularValorConsulta(ag), 0) / agendamentosPeriodo.length : 0;

    return {
      receitaPorMes,
      receitaPorServico: Object.entries(receitaPorServico).map(([servico, dados]) => ({
        servico,
        ...dados
      })).sort((a, b) => b.receita - a.receita),
      receitaPorTipo: Object.entries(receitaPorTipo).map(([tipo, receita]) => ({ tipo, receita })),
      despesasPorCategoria: Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({ categoria, valor })),
      totalReceita,
      totalDespesas,
      lucroTotal,
      ticketMedio,
      totalConsultas: agendamentosPeriodo.length
    };
  }, [agendamentos, transacoes, servicos, convenios, periodoMeses]);

  const CORES = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análise de receitas, despesas e lucratividade</p>
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

          <Select value={tipoAnalise} onValueChange={setTipoAnalise}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesas">Despesas</SelectItem>
              <SelectItem value="lucro">Lucro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {dadosProcessados.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {dadosProcessados.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dadosProcessados.lucroTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {dadosProcessados.lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {dadosProcessados.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {dadosProcessados.totalConsultas} consultas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Financeira Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosProcessados.receitaPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Line type="monotone" dataKey="entradas" stroke="hsl(var(--success))" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" strokeWidth={2} name="Saídas" />
                <Line type="monotone" dataKey="lucro" stroke="hsl(var(--primary))" strokeWidth={2} name="Lucro" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita por Serviço */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.receitaPorServico.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="servico" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="receita" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Particular vs Convênio */}
        <Card>
          <CardHeader>
            <CardTitle>Receita: Particular vs Convênio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={dadosProcessados.receitaPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percent }) => `${tipo}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="receita"
                >
                  {dadosProcessados.receitaPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.despesasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
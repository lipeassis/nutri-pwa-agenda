import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Agendamento, Servico, Convenio } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, TrendingUp, DollarSign, FileBarChart, Download, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioFinanceiro {
  periodo: string;
  totalConsultas: number;
  totalFaturamento: number;
  consultasRealizadas: number;
  consultasCanceladas: number;
  ticketMedio: number;
}

export default function FinanceiroRelatorios() {
  const { hasPermission } = useAuth();
  const [agendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  const [servicos] = useLocalStorage<Servico[]>('nutriapp-servicos', []);
  const [convenios] = useLocalStorage<Convenio[]>('nutriapp-convenios', []);
  
  const [filtroInicio, setFiltroInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filtroFim, setFiltroFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoRelatorio, setTipoRelatorio] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes');

  if (!hasPermission(['administrador', 'profissional'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso negado. Apenas administradores e profissionais podem acessar esta página.</p>
      </div>
    );
  }

  const calcularValorConsulta = (agendamento: Agendamento): number => {
    const servico = servicos.find(s => s.id === agendamento.servicoId);
    if (!servico) return 0;

    // Se tem convênio, usar valor do convênio, senão usar valor particular
    if (agendamento.convenioId) {
      return servico.valoresConvenios[agendamento.convenioId] || 0;
    }
    
    return servico.valorParticular;
  };

  const gerarRelatorios = useMemo(() => {
    const agendamentosFiltrados = agendamentos.filter(agendamento => {
      const dataAgendamento = parseISO(agendamento.data);
      const inicio = parseISO(filtroInicio);
      const fim = parseISO(filtroFim);
      
      return isWithinInterval(dataAgendamento, { start: inicio, end: fim });
    });

    const relatorios: RelatorioFinanceiro[] = [];
    const periodosMap = new Map<string, Agendamento[]>();

    agendamentosFiltrados.forEach(agendamento => {
      const dataAgendamento = parseISO(agendamento.data);
      let chave = '';

      switch (tipoRelatorio) {
        case 'dia':
          chave = format(dataAgendamento, 'dd/MM/yyyy', { locale: ptBR });
          break;
        case 'semana':
          const inicioSemana = startOfWeek(dataAgendamento, { weekStartsOn: 1 });
          const fimSemana = endOfWeek(dataAgendamento, { weekStartsOn: 1 });
          chave = `${format(inicioSemana, 'dd/MM', { locale: ptBR })} - ${format(fimSemana, 'dd/MM/yyyy', { locale: ptBR })}`;
          break;
        case 'mes':
          chave = format(dataAgendamento, 'MMMM/yyyy', { locale: ptBR });
          break;
        case 'ano':
          chave = format(dataAgendamento, 'yyyy', { locale: ptBR });
          break;
      }

      if (!periodosMap.has(chave)) {
        periodosMap.set(chave, []);
      }
      periodosMap.get(chave)!.push(agendamento);
    });

    periodosMap.forEach((agendamentosPeriodo, periodo) => {
      const consultasRealizadas = agendamentosPeriodo.filter(a => a.status === 'realizado');
      const consultasCanceladas = agendamentosPeriodo.filter(a => a.status === 'cancelado');
      
      const totalFaturamento = consultasRealizadas.reduce((total, agendamento) => {
        return total + calcularValorConsulta(agendamento);
      }, 0);

      const ticketMedio = consultasRealizadas.length > 0 ? totalFaturamento / consultasRealizadas.length : 0;

      relatorios.push({
        periodo,
        totalConsultas: agendamentosPeriodo.length,
        totalFaturamento,
        consultasRealizadas: consultasRealizadas.length,
        consultasCanceladas: consultasCanceladas.length,
        ticketMedio
      });
    });

    return relatorios.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [agendamentos, servicos, filtroInicio, filtroFim, tipoRelatorio]);

  const totaisGerais = useMemo(() => {
    return gerarRelatorios.reduce((acc, relatorio) => ({
      totalConsultas: acc.totalConsultas + relatorio.totalConsultas,
      totalFaturamento: acc.totalFaturamento + relatorio.totalFaturamento,
      consultasRealizadas: acc.consultasRealizadas + relatorio.consultasRealizadas,
      consultasCanceladas: acc.consultasCanceladas + relatorio.consultasCanceladas,
    }), {
      totalConsultas: 0,
      totalFaturamento: 0,
      consultasRealizadas: 0,
      consultasCanceladas: 0,
    });
  }, [gerarRelatorios]);

  const exportarRelatorio = () => {
    const csvData = [
      ['Período', 'Total Consultas', 'Consultas Realizadas', 'Consultas Canceladas', 'Faturamento', 'Ticket Médio'],
      ...gerarRelatorios.map(r => [
        r.periodo,
        r.totalConsultas.toString(),
        r.consultasRealizadas.toString(),
        r.consultasCanceladas.toString(),
        `R$ ${r.totalFaturamento.toFixed(2)}`,
        `R$ ${r.ticketMedio.toFixed(2)}`
      ])
    ];

    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho financeiro dos agendamentos</p>
        </div>
        
        <Button onClick={exportarRelatorio} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={filtroInicio}
                onChange={(e) => setFiltroInicio(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={filtroFim}
                onChange={(e) => setFiltroFim(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Agrupamento</Label>
              <Select value={tipoRelatorio} onValueChange={(value: any) => setTipoRelatorio(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Por Dia</SelectItem>
                  <SelectItem value="semana">Por Semana</SelectItem>
                  <SelectItem value="mes">Por Mês</SelectItem>
                  <SelectItem value="ano">Por Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totaisGerais.totalConsultas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totaisGerais.consultasRealizadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totaisGerais.totalFaturamento.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Realização</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totaisGerais.totalConsultas > 0 
                ? `${((totaisGerais.consultasRealizadas / totaisGerais.totalConsultas) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Relatório Detalhado - {tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gerarRelatorios.length === 0 ? (
            <div className="text-center py-8">
              <FileBarChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum dado encontrado</h3>
              <p className="text-muted-foreground">
                Não há agendamentos no período selecionado
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-center">Total Consultas</TableHead>
                  <TableHead className="text-center">Realizadas</TableHead>
                  <TableHead className="text-center">Canceladas</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gerarRelatorios.map((relatorio, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{relatorio.periodo}</TableCell>
                    <TableCell className="text-center">{relatorio.totalConsultas}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">{relatorio.consultasRealizadas}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">{relatorio.consultasCanceladas}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      R$ {relatorio.totalFaturamento.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {relatorio.ticketMedio.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Agendamento, Servico, Convenio, Usuario, TransacaoFinanceira, RelatorioFinanceiro } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, TrendingUp, TrendingDown, DollarSign, FileBarChart, Download, Filter, Plus, User, Wrench, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function FinanceiroRelatorios() {
  const { user, hasPermission } = useAuth();
  const [agendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  const [servicos] = useLocalStorage<Servico[]>('nutriapp-servicos', []);
  const [convenios] = useLocalStorage<Convenio[]>('nutriapp-convenios', []);
  const [usuarios] = useLocalStorage<Usuario[]>('system_users', []);
  const [transacoes, setTransacoes] = useLocalStorage<TransacaoFinanceira[]>('nutriapp-transacoes', []);
  
  const [filtroInicio, setFiltroInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filtroFim, setFiltroFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoRelatorio, setTipoRelatorio] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('todos');
  const [filtroServico, setFiltroServico] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entradas' | 'saidas'>('todos');

  // Estados para nova transação
  const [showNovaTransacao, setShowNovaTransacao] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: 'receita_extra' as 'agendamento' | 'despesa' | 'receita_extra',
    descricao: '',
    valor: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    usuarioId: '',
    servicoId: '',
    observacoes: ''
  });

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

    if (agendamento.convenioId) {
      return servico.valoresConvenios[agendamento.convenioId] || 0;
    }
    
    return servico.valorParticular;
  };

  // Gerar transações automaticamente dos agendamentos realizados
  const transacoesCompletas = useMemo(() => {
    const transacoesExistentes = [...transacoes];
    
    // Adicionar transações dos agendamentos realizados
    const agendamentosRealizados = agendamentos.filter(a => a.status === 'realizado');
    
    agendamentosRealizados.forEach(agendamento => {
      const transacaoExiste = transacoesExistentes.find(t => t.agendamentoId === agendamento.id);
      
      if (!transacaoExiste) {
        const valor = calcularValorConsulta(agendamento);
        if (valor > 0) {
          transacoesExistentes.push({
            id: `agendamento_${agendamento.id}`,
            tipo: 'entrada',
            categoria: 'agendamento',
            descricao: `Consulta - ${agendamento.servicoNome} - ${agendamento.clienteNome}`,
            valor,
            data: agendamento.data,
            usuarioId: agendamento.profissionalId,
            servicoId: agendamento.servicoId,
            agendamentoId: agendamento.id,
            criadoEm: agendamento.criadoEm,
            criadoPor: agendamento.profissionalId
          });
        }
      }
    });

    return transacoesExistentes;
  }, [transacoes, agendamentos, servicos]);

  const dadosFiltrados = useMemo(() => {
    return transacoesCompletas.filter(transacao => {
      const dataTransacao = parseISO(transacao.data);
      const inicio = parseISO(filtroInicio);
      const fim = parseISO(filtroFim);
      
      const dentroIntervaloDatas = isWithinInterval(dataTransacao, { start: inicio, end: fim });
      const filtroUsuarioOk = filtroUsuario === 'todos' || transacao.usuarioId === filtroUsuario;
      const filtroServicoOk = filtroServico === 'todos' || transacao.servicoId === filtroServico;
      const filtroTipoOk = filtroTipo === 'todos' || 
                          (filtroTipo === 'entradas' && transacao.tipo === 'entrada') ||
                          (filtroTipo === 'saidas' && transacao.tipo === 'saida');
      
      return dentroIntervaloDatas && filtroUsuarioOk && filtroServicoOk && filtroTipoOk;
    });
  }, [transacoesCompletas, filtroInicio, filtroFim, filtroUsuario, filtroServico, filtroTipo]);

  const gerarRelatorios = useMemo(() => {
    const relatorios: RelatorioFinanceiro[] = [];
    const periodosMap = new Map<string, TransacaoFinanceira[]>();

    dadosFiltrados.forEach(transacao => {
      const dataTransacao = parseISO(transacao.data);
      let chave = '';

      switch (tipoRelatorio) {
        case 'dia':
          chave = format(dataTransacao, 'dd/MM/yyyy', { locale: ptBR });
          break;
        case 'semana':
          const inicioSemana = startOfWeek(dataTransacao, { weekStartsOn: 1 });
          const fimSemana = endOfWeek(dataTransacao, { weekStartsOn: 1 });
          chave = `${format(inicioSemana, 'dd/MM', { locale: ptBR })} - ${format(fimSemana, 'dd/MM/yyyy', { locale: ptBR })}`;
          break;
        case 'mes':
          chave = format(dataTransacao, 'MMMM/yyyy', { locale: ptBR });
          break;
        case 'ano':
          chave = format(dataTransacao, 'yyyy', { locale: ptBR });
          break;
      }

      if (!periodosMap.has(chave)) {
        periodosMap.set(chave, []);
      }
      periodosMap.get(chave)!.push(transacao);
    });

    periodosMap.forEach((transacoesPeriodo, periodo) => {
      const consultasRealizadas = transacoesPeriodo.filter(t => t.categoria === 'agendamento').length;
      const totalEntradas = transacoesPeriodo.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + t.valor, 0);
      const totalSaidas = transacoesPeriodo.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + t.valor, 0);
      const totalFaturamento = transacoesPeriodo.filter(t => t.categoria === 'agendamento').reduce((sum, t) => sum + t.valor, 0);
      const ticketMedio = consultasRealizadas > 0 ? totalFaturamento / consultasRealizadas : 0;

      relatorios.push({
        periodo,
        totalConsultas: consultasRealizadas,
        totalFaturamento,
        consultasRealizadas,
        consultasCanceladas: 0, // Não temos dados de cancelados nas transações
        ticketMedio,
        totalEntradas,
        totalSaidas,
        lucroLiquido: totalEntradas - totalSaidas
      });
    });

    return relatorios.sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [dadosFiltrados, tipoRelatorio]);

  const totaisGerais = useMemo(() => {
    return gerarRelatorios.reduce((acc, relatorio) => ({
      totalConsultas: acc.totalConsultas + relatorio.totalConsultas,
      totalFaturamento: acc.totalFaturamento + relatorio.totalFaturamento,
      consultasRealizadas: acc.consultasRealizadas + relatorio.consultasRealizadas,
      consultasCanceladas: acc.consultasCanceladas + relatorio.consultasCanceladas,
      totalEntradas: acc.totalEntradas + relatorio.totalEntradas,
      totalSaidas: acc.totalSaidas + relatorio.totalSaidas,
      lucroLiquido: acc.lucroLiquido + relatorio.lucroLiquido,
    }), {
      totalConsultas: 0,
      totalFaturamento: 0,
      consultasRealizadas: 0,
      consultasCanceladas: 0,
      totalEntradas: 0,
      totalSaidas: 0,
      lucroLiquido: 0,
    });
  }, [gerarRelatorios]);

  const profissionais = usuarios.filter(u => u.role === 'profissional' && u.ativo);

  const handleNovaTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaTransacao.descricao || !novaTransacao.valor) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const novaTransacaoObj: TransacaoFinanceira = {
      id: Date.now().toString(),
      tipo: novaTransacao.tipo,
      categoria: novaTransacao.categoria,
      descricao: novaTransacao.descricao,
      valor: parseFloat(novaTransacao.valor),
      data: novaTransacao.data,
      usuarioId: novaTransacao.usuarioId || undefined,
      servicoId: novaTransacao.servicoId || undefined,
      observacoes: novaTransacao.observacoes || undefined,
      criadoEm: new Date().toISOString(),
      criadoPor: user?.id || 'unknown'
    };

    setTransacoes([...transacoes, novaTransacaoObj]);
    setNovaTransacao({
      tipo: 'entrada',
      categoria: 'receita_extra',
      descricao: '',
      valor: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      usuarioId: '',
      servicoId: '',
      observacoes: ''
    });
    setShowNovaTransacao(false);
    toast.success('Transação adicionada com sucesso');
  };

  const exportarRelatorio = () => {
    const csvData = [
      ['Período', 'Consultas', 'Faturamento', 'Total Entradas', 'Total Saídas', 'Lucro Líquido', 'Ticket Médio'],
      ...gerarRelatorios.map(r => [
        r.periodo,
        r.consultasRealizadas.toString(),
        `R$ ${r.totalFaturamento.toFixed(2)}`,
        `R$ ${r.totalEntradas.toFixed(2)}`,
        `R$ ${r.totalSaidas.toFixed(2)}`,
        `R$ ${r.lucroLiquido.toFixed(2)}`,
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
          <p className="text-muted-foreground">Controle financeiro completo com entradas e saídas</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showNovaTransacao} onOpenChange={setShowNovaTransacao}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNovaTransacao} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={novaTransacao.tipo} onValueChange={(value: 'entrada' | 'saida') => setNovaTransacao({...novaTransacao, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={novaTransacao.categoria} onValueChange={(value: any) => setNovaTransacao({...novaTransacao, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendamento">Agendamento</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="receita_extra">Receita Extra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Input 
                    value={novaTransacao.descricao}
                    onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={novaTransacao.valor}
                      onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input 
                      type="date"
                      value={novaTransacao.data}
                      onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Profissional (opcional)</Label>
                    <Select value={novaTransacao.usuarioId || 'none'} onValueChange={(value) => setNovaTransacao({...novaTransacao, usuarioId: value === 'none' ? '' : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {profissionais.map(prof => (
                          <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Serviço (opcional)</Label>
                    <Select value={novaTransacao.servicoId || 'none'} onValueChange={(value) => setNovaTransacao({...novaTransacao, servicoId: value === 'none' ? '' : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {servicos.filter(s => s.ativo).map(servico => (
                          <SelectItem key={servico.id} value={servico.id}>{servico.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={novaTransacao.observacoes}
                    onChange={(e) => setNovaTransacao({...novaTransacao, observacoes: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Adicionar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNovaTransacao(false)}>Cancelar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportarRelatorio} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
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
            
            <div>
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entradas">Entradas</SelectItem>
                  <SelectItem value="saidas">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Profissional</Label>
              <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {profissionais.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Serviço</Label>
              <Select value={filtroServico} onValueChange={setFiltroServico}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {servicos.filter(s => s.ativo).map(servico => (
                    <SelectItem key={servico.id} value={servico.id}>{servico.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltroUsuario('todos');
                  setFiltroServico('todos');
                  setFiltroTipo('todos');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totaisGerais.totalEntradas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totaisGerais.totalSaidas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totaisGerais.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {totaisGerais.lucroLiquido.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totaisGerais.consultasRealizadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totaisGerais.consultasRealizadas > 0 ? (totaisGerais.totalFaturamento / totaisGerais.consultasRealizadas).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Relatórios */}
      <Tabs defaultValue="relatorio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="relatorio">Relatório Consolidado</TabsTrigger>
          <TabsTrigger value="transacoes">Transações Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="relatorio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5" />
                Relatório Consolidado - {tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gerarRelatorios.length === 0 ? (
                <div className="text-center py-8">
                  <FileBarChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum dado encontrado</h3>
                  <p className="text-muted-foreground">
                    Não há transações no período selecionado
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-center">Consultas</TableHead>
                      <TableHead className="text-right">Entradas</TableHead>
                      <TableHead className="text-right">Saídas</TableHead>
                      <TableHead className="text-right">Lucro Líquido</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gerarRelatorios.map((relatorio, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{relatorio.periodo}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">{relatorio.consultasRealizadas}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          R$ {relatorio.totalEntradas.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          R$ {relatorio.totalSaidas.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${relatorio.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {relatorio.lucroLiquido.toFixed(2)}
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
        </TabsContent>

        <TabsContent value="transacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Transações Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
                  <p className="text-muted-foreground">
                    Não há transações no período selecionado com os filtros aplicados
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosFiltrados
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((transacao) => {
                        const profissional = usuarios.find(u => u.id === transacao.usuarioId);
                        const servico = servicos.find(s => s.id === transacao.servicoId);
                        
                        return (
                          <TableRow key={transacao.id}>
                            <TableCell>
                              {format(parseISO(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transacao.tipo === 'entrada' ? 'default' : 'destructive'}>
                                {transacao.tipo === 'entrada' ? (
                                  <ArrowUpCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowDownCircle className="w-3 h-3 mr-1" />
                                )}
                                {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transacao.categoria === 'agendamento' ? 'Agendamento' :
                                 transacao.categoria === 'despesa' ? 'Despesa' : 'Receita Extra'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {transacao.descricao}
                            </TableCell>
                            <TableCell>
                              {profissional ? profissional.nome : '-'}
                            </TableCell>
                            <TableCell>
                              {servico ? servico.nome : '-'}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                              {transacao.tipo === 'entrada' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    }
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
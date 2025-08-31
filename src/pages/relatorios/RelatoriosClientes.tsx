import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useDataSource } from '@/lib/apiMigration';
import { Cliente, Agendamento, ObjetivosCliente } from '@/types';
import { format, subMonths, isAfter, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatoriosClientes() {
  const [filtroIdade, setFiltroIdade] = useState<string>('');
  const [filtroObjetivo, setFiltroObjetivo] = useState<string>('');
  const [periodoMeses, setPeriodoMeses] = useState<number>(12);

  const { data: clientes } = useDataSource<Cliente[]>('nutriapp-clientes', []);
  const { data: agendamentos } = useDataSource<Agendamento[]>('nutriapp-agendamentos', []);
  const { data: objetivos } = useDataSource<ObjetivosCliente[]>('nutriapp-objetivos', []);

  // Dados processados
  const dadosProcessados = useMemo(() => {
    const agora = new Date();
    const dataLimite = subMonths(agora, periodoMeses);

    // Clientes por faixa etária
    const faixasEtarias = clientes.reduce((acc, cliente) => {
      const idade = differenceInYears(agora, parseISO(cliente.dataNascimento));
      let faixa = '';
      if (idade < 18) faixa = '< 18';
      else if (idade < 30) faixa = '18-29';
      else if (idade < 40) faixa = '30-39';
      else if (idade < 50) faixa = '40-49';
      else if (idade < 60) faixa = '50-59';
      else faixa = '60+';
      
      acc[faixa] = (acc[faixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Novos clientes por mês
    const clientesPorMes = [];
    for (let i = periodoMeses - 1; i >= 0; i--) {
      const mes = subMonths(agora, i);
      const clientesDoMes = clientes.filter(cliente => {
        const dataCliente = parseISO(cliente.criadoEm);
        return dataCliente.getMonth() === mes.getMonth() && 
               dataCliente.getFullYear() === mes.getFullYear();
      }).length;
      
      clientesPorMes.push({
        mes: format(mes, 'MMM/yy', { locale: ptBR }),
        quantidade: clientesDoMes
      });
    }

    // Objetivos mais comuns
    const objetivosComuns = clientes.reduce((acc, cliente) => {
      const objetivo = cliente.objetivos?.toLowerCase() || 'não informado';
      const palavrasChave = ['emagrecer', 'ganhar peso', 'ganhar massa', 'manter peso', 'saúde', 'performance'];
      
      let categoria = 'outros';
      for (const palavra of palavrasChave) {
        if (objetivo.includes(palavra)) {
          categoria = palavra === 'ganhar massa' ? 'ganhar massa muscular' : palavra;
          break;
        }
      }
      
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status de atividade dos clientes
    const clientesAtivos = clientes.filter(cliente => {
      const ultimaConsulta = agendamentos
        .filter(ag => ag.clienteId === cliente.id && ag.status === 'realizado')
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
      
      if (!ultimaConsulta) return false;
      return isAfter(parseISO(ultimaConsulta.data), dataLimite);
    }).length;

    return {
      faixasEtarias: Object.entries(faixasEtarias).map(([faixa, quantidade]) => ({ faixa, quantidade })),
      clientesPorMes,
      objetivosComuns: Object.entries(objetivosComuns).map(([objetivo, quantidade]) => ({ objetivo, quantidade })),
      totalClientes: clientes.length,
      clientesAtivos,
      clientesInativos: clientes.length - clientesAtivos,
      novosEsteMes: clientes.filter(c => 
        parseISO(c.criadoEm).getMonth() === agora.getMonth() &&
        parseISO(c.criadoEm).getFullYear() === agora.getFullYear()
      ).length
    };
  }, [clientes, agendamentos, periodoMeses]);

  const CORES = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios de Clientes</h1>
          <p className="text-muted-foreground">Análise demográfica e evolução da base de clientes</p>
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
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dadosProcessados.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {((dadosProcessados.clientesAtivos / dadosProcessados.totalClientes) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dadosProcessados.novosEsteMes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Retenção</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {((dadosProcessados.clientesAtivos / dadosProcessados.totalClientes) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Novos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Novos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosProcessados.clientesPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantidade" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Faixa Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcessados.faixasEtarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Objetivos Mais Comuns */}
        <Card>
          <CardHeader>
            <CardTitle>Objetivos Mais Comuns</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosProcessados.objetivosComuns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ objetivo, percent }) => `${objetivo}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {dadosProcessados.objetivosComuns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Atividade dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Ativos', value: dadosProcessados.clientesAtivos },
                    { name: 'Inativos', value: dadosProcessados.clientesInativos }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="hsl(var(--success))" />
                  <Cell fill="hsl(var(--destructive))" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, Agendamento } from "@/types";
import { Users, Calendar, Clock, TrendingUp, Plus, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Dashboard() {
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [agendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);

  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje);
  const proximosAgendamentos = agendamentos
    .filter(ag => ag.data >= hoje && ag.status === 'agendado')
    .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))
    .slice(0, 5);

  const formatarDataHora = (data: string, hora: string) => {
    const dataObj = new Date(`${data}T${hora}`);
    if (isToday(dataObj)) return `Hoje às ${hora}`;
    if (isTomorrow(dataObj)) return `Amanhã às ${hora}`;
    return `${format(dataObj, "dd/MM", { locale: ptBR })} às ${hora}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo da sua prática.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Clientes"
          value={clientes.length}
          icon={Users}
          description="Clientes cadastrados"
        />
        <StatsCard
          title="Agendamentos Hoje"
          value={agendamentosHoje.length}
          icon={Calendar}
          description="Consultas programadas"
        />
        <StatsCard
          title="Próximos 7 dias"
          value={agendamentos.filter(ag => {
            const dataAg = new Date(ag.data);
            const agora = new Date();
            const emSemana = new Date();
            emSemana.setDate(agora.getDate() + 7);
            return dataAg >= agora && dataAg <= emSemana && ag.status === 'agendado';
          }).length}
          icon={Clock}
          description="Agendamentos próximos"
        />
        <StatsCard
          title="Taxa de Crescimento"
          value="12%"
          icon={TrendingUp}
          description="Novos clientes este mês"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Próximos Agendamentos
              </CardTitle>
              <CardDescription>
                Suas próximas consultas programadas
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/agenda">
                <Plus className="w-4 h-4 mr-2" />
                Ver Agenda
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {proximosAgendamentos.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                <Button asChild size="sm" className="mt-2">
                  <Link to="/agenda">Agendar Consulta</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximosAgendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {agendamento.clienteNome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatarDataHora(agendamento.data, agendamento.hora)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {agendamento.servicoNome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" size="lg">
              <Link to="/clientes/novo">
                <Users className="w-5 h-5 mr-3" />
                Cadastrar Novo Cliente
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link to="/agenda/novo">
                <Calendar className="w-5 h-5 mr-3" />
                Agendar Consulta
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link to="/clientes">
                <Users className="w-5 h-5 mr-3" />
                Ver Todos os Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
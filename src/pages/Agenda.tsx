import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataSource } from "@/lib/apiMigration";
import { useAgendamentos } from "@/hooks/api/useAgendamentos";
import { Agendamento } from "@/types";
import { Search, Plus, Calendar, Clock, User, Filter, CalendarDays, CalendarIcon, List, Edit3, X } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, isPast, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ReagendarModal } from "@/components/agenda/ReagendarModal";
import { CancelarModal } from "@/components/agenda/CancelarModal";

export function Agenda() {
  const { data: agendamentos, setData: setAgendamentos } = useDataSource<Agendamento[]>('nutriapp-agendamentos', []);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroData, setFiltroData] = useState<Date | undefined>();
  const [visualizacao, setVisualizacao] = useState<"lista" | "calendario">("lista");
  
  // Estados dos modais
  const [reagendarModalOpen, setReagendarModalOpen] = useState(false);
  const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  const agendamentosFiltrados = agendamentos
    .filter(agendamento => {
      const matchBusca = agendamento.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
                        agendamento.observacoes?.toLowerCase().includes(busca.toLowerCase());
      
      const matchStatus = filtroStatus === "todos" || agendamento.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || agendamento.servicosNomes.some(nome => nome.toLowerCase().includes(filtroTipo.toLowerCase()));
      
      const matchData = !filtroData || isSameDay(new Date(agendamento.data), filtroData);
      
      return matchBusca && matchStatus && matchTipo && matchData;
    })
    .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'agendado': return 'default';
      case 'realizado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'default';
    }
  };

  const getTipoVariant = (tipo: string) => {
    switch (tipo) {
      case 'consulta': return 'default';
      case 'retorno': return 'secondary';
      case 'avaliacao': return 'outline';
      default: return 'default';
    }
  };

  const formatarDataHora = (data: string, hora: string) => {
    const dataObj = new Date(`${data}T${hora}`);
    if (isToday(dataObj)) return `Hoje às ${hora}`;
    if (isTomorrow(dataObj)) return `Amanhã às ${hora}`;
    return `${format(dataObj, "dd/MM/yyyy", { locale: ptBR })} às ${hora}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getTipoText = (tipo: string) => {
    switch (tipo) {
      case 'consulta': return 'Consulta';
      case 'retorno': return 'Retorno';
      case 'avaliacao': return 'Avaliação';
      default: return tipo;
    }
  };

  // Funções de manipulação dos agendamentos
  const abrirModalReagendar = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setReagendarModalOpen(true);
  };

  const abrirModalCancelar = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setCancelarModalOpen(true);
  };

  const reagendarAgendamento = (agendamentoId: string, novaData: string, novoHorario: string) => {
    setAgendamentos(agendamentos.map(ag => 
      ag.id === agendamentoId 
        ? { ...ag, data: novaData, hora: novoHorario }
        : ag
    ));
  };

  const cancelarAgendamento = (agendamentoId: string, motivo?: string) => {
    setAgendamentos(agendamentos.map(ag => 
      ag.id === agendamentoId 
        ? { ...ag, status: 'cancelado', observacoes: motivo ? `Cancelado: ${motivo}` : ag.observacoes }
        : ag
    ));
  };

  const marcarComoRealizado = (agendamentoId: string) => {
    setAgendamentos(agendamentos.map(ag => 
      ag.id === agendamentoId 
        ? { ...ag, status: 'realizado' }
        : ag
    ));
  };

  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje && ag.status === 'agendado');
  const agendamentosPendentes = agendamentos.filter(ag => ag.status === 'agendado');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e consultas
          </p>
        </div>
        <div className="flex space-x-2">
          <Tabs value={visualizacao} onValueChange={(value) => setVisualizacao(value as "lista" | "calendario")}>
            <TabsList>
              <TabsTrigger value="lista" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Calendário
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild>
            <Link to="/agenda/novo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{agendamentosHoje.length}</p>
                <p className="text-sm text-muted-foreground">Agendamentos hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{agendamentosPendentes.length}</p>
                <p className="text-sm text-muted-foreground">Agendamentos pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {agendamentos.filter(ag => ag.status === 'realizado').length}
                </p>
                <p className="text-sm text-muted-foreground">Consultas realizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente ou observações..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os serviços</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-60 justify-start text-left font-normal",
                    !filtroData && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtroData ? format(filtroData, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filtroData}
                  onSelect={setFiltroData}
                  initialFocus
                  className="pointer-events-auto"
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setFiltroData(undefined)}
                  >
                    Limpar filtro
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {visualizacao === "lista" ? (
        // Lista de Agendamentos
        agendamentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {agendamentos.length === 0 ? "Nenhum agendamento encontrado" : "Nenhum resultado encontrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {agendamentos.length === 0 
                  ? "Comece criando seu primeiro agendamento"
                  : "Tente ajustar os filtros de busca"
                }
              </p>
              {agendamentos.length === 0 && (
                <Button asChild>
                  <Link to="/agenda/novo">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Agendamento
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {agendamentosFiltrados.map((agendamento) => {
              const dataObj = new Date(`${agendamento.data}T${agendamento.hora}`);
              const isVencido = isPast(dataObj) && agendamento.status === 'agendado';
              
              return (
                <Card key={agendamento.id} className={`hover:shadow-medium transition-all duration-300 ${isVencido ? 'border-destructive/50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{agendamento.clienteNome}</h3>
                          <Badge variant={getStatusVariant(agendamento.status)}>
                            {getStatusText(agendamento.status)}
                          </Badge>
                          <Badge variant="outline">
                            {agendamento.servicosNomes.join(', ')}
                          </Badge>
                          {isVencido && (
                            <Badge variant="destructive">Vencido</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-muted-foreground space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatarDataHora(agendamento.data, agendamento.hora)}
                          </span>
                        </div>
                        {agendamento.observacoes && (
                          <p className="text-sm text-muted-foreground">
                            {agendamento.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {agendamento.status === 'agendado' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirModalReagendar(agendamento)}
                              className="flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Reagendar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirModalCancelar(agendamento)}
                              className="flex items-center gap-1 text-destructive hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => marcarComoRealizado(agendamento.id)}
                            >
                              Marcar como Realizado
                            </Button>
                          </>
                        )}
                        {agendamento.status !== 'agendado' && (
                          <Button variant="outline" size="sm" disabled>
                            {agendamento.status === 'realizado' ? 'Consulta Realizada' : 'Agendamento Cancelado'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        // Visualização em Calendário
        <Card>
          <CardContent className="pt-6">
            <CalendarComponent
              mode="single"
              className="w-full pointer-events-auto"
              components={{
                DayContent: ({ date }) => {
                  const agendamentosNoDia = agendamentos.filter(ag => 
                    isSameDay(new Date(ag.data), date)
                  );
                  
                  return (
                    <div className="relative w-full h-full">
                      <span>{format(date, "d")}</span>
                      {agendamentosNoDia.length > 0 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-0.5">
                            {agendamentosNoDia.slice(0, 3).map((ag, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  ag.status === 'agendado' ? "bg-primary" :
                                  ag.status === 'realizado' ? "bg-success" :
                                  "bg-destructive"
                                )}
                              />
                            ))}
                            {agendamentosNoDia.length > 3 && (
                              <div className="text-xs text-muted-foreground">+{agendamentosNoDia.length - 3}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
              onDayClick={(date) => {
                setFiltroData(date);
                setVisualizacao("lista");
              }}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Clique em uma data para ver os agendamentos do dia.</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Agendado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Realizado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Cancelado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <ReagendarModal
        agendamento={agendamentoSelecionado}
        open={reagendarModalOpen}
        onOpenChange={setReagendarModalOpen}
        onConfirm={reagendarAgendamento}
      />
      
      <CancelarModal
        agendamento={agendamentoSelecionado}
        open={cancelarModalOpen}
        onOpenChange={setCancelarModalOpen}
        onConfirm={cancelarAgendamento}
      />
    </div>
  );
}
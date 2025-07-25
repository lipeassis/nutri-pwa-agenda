import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Agendamento } from "@/types";
import { Search, Plus, Calendar, Clock, User, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Agenda() {
  const [agendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const agendamentosFiltrados = agendamentos
    .filter(agendamento => {
      const matchBusca = agendamento.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
                        agendamento.observacoes?.toLowerCase().includes(busca.toLowerCase());
      
      const matchStatus = filtroStatus === "todos" || agendamento.status === filtroStatus;
      const matchTipo = filtroTipo === "todos" || agendamento.servicoNome.toLowerCase().includes(filtroTipo.toLowerCase());
      
      return matchBusca && matchStatus && matchTipo;
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
        <Button asChild>
          <Link to="/agenda/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Link>
        </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos List */}
      {agendamentosFiltrados.length === 0 ? (
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
                          {agendamento.servicoNome}
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
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      {agendamento.status === 'agendado' && (
                        <Button size="sm">
                          Marcar como Realizado
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
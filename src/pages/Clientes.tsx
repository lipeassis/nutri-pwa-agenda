import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDataSource } from "@/lib/apiMigration";
import { useClientes } from "@/hooks/api/useClientes";
import { Cliente, ConsultaProntuario, ClientePrograma, Familia, ClienteFamilia } from "@/types";
import { Search, Plus, User, Phone, Mail, Calendar, FileText, Star, Users } from "lucide-react";
import { VincularPrograma } from "@/components/prontuario/VincularPrograma";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Clientes() {
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [consultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [clienteProgramas] = useLocalStorage<ClientePrograma[]>('nutriapp-cliente-programas', []);
  const [familias] = useLocalStorage<Familia[]>('nutriapp-familias', []);
  const [clienteFamilias] = useLocalStorage<ClienteFamilia[]>('nutriapp-cliente-familias', []);
  const [busca, setBusca] = useState("");
  const [showVincularPrograma, setShowVincularPrograma] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.telefone.includes(busca)
  );

  const getUltimaConsulta = (clienteId: string) => {
    return consultas
      .filter(c => c.clienteId === clienteId)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
  };

  const getProgramasAtivos = (clienteId: string) => {
    return clienteProgramas.filter(cp => 
      cp.clienteId === clienteId && 
      cp.ativo && 
      new Date(cp.dataFim) >= new Date()
    );
  };

  const getFamiliaCliente = (clienteId: string) => {
    const clienteFamilia = clienteFamilias.find(cf => cf.clienteId === clienteId && cf.ativo);
    if (!clienteFamilia) return null;
    return familias.find(f => f.id === clienteFamilia.familiaId && f.ativo);
  };

  const abrirVincularPrograma = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setShowVincularPrograma(true);
  };

  const calcularIMC = (peso: number, altura: number) => {
    if (!peso || !altura) return "0.0";
    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);
    return imc.toFixed(1);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { label: "Abaixo do peso", variant: "secondary" as const };
    if (imc < 25) return { label: "Peso normal", variant: "default" as const };
    if (imc < 30) return { label: "Sobrepeso", variant: "destructive" as const };
    return { label: "Obesidade", variant: "destructive" as const };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe seu progresso
          </p>
        </div>
        <Button asChild>
          <Link to="/clientes/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar clientes por nome, email ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{clientes.length}</p>
                <p className="text-sm text-muted-foreground">Total de clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {clientes.filter(c => {
                    const cadastro = new Date(c.criadoEm);
                    const agora = new Date();
                    const mesPassado = new Date();
                    mesPassado.setMonth(agora.getMonth() - 1);
                    return cadastro >= mesPassado;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Novos este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-info" />
              <div>
                <p className="text-2xl font-bold">{consultas.length}</p>
                <p className="text-sm text-muted-foreground">Total de consultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clientes List */}
      {clientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {clientes.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {clientes.length === 0 
                ? "Comece cadastrando seu primeiro cliente"
                : "Tente ajustar os termos da busca"
              }
            </p>
            {clientes.length === 0 && (
              <Button asChild>
                <Link to="/clientes/novo">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Cliente
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => {
            const ultimaConsulta = getUltimaConsulta(cliente.id);
            const programasAtivos = getProgramasAtivos(cliente.id);
            const familia = getFamiliaCliente(cliente.id);
            const peso = ultimaConsulta?.medidas.peso;
            const altura = ultimaConsulta?.medidas.altura;
            
            return (
              <Card key={cliente.id} className="hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                        {familia && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: familia.corTag, 
                              color: familia.corTag 
                            }}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {familia.nome}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Cadastrado em {format(new Date(cliente.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    {peso && altura && (
                      <Badge variant="secondary">
                        IMC {calcularIMC(peso, altura)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {cliente.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {cliente.telefone}
                    </div>
                    {ultimaConsulta && (
                      <>
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="w-4 h-4 mr-2" />
                          Peso atual: {ultimaConsulta.medidas.peso}kg
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          Última consulta: {format(new Date(ultimaConsulta.data), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </>
                    )}
                    {!ultimaConsulta && (
                      <div className="text-muted-foreground text-xs">
                        Nenhuma consulta registrada
                      </div>
                    )}
                  </div>
                  
                  {cliente.objetivos && (
                    <div>
                      <p className="text-sm font-medium mb-1">Objetivos:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {cliente.objetivos}
                      </p>
                    </div>
                  )}

                  {/* Programas Ativos */}
                  {programasAtivos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <Star className="w-4 h-4 text-primary" />
                        Programas Ativos ({programasAtivos.length})
                      </p>
                      <div className="space-y-1">
                        {programasAtivos.slice(0, 2).map((cp) => (
                          <div key={cp.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {cp.programaNome}
                          </div>
                        ))}
                        {programasAtivos.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{programasAtivos.length - 2} programa(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to={`/clientes/${cliente.id}`}>Prontuário</Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => abrirVincularPrograma(cliente)}
                      className="flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Programa
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/agenda/novo?clienteId=${cliente.id}`}>Agendar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Vincular Programa */}
      {showVincularPrograma && clienteSelecionado && (
        <VincularPrograma
          cliente={clienteSelecionado}
          onClose={() => {
            setShowVincularPrograma(false);
            setClienteSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
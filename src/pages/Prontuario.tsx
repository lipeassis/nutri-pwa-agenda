import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, ObjetivosCliente } from "@/types";
import { ArrowLeft, Plus, TrendingUp, Target, Calendar, User, Weight, Ruler, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NovaConsulta } from "@/components/prontuario/NovaConsulta";
import { NovoObjetivo } from "@/components/prontuario/NovoObjetivo";
import { GraficoEvolucao } from "@/components/prontuario/GraficoEvolucao";

export function Prontuario() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [consultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [objetivos] = useLocalStorage<ObjetivosCliente[]>('nutriapp-objetivos', []);
  const [showNovaConsulta, setShowNovaConsulta] = useState(false);
  const [showNovoObjetivo, setShowNovoObjetivo] = useState(false);

  const cliente = clientes.find(c => c.id === clienteId);
  const consultasCliente = consultas
    .filter(c => c.clienteId === clienteId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  const objetivosCliente = objetivos
    .filter(o => o.clienteId === clienteId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const objetivoAtivo = objetivosCliente.find(o => o.ativo);
  const ultimaConsulta = consultasCliente[0];

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">O cliente solicitado não existe.</p>
          <Button asChild>
            <Link to="/clientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para clientes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const calcularIMC = (peso: number, altura: number) => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/clientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <User className="w-8 h-8 mr-3 text-primary" />
              {cliente.nome}
            </h1>
            <p className="text-muted-foreground">Prontuário do paciente</p>
          </div>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{cliente.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p className="text-base">{cliente.telefone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-base">
                {format(new Date(cliente.dataNascimento), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
              <p className="text-base">
                {format(new Date(cliente.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats atuais */}
      {ultimaConsulta && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Weight className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.peso}kg</p>
                  <p className="text-sm text-muted-foreground">Peso atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {calcularIMC(ultimaConsulta.medidas.peso, ultimaConsulta.medidas.altura)}
                  </p>
                  <p className="text-sm text-muted-foreground">IMC atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.percentualGordura}%</p>
                  <p className="text-sm text-muted-foreground">Gordura corporal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.massaMuscular}kg</p>
                  <p className="text-sm text-muted-foreground">Massa muscular</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="historico" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="historico">Histórico de Consultas</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consultas Realizadas</h3>
            <Button onClick={() => setShowNovaConsulta(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          {consultasCliente.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma consulta registrada</h3>
                <p className="text-muted-foreground mb-4">
                  Registre a primeira consulta do paciente
                </p>
                <Button onClick={() => setShowNovaConsulta(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Consulta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultasCliente.map((consulta, index) => (
                <Card key={consulta.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Consulta {format(new Date(consulta.data), "dd/MM/yyyy", { locale: ptBR })}
                      </CardTitle>
                      {index === 0 && <Badge>Mais recente</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Medidas */}
                    <div>
                      <h4 className="font-medium mb-2">Medidas Antropométricas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Peso:</span> {consulta.medidas.peso}kg
                        </div>
                        <div>
                          <span className="text-muted-foreground">Altura:</span> {consulta.medidas.altura}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Braço:</span> {consulta.medidas.circunferenciaBraco}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Abdômen:</span> {consulta.medidas.circunferenciaAbdomen}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Quadril:</span> {consulta.medidas.circunferenciaQuadril}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Pescoço:</span> {consulta.medidas.circunferenciaPescoco}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">% Gordura:</span> {consulta.medidas.percentualGordura}%
                        </div>
                        <div>
                          <span className="text-muted-foreground">M. Muscular:</span> {consulta.medidas.massaMuscular}kg
                        </div>
                      </div>
                    </div>

                    {/* Relato do paciente */}
                    {consulta.relatoPaciente && (
                      <div>
                        <h4 className="font-medium mb-2">Relato do Paciente</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {consulta.relatoPaciente}
                        </p>
                      </div>
                    )}

                    {/* Observações */}
                    {consulta.observacoesNutricionista && (
                      <div>
                        <h4 className="font-medium mb-2">Observações do Nutricionista</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {consulta.observacoesNutricionista}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          <h3 className="text-lg font-semibold">Evolução do Paciente</h3>
          {consultasCliente.length >= 2 ? (
            <GraficoEvolucao consultas={consultasCliente} objetivos={objetivoAtivo} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Dados insuficientes para gráficos</h3>
                <p className="text-muted-foreground">
                  São necessárias pelo menos 2 consultas para gerar gráficos de evolução
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objetivos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Objetivos do Paciente</h3>
            <Button onClick={() => setShowNovoObjetivo(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>

          {objetivosCliente.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum objetivo definido</h3>
                <p className="text-muted-foreground mb-4">
                  Defina objetivos para acompanhar o progresso do paciente
                </p>
                <Button onClick={() => setShowNovoObjetivo(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Definir Objetivo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {objetivosCliente.map((objetivo) => (
                <Card key={objetivo.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Objetivo criado em {format(new Date(objetivo.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                      </CardTitle>
                      <Badge variant={objetivo.ativo ? "default" : "secondary"}>
                        {objetivo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Peso Meta</p>
                        <p className="text-lg font-semibold">{objetivo.pesoMeta}kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Prazo</p>
                        <p className="text-lg font-semibold">{objetivo.prazoMeses} meses</p>
                      </div>
                      {ultimaConsulta && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                          <p className="text-lg font-semibold">
                            {Math.abs(ultimaConsulta.medidas.peso - objetivo.pesoMeta).toFixed(1)}kg restantes
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {objetivo.observacoes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm bg-muted p-3 rounded-md">{objetivo.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modais */}
      {showNovaConsulta && (
        <NovaConsulta
          cliente={cliente}
          onClose={() => setShowNovaConsulta(false)}
        />
      )}

      {showNovoObjetivo && (
        <NovoObjetivo
          cliente={cliente}
          onClose={() => setShowNovoObjetivo(false)}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAgendamentos } from "@/hooks/api/useAgendamentos";
import { useServicosAtivos } from "@/hooks/api/useServicos";
import { useIsApiMode } from "@/lib/apiMigration";
import { Cliente, Agendamento, Usuario, TipoProfissional, Servico, LocalAtendimento } from "@/types";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function NovoAgendamento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const clienteIdParam = searchParams.get('clienteId');
  
  const isApiMode = useIsApiMode();
  const { createAgendamento } = useAgendamentos();
  const { servicos: servicosApi, loading: loadingServicos } = useServicosAtivos();
  
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [agendamentos, setAgendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  const [usuarios] = useLocalStorage<Usuario[]>('system_users', []);
  const [tiposProfissionais] = useLocalStorage<TipoProfissional[]>('tipos_profissionais', []);
  const [servicos] = useLocalStorage<Servico[]>('nutriapp-servicos', []);
  const [locais] = useLocalStorage<LocalAtendimento[]>('nutriapp-locais', []);
  
  // Usar API ou localStorage dependendo do modo
  const servicosAtivos = isApiMode ? servicosApi : servicos.filter(s => s.ativo);
  
  // Filtrar apenas profissionais ativos
  const profissionais = usuarios.filter(u => u.role === 'profissional' && u.ativo);
  const locaisAtivos = locais.filter(l => l.ativo);
  
  const [formData, setFormData] = useState({
    clienteId: clienteIdParam || "",
    profissionalId: user?.role === 'profissional' ? user.id : "",
    data: "",
    hora: "",
    servicosIds: [] as string[],
    localId: "",
    observacoes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (servicoId: string) => {
    setFormData(prev => ({
      ...prev,
      servicosIds: prev.servicosIds.includes(servicoId)
        ? prev.servicosIds.filter(id => id !== servicoId)
        : [...prev.servicosIds, servicoId]
    }));
  };

  const getProfissionalNome = (profissionalId: string) => {
    const profissional = usuarios.find(u => u.id === profissionalId);
    return profissional?.nome || "";
  };

  const getServicosNomes = (servicosIds: string[]) => {
    return servicosIds.map(id => {
      const servico = servicos.find(s => s.id === id);
      return servico?.nome || "";
    });
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || "";
  };

  const getLocalNome = (localId: string) => {
    const local = locais.find(l => l.id === localId);
    return local?.nome || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.profissionalId || !formData.data || !formData.hora || formData.servicosIds.length === 0 || !formData.localId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Verificar conflito de horário para o mesmo profissional
    const conflito = agendamentos.find(ag => 
      ag.profissionalId === formData.profissionalId &&
      ag.data === formData.data && 
      ag.hora === formData.hora && 
      ag.status !== 'cancelado'
    );

    if (conflito) {
      toast({
        title: "Conflito de horário",
        description: "Já existe um agendamento para este horário.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isApiMode) {
        // Usar API
        await createAgendamento({
          clienteId: formData.clienteId,
          profissionalId: formData.profissionalId,
          servicosIds: formData.servicosIds,
          data: formData.data,
          horario: formData.hora,
          tipo: 'presencial', // Ajustar conforme necessário
          localId: formData.localId,
          observacoes: formData.observacoes
        });
      } else {
        // Usar localStorage (modo atual)
        const novoAgendamento: Agendamento = {
          id: Date.now().toString(),
          clienteId: formData.clienteId,
          clienteNome: getClienteNome(formData.clienteId),
          profissionalId: formData.profissionalId,
          profissionalNome: getProfissionalNome(formData.profissionalId),
          data: formData.data,
          hora: formData.hora,
          servicosIds: formData.servicosIds,
          servicosNomes: getServicosNomes(formData.servicosIds),
          localId: formData.localId,
          localNome: getLocalNome(formData.localId),
          status: 'agendado',
          observacoes: formData.observacoes,
          criadoEm: new Date().toISOString()
        };

        setAgendamentos(prev => [...prev, novoAgendamento]);
      }
      
      toast({
        title: "Agendamento criado!",
        description: `Agendamento para ${getClienteNome(formData.clienteId)} com ${getProfissionalNome(formData.profissionalId)} foi criado com sucesso.`,
      });

      navigate("/agenda");
    } catch (error) {
      // Erro já tratado pelo hook useAgendamentos
    }
  };

  // Gerar horários disponíveis (8h às 18h, de 30 em 30 minutos)
  const horariosDisponiveis = [];
  for (let hora = 8; hora <= 18; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      if (hora === 18 && minuto > 0) break; // Não adicionar 18:30
      const horaFormatada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horariosDisponiveis.push(horaFormatada);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/agenda">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Agendamento</h1>
          <p className="text-muted-foreground">
            Agende uma nova consulta com seu cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Detalhes do Agendamento
            </CardTitle>
            <CardDescription>
              Preencha as informações do agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção do Profissional */}
            {user?.role !== 'profissional' && (
              <div className="space-y-2">
                <Label htmlFor="profissionalId">Profissional *</Label>
                <Select value={formData.profissionalId} onValueChange={(value) => handleSelectChange('profissionalId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((profissional) => {
                      const tipoProfissional = profissional.tipoProfissionalId 
                        ? tiposProfissionais.find(tipo => tipo.id === profissional.tipoProfissionalId)
                        : null;
                      
                      return (
                        <SelectItem key={profissional.id} value={profissional.id}>
                          {profissional.nome} {tipoProfissional ? `(${tipoProfissional.nome})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {profissionais.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum profissional cadastrado.
                  </p>
                )}
              </div>
            )}

            {/* Seleção do Cliente */}
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select value={formData.clienteId} onValueChange={(value) => handleSelectChange('clienteId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cliente cadastrado. 
                  <Link to="/clientes/novo" className="text-primary hover:underline ml-1">
                    Cadastre um cliente primeiro
                  </Link>
                </p>
              )}
            </div>

            {/* Data e Hora */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Horário *</Label>
                <Select value={formData.hora} onValueChange={(value) => handleSelectChange('hora', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponiveis.map((horario) => {
                      // Verificar se o horário está ocupado na data selecionada para o profissional selecionado
                      const ocupado = formData.data && formData.profissionalId && agendamentos.some(ag => 
                        ag.profissionalId === formData.profissionalId &&
                        ag.data === formData.data && 
                        ag.hora === horario && 
                        ag.status !== 'cancelado'
                      );
                      
                      return (
                        <SelectItem 
                          key={horario} 
                          value={horario}
                          disabled={ocupado}
                        >
                          {horario} {ocupado ? "(Ocupado)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Serviços */}
            <div className="space-y-2">
              <Label>Serviços *</Label>
              <div className="space-y-2">
                {servicosAtivos.map((servico) => (
                  <div key={servico.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <input
                      type="checkbox"
                      id={`servico-${servico.id}`}
                      checked={formData.servicosIds.includes(servico.id)}
                      onChange={() => handleServiceToggle(servico.id)}
                      className="w-4 h-4 text-primary bg-background border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor={`servico-${servico.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{servico.nome}</p>
                          <p className="text-sm text-muted-foreground">{servico.tempoMinutos} minutos</p>
                        </div>
                        <p className="font-medium text-primary">R$ {servico.valorParticular.toFixed(2)}</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              {formData.servicosIds.length > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-foreground">Total do Agendamento</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">
                      R$ {formData.servicosIds.reduce((total, id) => {
                        const servico = servicosAtivos.find(s => s.id === id);
                        return total + (servico?.valorParticular || 0);
                      }, 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Duração total: {formData.servicosIds.reduce((total, id) => {
                        const servico = servicosAtivos.find(s => s.id === id);
                        return total + (servico?.tempoMinutos || 0);
                      }, 0)} minutos
                    </p>
                  </div>
                </div>
              )}
              {servicosAtivos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum serviço cadastrado. Entre em contato com o administrador.
                </p>
              )}
            </div>

            {/* Local de Atendimento */}
            <div className="space-y-2">
              <Label htmlFor="localId">Local de Atendimento *</Label>
              <Select value={formData.localId} onValueChange={(value) => handleSelectChange('localId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locaisAtivos.map((local) => (
                    <SelectItem key={local.id} value={local.id}>
                      {local.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locaisAtivos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum local cadastrado. Entre em contato com o administrador.
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Informações adicionais sobre o agendamento"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" className="flex-1" disabled={clientes.length === 0 || servicosAtivos.length === 0 || locaisAtivos.length === 0 || (user?.role !== 'profissional' && profissionais.length === 0)}>
                <Save className="w-4 h-4 mr-2" />
                Criar Agendamento
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/agenda">Cancelar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
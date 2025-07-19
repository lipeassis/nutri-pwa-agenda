import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, Agendamento } from "@/types";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function NovoAgendamento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const clienteIdParam = searchParams.get('clienteId');
  
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [agendamentos, setAgendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  
  const [formData, setFormData] = useState({
    clienteId: clienteIdParam || "",
    data: "",
    hora: "",
    tipo: "",
    observacoes: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.data || !formData.hora || !formData.tipo) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Verificar conflito de horário
    const conflito = agendamentos.find(ag => 
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

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      clienteId: formData.clienteId,
      clienteNome: getClienteNome(formData.clienteId),
      data: formData.data,
      hora: formData.hora,
      tipo: formData.tipo as 'consulta' | 'retorno' | 'avaliacao',
      status: 'agendado',
      observacoes: formData.observacoes,
      criadoEm: new Date().toISOString()
    };

    setAgendamentos(prev => [...prev, novoAgendamento]);
    
    toast({
      title: "Agendamento criado!",
      description: `Agendamento para ${getClienteNome(formData.clienteId)} foi criado com sucesso.`,
    });

    navigate("/agenda");
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
                      // Verificar se o horário está ocupado na data selecionada
                      const ocupado = formData.data && agendamentos.some(ag => 
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

            {/* Tipo de Consulta */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Consulta *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleSelectChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="avaliacao">Avaliação</SelectItem>
                </SelectContent>
              </Select>
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
              <Button type="submit" className="flex-1" disabled={clientes.length === 0}>
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
import { useState, useEffect } from "react";
import { DisponibilidadeAgenda, DisponibilidadePorLocal, HorarioDisponivel, LocalAtendimento } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Trash2, Clock, MapPin, Building2 } from "lucide-react";

interface ConfiguracaoAgendaProps {
  disponibilidade: DisponibilidadePorLocal | undefined;
  onDisponibilidadeChange: (disponibilidade: DisponibilidadePorLocal) => void;
}

const diasSemana = [
  { key: 'domingo' as keyof DisponibilidadeAgenda, label: 'Domingo' },
  { key: 'segunda' as keyof DisponibilidadeAgenda, label: 'Segunda-feira' },
  { key: 'terca' as keyof DisponibilidadeAgenda, label: 'Terça-feira' },
  { key: 'quarta' as keyof DisponibilidadeAgenda, label: 'Quarta-feira' },
  { key: 'quinta' as keyof DisponibilidadeAgenda, label: 'Quinta-feira' },
  { key: 'sexta' as keyof DisponibilidadeAgenda, label: 'Sexta-feira' },
  { key: 'sabado' as keyof DisponibilidadeAgenda, label: 'Sábado' },
];

const disponibilidadeInicial: DisponibilidadeAgenda = {
  domingo: [],
  segunda: [],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
  sabado: [],
};

export function ConfiguracaoAgenda({ disponibilidade, onDisponibilidadeChange }: ConfiguracaoAgendaProps) {
  const [locais] = useLocalStorage<LocalAtendimento[]>('nutriapp-locais', []);
  const [localSelecionado, setLocalSelecionado] = useState<string>('');
  const [agenda, setAgenda] = useState<DisponibilidadePorLocal>(disponibilidade || {});

  const locaisAtivos = locais.filter(l => l.ativo);

  // Selecionar o primeiro local automaticamente se existir
  useEffect(() => {
    if (locaisAtivos.length > 0 && !localSelecionado) {
      setLocalSelecionado(locaisAtivos[0].id);
    }
  }, [locaisAtivos, localSelecionado]);

  const agendaDoLocal = agenda[localSelecionado] || disponibilidadeInicial;

  const atualizarAgendaDoLocal = (novaAgenda: DisponibilidadeAgenda) => {
    const novaDisponibilidade = {
      ...agenda,
      [localSelecionado]: novaAgenda
    };
    setAgenda(novaDisponibilidade);
    onDisponibilidadeChange(novaDisponibilidade);
  };

  const adicionarHorario = (dia: keyof DisponibilidadeAgenda) => {
    const novoHorario: HorarioDisponivel = {
      inicio: '08:00',
      fim: '09:00'
    };
    
    const novaAgenda = {
      ...agendaDoLocal,
      [dia]: [...agendaDoLocal[dia], novoHorario]
    };
    
    atualizarAgendaDoLocal(novaAgenda);
  };

  const removerHorario = (dia: keyof DisponibilidadeAgenda, index: number) => {
    const novaAgenda = {
      ...agendaDoLocal,
      [dia]: agendaDoLocal[dia].filter((_, i) => i !== index)
    };
    
    atualizarAgendaDoLocal(novaAgenda);
  };

  const atualizarHorario = (
    dia: keyof DisponibilidadeAgenda, 
    index: number, 
    campo: 'inicio' | 'fim', 
    valor: string
  ) => {
    const novosHorarios = [...agendaDoLocal[dia]];
    novosHorarios[index] = {
      ...novosHorarios[index],
      [campo]: valor
    };
    
    const novaAgenda = {
      ...agendaDoLocal,
      [dia]: novosHorarios
    };
    
    atualizarAgendaDoLocal(novaAgenda);
  };

  const removerLocal = (localId: string) => {
    const novaDisponibilidade = { ...agenda };
    delete novaDisponibilidade[localId];
    setAgenda(novaDisponibilidade);
    onDisponibilidadeChange(novaDisponibilidade);
    
    // Se for o local selecionado, selecionar outro
    if (localSelecionado === localId && locaisAtivos.length > 0) {
      const outroLocal = locaisAtivos.find(l => l.id !== localId);
      setLocalSelecionado(outroLocal?.id || '');
    }
  };

  const getLocalNome = (localId: string) => {
    const local = locais.find(l => l.id === localId);
    return local?.nome || 'Local não encontrado';
  };

  if (locaisAtivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configuração de Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum local de atendimento cadastrado.</p>
            <p className="text-sm">É necessário cadastrar pelo menos um local para configurar a agenda.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Configuração de Agenda por Local
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Local */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Local de Atendimento</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{Object.keys(agenda).length} local(is) configurado(s)</span>
            </div>
          </div>
          
          <Select value={localSelecionado} onValueChange={setLocalSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um local" />
            </SelectTrigger>
            <SelectContent>
              {locaisAtivos.map((local) => (
                <SelectItem key={local.id} value={local.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {local.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Locais já configurados */}
          {Object.keys(agenda).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Locais com agenda configurada:</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(agenda).map((localId) => {
                  const local = locais.find(l => l.id === localId);
                  if (!local) return null;
                  
                  return (
                    <div key={localId} className="flex items-center gap-1">
                      <Badge 
                        variant={localId === localSelecionado ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => setLocalSelecionado(localId)}
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        {local.nome}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                        onClick={() => removerLocal(localId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {localSelecionado && (
          <>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Horários para: {getLocalNome(localSelecionado)}</h3>
              </div>
              
              <div className="space-y-4">
                {diasSemana.map(({ key, label }) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">{label}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarHorario(key)}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Horário
                      </Button>
                    </div>
                    
                    {agendaDoLocal[key].length === 0 ? (
                      <div className="text-sm text-muted-foreground italic">
                        Nenhum horário configurado
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {agendaDoLocal[key].map((horario, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="space-y-1">
                                <Label className="text-xs">Início</Label>
                                <Input
                                  type="time"
                                  value={horario.inicio}
                                  onChange={(e) => atualizarHorario(key, index, 'inicio', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <span className="text-muted-foreground">até</span>
                              <div className="space-y-1">
                                <Label className="text-xs">Fim</Label>
                                <Input
                                  type="time"
                                  value={horario.fim}
                                  onChange={(e) => atualizarHorario(key, index, 'fim', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {horario.inicio} - {horario.fim}
                            </Badge>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removerHorario(key, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
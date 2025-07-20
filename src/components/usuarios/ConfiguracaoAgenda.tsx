import { useState } from "react";
import { DisponibilidadeAgenda, HorarioDisponivel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock } from "lucide-react";

interface ConfiguracaoAgendaProps {
  disponibilidade: DisponibilidadeAgenda | undefined;
  onDisponibilidadeChange: (disponibilidade: DisponibilidadeAgenda) => void;
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
  const [agenda, setAgenda] = useState<DisponibilidadeAgenda>(
    disponibilidade || disponibilidadeInicial
  );

  const adicionarHorario = (dia: keyof DisponibilidadeAgenda) => {
    const novoHorario: HorarioDisponivel = {
      inicio: '08:00',
      fim: '09:00'
    };
    
    const novaAgenda = {
      ...agenda,
      [dia]: [...agenda[dia], novoHorario]
    };
    
    setAgenda(novaAgenda);
    onDisponibilidadeChange(novaAgenda);
  };

  const removerHorario = (dia: keyof DisponibilidadeAgenda, index: number) => {
    const novaAgenda = {
      ...agenda,
      [dia]: agenda[dia].filter((_, i) => i !== index)
    };
    
    setAgenda(novaAgenda);
    onDisponibilidadeChange(novaAgenda);
  };

  const atualizarHorario = (
    dia: keyof DisponibilidadeAgenda, 
    index: number, 
    campo: 'inicio' | 'fim', 
    valor: string
  ) => {
    const novosHorarios = [...agenda[dia]];
    novosHorarios[index] = {
      ...novosHorarios[index],
      [campo]: valor
    };
    
    const novaAgenda = {
      ...agenda,
      [dia]: novosHorarios
    };
    
    setAgenda(novaAgenda);
    onDisponibilidadeChange(novaAgenda);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Configuração de Agenda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            
            {agenda[key].length === 0 ? (
              <div className="text-sm text-muted-foreground italic">
                Nenhum horário configurado
              </div>
            ) : (
              <div className="space-y-2">
                {agenda[key].map((horario, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
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
      </CardContent>
    </Card>
  );
}
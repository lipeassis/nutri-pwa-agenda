import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Agendamento } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ReagendarModalProps {
  agendamento: Agendamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (agendamentoId: string, novaData: string, novoHorario: string) => void;
}

export function ReagendarModal({ agendamento, open, onOpenChange, onConfirm }: ReagendarModalProps) {
  const [novaData, setNovaData] = useState<Date>();
  const [novoHorario, setNovoHorario] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!agendamento || !novaData || !novoHorario) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma nova data e horário.",
        variant: "destructive",
      });
      return;
    }

    const dataFormatada = format(novaData, "yyyy-MM-dd");
    onConfirm(agendamento.id, dataFormatada, novoHorario);
    onOpenChange(false);
    setNovaData(undefined);
    setNovoHorario("");
    
    toast({
      title: "Agendamento reagendado",
      description: `Consulta reagendada para ${format(novaData, "dd/MM/yyyy", { locale: ptBR })} às ${novoHorario}.`,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setNovaData(undefined);
    setNovoHorario("");
  };

  if (!agendamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reagendar Consulta</DialogTitle>
          <DialogDescription>
            Reagendar consulta de {agendamento.clienteNome} - {agendamento.servicoNome}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Agendamento atual</Label>
            <p className="text-sm text-muted-foreground">
              {format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })} às {agendamento.hora}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nova-data">Nova data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !novaData && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {novaData ? format(novaData, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={novaData}
                  onSelect={setNovaData}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="novo-horario">Novo horário</Label>
            <Input
              id="novo-horario"
              type="time"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              placeholder="Selecionar horário"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Reagendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
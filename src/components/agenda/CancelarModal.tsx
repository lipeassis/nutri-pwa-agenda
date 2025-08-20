import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface CancelarModalProps {
  agendamento: Agendamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (agendamentoId: string, motivo?: string) => void;
}

export function CancelarModal({ agendamento, open, onOpenChange, onConfirm }: CancelarModalProps) {
  const [motivo, setMotivo] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!agendamento) return;

    onConfirm(agendamento.id, motivo);
    onOpenChange(false);
    setMotivo("");
    
    toast({
      title: "Agendamento cancelado",
      description: `Consulta de ${agendamento.clienteNome} foi cancelada.`,
      variant: "destructive",
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setMotivo("");
  };

  if (!agendamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Cancelar Consulta
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar a consulta?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Dados do agendamento</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="font-medium">{agendamento.clienteNome}</p>
              <p className="text-sm text-muted-foreground">{agendamento.servicosNomes.join(', ')}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })} às {agendamento.hora}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do cancelamento (opcional)</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo do cancelamento..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Manter agendamento
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
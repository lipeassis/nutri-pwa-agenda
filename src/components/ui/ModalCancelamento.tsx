import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface ModalCancelamentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: string;
  onConfirmar: (motivo: string) => void;
}

export function ModalCancelamento({ 
  open, 
  onOpenChange, 
  titulo, 
  descricao, 
  onConfirmar 
}: ModalCancelamentoProps) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmar = async () => {
    if (!motivo.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmar(motivo.trim());
      setMotivo("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {descricao}
          </p>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do cancelamento *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo do cancelamento..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmar}
            disabled={!motivo.trim() || isSubmitting}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
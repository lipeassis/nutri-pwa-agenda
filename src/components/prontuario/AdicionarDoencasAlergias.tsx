import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, Doenca, Alergia } from "@/types";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdicionarDoencasAlergiasProps {
  cliente: Cliente;
  open: boolean;
  onClose: () => void;
}

export function AdicionarDoencasAlergias({ cliente, open, onClose }: AdicionarDoencasAlergiasProps) {
  const { toast } = useToast();
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [doencas] = useLocalStorage<Doenca[]>('nutriapp-doencas', []);
  const [alergias] = useLocalStorage<Alergia[]>('nutriapp-alergias', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDoencas, setSelectedDoencas] = useState<string[]>(cliente.doencasIds || []);
  const [selectedAlergias, setSelectedAlergias] = useState<string[]>(cliente.alergiasIds || []);

  const doencasAtivas = doencas.filter(d => d.ativo);
  const alergiasAtivas = alergias.filter(a => a.ativo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const clienteAtualizado: Cliente = {
        ...cliente,
        doencasIds: selectedDoencas,
        alergiasIds: selectedAlergias
      };

      setClientes(prev => prev.map(c => 
        c.id === cliente.id ? clienteAtualizado : c
      ));

      toast({
        title: "Doenças e alergias atualizadas!",
        description: "As informações foram salvas com sucesso.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Doenças e Alergias</DialogTitle>
          <DialogDescription>
            Adicione ou remova doenças e alergias do paciente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doenças */}
          {doencasAtivas.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Doenças</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
                {doencasAtivas.map((doenca) => (
                  <div key={doenca.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`doenca-${doenca.id}`}
                      checked={selectedDoencas.includes(doenca.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDoencas(prev => [...prev, doenca.id]);
                        } else {
                          setSelectedDoencas(prev => prev.filter(id => id !== doenca.id));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={`doenca-${doenca.id}`} className="text-sm font-medium cursor-pointer">
                        {doenca.nome}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {doenca.resumo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alergias */}
          {alergiasAtivas.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Alergias</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
                {alergiasAtivas.map((alergia) => (
                  <div key={alergia.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`alergia-${alergia.id}`}
                      checked={selectedAlergias.includes(alergia.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAlergias(prev => [...prev, alergia.id]);
                        } else {
                          setSelectedAlergias(prev => prev.filter(id => id !== alergia.id));
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={`alergia-${alergia.id}`} className="text-sm font-medium cursor-pointer">
                        {alergia.nome}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {alergia.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doencasAtivas.length === 0 && alergiasAtivas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma doença ou alergia cadastrada no sistema.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Solicite ao administrador para cadastrar doenças e alergias.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
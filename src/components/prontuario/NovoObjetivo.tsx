import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ObjetivosCliente } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface NovoObjetivoProps {
  cliente: Cliente;
  onClose: () => void;
}

export function NovoObjetivo({ cliente, onClose }: NovoObjetivoProps) {
  const { toast } = useToast();
  const [objetivos, setObjetivos] = useLocalStorage<ObjetivosCliente[]>('nutriapp-objetivos', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pesoMeta: cliente.peso,
    medidasMeta: {
      circunferenciaBraco: 0,
      circunferenciaAbdomen: 0,
      circunferenciaQuadril: 0,
      circunferenciaPescoco: 0,
      percentualGordura: 0,
      massaMuscular: 0,
    },
    prazoMeses: 3,
    observacoes: '',
    ativo: true,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('medidasMeta.')) {
      const medidasField = field.replace('medidasMeta.', '');
      setFormData(prev => ({
        ...prev,
        medidasMeta: {
          ...prev.medidasMeta,
          [medidasField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Se este objetivo será ativo, desativa todos os outros
      if (formData.ativo) {
        setObjetivos(prev => 
          prev.map(obj => 
            obj.clienteId === cliente.id 
              ? { ...obj, ativo: false }
              : obj
          )
        );
      }

      const novoObjetivo: ObjetivosCliente = {
        id: Date.now().toString(),
        clienteId: cliente.id,
        pesoMeta: formData.pesoMeta,
        medidasMeta: formData.medidasMeta,
        prazoMeses: formData.prazoMeses,
        observacoes: formData.observacoes,
        ativo: formData.ativo,
        criadoEm: new Date().toISOString(),
      };

      setObjetivos(prev => [...prev, novoObjetivo]);

      toast({
        title: "Objetivo definido",
        description: "O objetivo foi definido para o paciente.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao definir o objetivo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Objetivo - {cliente.nome}</DialogTitle>
          <DialogDescription>
            Defina objetivos para acompanhar o progresso do paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Objetivo Principal */}
          <div className="space-y-4">
            <h4 className="font-medium">Objetivo Principal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pesoMeta">Peso Meta (kg) *</Label>
                <Input
                  id="pesoMeta"
                  type="number"
                  step="0.1"
                  value={formData.pesoMeta}
                  onChange={(e) => handleInputChange('pesoMeta', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prazoMeses">Prazo (meses) *</Label>
                <Input
                  id="prazoMeses"
                  type="number"
                  min="1"
                  value={formData.prazoMeses}
                  onChange={(e) => handleInputChange('prazoMeses', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Medidas Meta (Opcionais) */}
          <div className="space-y-4">
            <h4 className="font-medium">Medidas Meta (Opcionais)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="circunferenciaBracoMeta">Circunferência do Braço (cm)</Label>
                <Input
                  id="circunferenciaBracoMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.circunferenciaBraco}
                  onChange={(e) => handleInputChange('medidasMeta.circunferenciaBraco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaAbdomenMeta">Circunferência do Abdômen (cm)</Label>
                <Input
                  id="circunferenciaAbdomenMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.circunferenciaAbdomen}
                  onChange={(e) => handleInputChange('medidasMeta.circunferenciaAbdomen', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaQuadrilMeta">Circunferência do Quadril (cm)</Label>
                <Input
                  id="circunferenciaQuadrilMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.circunferenciaQuadril}
                  onChange={(e) => handleInputChange('medidasMeta.circunferenciaQuadril', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaPescocoMeta">Circunferência do Pescoço (cm)</Label>
                <Input
                  id="circunferenciaPescocoMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.circunferenciaPescoco}
                  onChange={(e) => handleInputChange('medidasMeta.circunferenciaPescoco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="percentualGorduraMeta">Percentual de Gordura (%)</Label>
                <Input
                  id="percentualGorduraMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.percentualGordura}
                  onChange={(e) => handleInputChange('medidasMeta.percentualGordura', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="massaMuscularMeta">Massa Muscular (kg)</Label>
                <Input
                  id="massaMuscularMeta"
                  type="number"
                  step="0.1"
                  value={formData.medidasMeta.massaMuscular}
                  onChange={(e) => handleInputChange('medidasMeta.massaMuscular', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Estratégias, orientações específicas, restrições..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={4}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Objetivo ativo</Label>
            <span className="text-sm text-muted-foreground">
              (Apenas um objetivo pode estar ativo por vez)
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Objetivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
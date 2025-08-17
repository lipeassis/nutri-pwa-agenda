import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, MedidasAntropometricas, DobrasCutaneas, Anamnese } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface NovaEvoulcaoProps {
  cliente: Cliente;
  onClose: () => void;
}

export function NovaEvoulcao({ cliente, onClose }: NovaEvoulcaoProps) {
  const { toast } = useToast();
  const [consultas, setConsultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    medidas: {
      peso: 0,
      altura: 0,
      circunferenciaBraco: 0,
      circunferenciaAbdomen: 0,
      circunferenciaQuadril: 0,
      circunferenciaPescoco: 0,
      percentualGordura: 0,
      massaMuscular: 0,
    } as MedidasAntropometricas,
    relatoPaciente: '',
    observacoesNutricionista: '',
  });

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('medidas.')) {
      const medidasField = field.replace('medidas.', '');
      setFormData(prev => ({
        ...prev,
        medidas: {
          ...prev.medidas,
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
      const novaConsulta: ConsultaProntuario = {
        id: Date.now().toString(),
        clienteId: cliente.id,
        data: formData.data,
        medidas: formData.medidas,
        dobrasCutaneas: {
          tricipital: 0,
          bicipital: 0,
          subescapular: 0,
          suprailiaca: 0,
          abdominal: 0,
          coxa: 0,
          panturrilha: 0,
        },
        bioimpedancia: {
          faseAngle: 0,
          aguaCorporal: 0,
          massaMuscular: 0,
          ecmIcw: 0,
        },
        resultadosExames: [],
        anamnese: {
          funcaoIntestinal: '',
          padraoAlimentar: '',
          horariosIrregulares: false,
          compulsoes: false,
          consumoAgua: 0,
          sintomasAtuais: [],
          outros: '',
          habitosAjustar: '',
          manutencaoPlano: '',
          suplementacao: '',
          alimentosPriorizados: '',
          alimentosEvitados: '',
          reforcoComportamental: '',
          estrategiasComplementares: '',
        },
        relatoPaciente: formData.relatoPaciente,
        observacoesNutricionista: formData.observacoesNutricionista,
        criadoEm: new Date().toISOString(),
      };

      setConsultas(prev => [...prev, novaConsulta]);

      toast({
        title: "Consulta registrada",
        description: "A consulta foi registrada no prontuário do paciente.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a consulta.",
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
          <DialogTitle>Nova Evolução - {cliente.nome}</DialogTitle>
          <DialogDescription>
            Registre os dados da consulta no prontuário do paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data */}
          <div>
            <Label htmlFor="data">Data da Evolução</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              required
            />
          </div>

          {/* Medidas Antropométricas */}
          <div className="space-y-4">
            <h4 className="font-medium">Medidas Antropométricas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={formData.medidas.peso}
                  onChange={(e) => handleInputChange('medidas.peso', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="altura">Altura (cm) *</Label>
                <Input
                  id="altura"
                  type="number"
                  value={formData.medidas.altura}
                  onChange={(e) => handleInputChange('medidas.altura', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaBraco">Circunferência do Braço (cm)</Label>
                <Input
                  id="circunferenciaBraco"
                  type="number"
                  step="0.1"
                  value={formData.medidas.circunferenciaBraco}
                  onChange={(e) => handleInputChange('medidas.circunferenciaBraco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaAbdomen">Circunferência do Abdômen (cm)</Label>
                <Input
                  id="circunferenciaAbdomen"
                  type="number"
                  step="0.1"
                  value={formData.medidas.circunferenciaAbdomen}
                  onChange={(e) => handleInputChange('medidas.circunferenciaAbdomen', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaQuadril">Circunferência do Quadril (cm)</Label>
                <Input
                  id="circunferenciaQuadril"
                  type="number"
                  step="0.1"
                  value={formData.medidas.circunferenciaQuadril}
                  onChange={(e) => handleInputChange('medidas.circunferenciaQuadril', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="circunferenciaPescoco">Circunferência do Pescoço (cm)</Label>
                <Input
                  id="circunferenciaPescoco"
                  type="number"
                  step="0.1"
                  value={formData.medidas.circunferenciaPescoco}
                  onChange={(e) => handleInputChange('medidas.circunferenciaPescoco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="percentualGordura">Percentual de Gordura (%)</Label>
                <Input
                  id="percentualGordura"
                  type="number"
                  step="0.1"
                  value={formData.medidas.percentualGordura}
                  onChange={(e) => handleInputChange('medidas.percentualGordura', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="massaMuscular">Massa Muscular (kg)</Label>
                <Input
                  id="massaMuscular"
                  type="number"
                  step="0.1"
                  value={formData.medidas.massaMuscular}
                  onChange={(e) => handleInputChange('medidas.massaMuscular', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Relato do Paciente */}
          <div>
            <Label htmlFor="relatoPaciente">Relato do Paciente</Label>
            <Textarea
              id="relatoPaciente"
              placeholder="Como o paciente se sente, queixas, progressos percebidos..."
              value={formData.relatoPaciente}
              onChange={(e) => handleInputChange('relatoPaciente', e.target.value)}
              rows={4}
            />
          </div>

          {/* Observações do Nutricionista */}
          <div>
            <Label htmlFor="observacoesNutricionista">Observações do Nutricionista</Label>
            <Textarea
              id="observacoesNutricionista"
              placeholder="Avaliação técnica, orientações, plano alimentar, exercícios..."
              value={formData.observacoesNutricionista}
              onChange={(e) => handleInputChange('observacoesNutricionista', e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Consulta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
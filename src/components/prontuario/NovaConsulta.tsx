import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, MedidasAntropometricas, DobrasCutaneas } from "@/types";
import { Save, Activity, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NovaConsultaProps {
  cliente: Cliente;
  onClose: () => void;
}

export function NovaConsulta({ cliente, onClose }: NovaConsultaProps) {
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
    dobrasCutaneas: {
      tricipital: 0,
      bicipital: 0,
      subescapular: 0,
      suprailiaca: 0,
      abdominal: 0,
      coxa: 0,
      panturrilha: 0,
    } as DobrasCutaneas,
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
    } else if (field.startsWith('dobrasCutaneas.')) {
      const dobrasField = field.replace('dobrasCutaneas.', '');
      setFormData(prev => ({
        ...prev,
        dobrasCutaneas: {
          ...prev.dobrasCutaneas,
          [dobrasField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
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
        dobrasCutaneas: formData.dobrasCutaneas,
        relatoPaciente: formData.relatoPaciente,
        observacoesNutricionista: formData.observacoesNutricionista,
        criadoEm: new Date().toISOString()
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Nova Consulta - {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Registre uma nova consulta do paciente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data da Consulta */}
          <div className="space-y-2">
            <Label htmlFor="data">Data da Consulta</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              required
            />
          </div>

          <Tabs defaultValue="medidas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="medidas">Medidas Antropométricas</TabsTrigger>
              <TabsTrigger value="dobras">Dobras Cutâneas</TabsTrigger>
              <TabsTrigger value="relatos">Relatos e Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="medidas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-primary" />
                    Medidas Antropométricas
                  </CardTitle>
                  <CardDescription>
                    Registre as medidas corporais do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={formData.medidas.peso || ''}
                        onChange={(e) => handleInputChange('medidas.peso', e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="altura">Altura (cm)</Label>
                      <Input
                        id="altura"
                        type="number"
                        value={formData.medidas.altura || ''}
                        onChange={(e) => handleInputChange('medidas.altura', e.target.value)}
                        placeholder="170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="circunferenciaBraco">Circunferência Braço (cm)</Label>
                      <Input
                        id="circunferenciaBraco"
                        type="number"
                        step="0.1"
                        value={formData.medidas.circunferenciaBraco || ''}
                        onChange={(e) => handleInputChange('medidas.circunferenciaBraco', e.target.value)}
                        placeholder="30.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="circunferenciaAbdomen">Circunferência Abdômen (cm)</Label>
                      <Input
                        id="circunferenciaAbdomen"
                        type="number"
                        step="0.1"
                        value={formData.medidas.circunferenciaAbdomen || ''}
                        onChange={(e) => handleInputChange('medidas.circunferenciaAbdomen', e.target.value)}
                        placeholder="85.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="circunferenciaQuadril">Circunferência Quadril (cm)</Label>
                      <Input
                        id="circunferenciaQuadril"
                        type="number"
                        step="0.1"
                        value={formData.medidas.circunferenciaQuadril || ''}
                        onChange={(e) => handleInputChange('medidas.circunferenciaQuadril', e.target.value)}
                        placeholder="95.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="circunferenciaPescoco">Circunferência Pescoço (cm)</Label>
                      <Input
                        id="circunferenciaPescoco"
                        type="number"
                        step="0.1"
                        value={formData.medidas.circunferenciaPescoco || ''}
                        onChange={(e) => handleInputChange('medidas.circunferenciaPescoco', e.target.value)}
                        placeholder="35.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentualGordura">Percentual de Gordura (%)</Label>
                      <Input
                        id="percentualGordura"
                        type="number"
                        step="0.1"
                        value={formData.medidas.percentualGordura || ''}
                        onChange={(e) => handleInputChange('medidas.percentualGordura', e.target.value)}
                        placeholder="15.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="massaMuscular">Massa Muscular (kg)</Label>
                      <Input
                        id="massaMuscular"
                        type="number"
                        step="0.1"
                        value={formData.medidas.massaMuscular || ''}
                        onChange={(e) => handleInputChange('medidas.massaMuscular', e.target.value)}
                        placeholder="45.0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dobras" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Dobras Cutâneas
                  </CardTitle>
                  <CardDescription>
                    Registre as medidas das dobras cutâneas em milímetros (mm)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tricipital">Dobra Tricipital (mm)</Label>
                      <Input
                        id="tricipital"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.tricipital || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.tricipital', e.target.value)}
                        placeholder="15.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bicipital">Dobra Bicipital (mm)</Label>
                      <Input
                        id="bicipital"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.bicipital || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.bicipital', e.target.value)}
                        placeholder="8.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subescapular">Dobra Subescapular (mm)</Label>
                      <Input
                        id="subescapular"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.subescapular || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.subescapular', e.target.value)}
                        placeholder="12.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suprailiaca">Dobra Suprailíaca (mm)</Label>
                      <Input
                        id="suprailiaca"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.suprailiaca || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.suprailiaca', e.target.value)}
                        placeholder="18.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abdominal">Dobra Abdominal (mm)</Label>
                      <Input
                        id="abdominal"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.abdominal || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.abdominal', e.target.value)}
                        placeholder="20.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coxa">Dobra da Coxa (mm)</Label>
                      <Input
                        id="coxa"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.coxa || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.coxa', e.target.value)}
                        placeholder="25.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panturrilha">Dobra da Panturrilha (mm)</Label>
                      <Input
                        id="panturrilha"
                        type="number"
                        step="0.1"
                        value={formData.dobrasCutaneas.panturrilha || ''}
                        onChange={(e) => handleInputChange('dobrasCutaneas.panturrilha', e.target.value)}
                        placeholder="10.0"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>💡 Dicas para medição das dobras cutâneas:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Use um adipômetro (plicômetro) calibrado</li>
                      <li>• Realize 3 medições e registre a média</li>
                      <li>• Mantenha pressão constante por 2-3 segundos</li>
                      <li>• Paciente em posição anatômica relaxada</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatos" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relatoPaciente">Relato do Paciente</Label>
                  <Textarea
                    id="relatoPaciente"
                    value={formData.relatoPaciente}
                    onChange={(e) => handleInputChange('relatoPaciente', e.target.value)}
                    placeholder="Como o paciente se sente, queixas, mudanças na alimentação, etc."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoesNutricionista">Observações do Nutricionista</Label>
                  <Textarea
                    id="observacoesNutricionista"
                    value={formData.observacoesNutricionista}
                    onChange={(e) => handleInputChange('observacoesNutricionista', e.target.value)}
                    placeholder="Avaliação profissional, recomendações, plano alimentar, etc."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Consulta"}
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
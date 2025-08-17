import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, MedidasAntropometricas, DobrasCutaneas, Bioimpedancia, ExameBioquimico, ResultadoExame, Anamnese } from "@/types";
import { Save, Activity, Ruler, TestTube, Plus, Trash2, FileText, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface NovaConsultaProps {
  cliente: Cliente;
  onClose: () => void;
}

export function NovaConsulta({ cliente, onClose }: NovaConsultaProps) {
  const { toast } = useToast();
  const [consultas, setConsultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [exames, setExames] = useLocalStorage<ExameBioquimico[]>('exames_bioquimicos', []);
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
    bioimpedancia: {
      faseAngle: 0,
      aguaCorporal: 0,
      massaMuscular: 0,
      ecmIcw: 0,
    } as Bioimpedancia,
    anamnese: {
      funcaoIntestinal: '' as const,
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
    } as Anamnese,
    relatoPaciente: '',
    observacoesNutricionista: '',
    sinaisAlerta: '',
  });

  const [resultadosExames, setResultadosExames] = useState<ResultadoExame[]>([]);
  const [novoExame, setNovoExame] = useState({
    exameId: '',
    valor: '',
    unidade: ''
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
    } else if (field.startsWith('bioimpedancia.')) {
      const bioimpedanciaField = field.replace('bioimpedancia.', '');
      setFormData(prev => ({
        ...prev,
        bioimpedancia: {
          ...prev.bioimpedancia,
          [bioimpedanciaField]: typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }));
    } else if (field.startsWith('anamnese.')) {
      const anamneseField = field.replace('anamnese.', '');
      setFormData(prev => ({
        ...prev,
        anamnese: {
          ...prev.anamnese,
          [anamneseField]: anamneseField === 'consumoAgua' && typeof value === 'string' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSintomaChange = (sintoma: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      anamnese: {
        ...prev.anamnese,
        sintomasAtuais: checked 
          ? [...prev.anamnese.sintomasAtuais, sintoma]
          : prev.anamnese.sintomasAtuais.filter(s => s !== sintoma)
      }
    }));
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
        bioimpedancia: formData.bioimpedancia,
        resultadosExames: resultadosExames,
        anamnese: formData.anamnese,
        relatoPaciente: formData.relatoPaciente,
        observacoesNutricionista: formData.observacoesNutricionista,
        sinaisAlerta: formData.sinaisAlerta,
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

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const adicionarExame = () => {
    if (!novoExame.exameId || !novoExame.valor) {
      toast({
        title: "Erro",
        description: "Selecione um exame e digite o valor.",
        variant: "destructive",
      });
      return;
    }

    const exame = exames.find(e => e.id === novoExame.exameId);
    if (!exame) return;

    // Determinar o gênero baseado no cliente (assumindo que temos essa informação)
    const idade = calcularIdade(cliente.dataNascimento);
    
    // Encontrar o valor de referência apropriado
    const valorReferencia = exame.valoresReferencia.find(vr => 
      (vr.genero === 'ambos' || vr.genero === 'masculino') && // Assumindo masculino por padrão
      idade >= vr.idadeMinima && 
      idade <= vr.idadeMaxima
    );

    const valorNumerico = parseFloat(novoExame.valor);
    let status: 'abaixo' | 'normal' | 'acima' = 'normal';
    
    if (valorReferencia) {
      if (valorNumerico < valorReferencia.minimo) {
        status = 'abaixo';
      } else if (valorNumerico > valorReferencia.maximo) {
        status = 'acima';
      }
    }

    const resultado: ResultadoExame = {
      exameId: exame.id,
      exameNome: exame.nome,
      valor: valorNumerico,
      unidade: novoExame.unidade || valorReferencia?.unidade || '',
      status
    };

    setResultadosExames([...resultadosExames, resultado]);
    setNovoExame({ exameId: '', valor: '', unidade: '' });
    
    toast({
      title: "Exame adicionado",
      description: `Resultado ${status === 'normal' ? 'dentro da normalidade' : status === 'abaixo' ? 'abaixo do normal' : 'acima do normal'}`,
    });
  };

  const removerExame = (index: number) => {
    setResultadosExames(resultadosExames.filter((_, i) => i !== index));
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="medidas">Medidas Antropométricas</TabsTrigger>
              <TabsTrigger value="dobras">Dobras Cutâneas</TabsTrigger>
              <TabsTrigger value="bioimpedancia">Bioimpedância</TabsTrigger>
              <TabsTrigger value="exames">Exames Bioquímicos</TabsTrigger>
              <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
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

            <TabsContent value="bioimpedancia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Bioimpedância
                  </CardTitle>
                  <CardDescription>
                    Registre os dados de bioimpedância do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="faseAngle">Ângulo de Fase (°)</Label>
                      <Input
                        id="faseAngle"
                        type="number"
                        step="0.1"
                        value={formData.bioimpedancia.faseAngle || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.faseAngle', e.target.value)}
                        placeholder="7.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aguaCorporal">Água Corporal (%)</Label>
                      <Input
                        id="aguaCorporal"
                        type="number"
                        step="0.1"
                        value={formData.bioimpedancia.aguaCorporal || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.aguaCorporal', e.target.value)}
                        placeholder="60.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="massaMuscularBio">Massa Muscular (kg)</Label>
                      <Input
                        id="massaMuscularBio"
                        type="number"
                        step="0.1"
                        value={formData.bioimpedancia.massaMuscular || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.massaMuscular', e.target.value)}
                        placeholder="45.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ecmIcw">ECM/ICW</Label>
                      <Input
                        id="ecmIcw"
                        type="number"
                        step="0.01"
                        value={formData.bioimpedancia.ecmIcw || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.ecmIcw', e.target.value)}
                        placeholder="0.85"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exames" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    Exames Bioquímicos
                  </CardTitle>
                  <CardDescription>
                    Registre os resultados dos exames laboratoriais do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Adicionar novo exame */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Exame</Label>
                      <Select value={novoExame.exameId} onValueChange={(value) => setNovoExame({ ...novoExame, exameId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um exame" />
                        </SelectTrigger>
                        <SelectContent>
                          {exames.filter(e => e.ativo).map((exame) => (
                            <SelectItem key={exame.id} value={exame.id}>
                              {exame.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novoExame.valor}
                        onChange={(e) => setNovoExame({ ...novoExame, valor: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input
                        value={novoExame.unidade}
                        onChange={(e) => setNovoExame({ ...novoExame, unidade: e.target.value })}
                        placeholder="mg/dL"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button type="button" onClick={adicionarExame} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Lista de exames adicionados */}
                  {resultadosExames.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Exames Registrados:</h4>
                      {resultadosExames.map((resultado, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{resultado.exameNome}</span>
                            <span>{resultado.valor} {resultado.unidade}</span>
                            <Badge 
                              variant={
                                resultado.status === 'normal' ? 'default' : 
                                resultado.status === 'abaixo' ? 'destructive' : 
                                'destructive'
                              }
                            >
                              {resultado.status === 'normal' ? 'Normal' : 
                               resultado.status === 'abaixo' ? 'Abaixo' : 'Acima'}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerExame(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>💡 Dicas para registro de exames:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Valores são comparados automaticamente com referências por idade</li>
                      <li>• Sempre confira a unidade de medida do exame</li>
                      <li>• Resultados fora da normalidade são destacados</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anamnese" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Anamnese
                  </CardTitle>
                  <CardDescription>
                    Registre informações sobre hábitos alimentares e sintomas do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Função Intestinal */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Função intestinal:</Label>
                    <RadioGroup 
                      value={formData.anamnese.funcaoIntestinal} 
                      onValueChange={(value) => handleInputChange('anamnese.funcaoIntestinal', value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="regular" />
                        <Label htmlFor="regular">Regular</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="constipada" id="constipada" />
                        <Label htmlFor="constipada">Constipada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="diarreia" id="diarreia" />
                        <Label htmlFor="diarreia">Diarreia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="alternancia" id="alternancia" />
                        <Label htmlFor="alternancia">Alternâncias</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="laxantes" id="laxantes" />
                        <Label htmlFor="laxantes">Uso de laxantes frequente</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Hábitos Alimentares */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Hábitos Alimentares:</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="padraoAlimentar">Padrão alimentar predominante:</Label>
                      <Input
                        id="padraoAlimentar"
                        value={formData.anamnese.padraoAlimentar}
                        onChange={(e) => handleInputChange('anamnese.padraoAlimentar', e.target.value)}
                        placeholder="Descreva o padrão alimentar do paciente"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="horariosIrregulares"
                          checked={formData.anamnese.horariosIrregulares}
                          onCheckedChange={(checked) => handleInputChange('anamnese.horariosIrregulares', checked as boolean)}
                        />
                        <Label htmlFor="horariosIrregulares">Horários irregulares / pulos de refeição?</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="compulsoes"
                          checked={formData.anamnese.compulsoes}
                          onCheckedChange={(checked) => handleInputChange('anamnese.compulsoes', checked as boolean)}
                        />
                        <Label htmlFor="compulsoes">Presença de compulsões ou beliscos frequentes?</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consumoAgua">Consumo de água (média/dia) - ml:</Label>
                      <Input
                        id="consumoAgua"
                        type="number"
                        value={formData.anamnese.consumoAgua || ''}
                        onChange={(e) => handleInputChange('anamnese.consumoAgua', e.target.value)}
                        placeholder="2000"
                      />
                    </div>
                  </div>

                  {/* Sinais e Sintomas Atuais */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Sinais e Sintomas Atuais:</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Cansaço excessivo',
                        'Inchaço / retenção',
                        'Constipação',
                        'Gases / distensão',
                        'Azia / refluxo',
                        'Dor de cabeça frequente',
                        'Queda de cabelo'
                      ].map((sintoma) => (
                        <div key={sintoma} className="flex items-center space-x-2">
                          <Checkbox 
                            id={sintoma}
                            checked={formData.anamnese.sintomasAtuais.includes(sintoma)}
                            onCheckedChange={(checked) => handleSintomaChange(sintoma, checked as boolean)}
                          />
                          <Label htmlFor={sintoma}>{sintoma}</Label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outros">Outros:</Label>
                      <Input
                        id="outros"
                        value={formData.anamnese.outros}
                        onChange={(e) => handleInputChange('anamnese.outros', e.target.value)}
                        placeholder="Outros sintomas não listados"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="habitosAjustar">Hábitos que precisam ser ajustados:</Label>
                      <Textarea
                        id="habitosAjustar"
                        value={formData.anamnese.habitosAjustar}
                        onChange={(e) => handleInputChange('anamnese.habitosAjustar', e.target.value)}
                        placeholder="Descreva os hábitos que precisam ser modificados"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Condutas Nutricionais Adotadas */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Condutas Nutricionais Adotadas:</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="manutencaoPlano">Manutenção / Ajuste do plano alimentar:</Label>
                      <Textarea
                        id="manutencaoPlano"
                        value={formData.anamnese.manutencaoPlano}
                        onChange={(e) => handleInputChange('anamnese.manutencaoPlano', e.target.value)}
                        placeholder="Descreva as orientações sobre o plano alimentar"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suplementacao">Introdução de suplementação:</Label>
                      <Input
                        id="suplementacao"
                        value={formData.anamnese.suplementacao}
                        onChange={(e) => handleInputChange('anamnese.suplementacao', e.target.value)}
                        placeholder="Suplementos recomendados"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alimentosPriorizados">Alimentos priorizados:</Label>
                      <Input
                        id="alimentosPriorizados"
                        value={formData.anamnese.alimentosPriorizados}
                        onChange={(e) => handleInputChange('anamnese.alimentosPriorizados', e.target.value)}
                        placeholder="Alimentos que devem ser priorizados"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alimentosEvitados">Alimentos evitados:</Label>
                      <Input
                        id="alimentosEvitados"
                        value={formData.anamnese.alimentosEvitados}
                        onChange={(e) => handleInputChange('anamnese.alimentosEvitados', e.target.value)}
                        placeholder="Alimentos que devem ser evitados"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reforcoComportamental">Reforço comportamental:</Label>
                      <Textarea
                        id="reforcoComportamental"
                        value={formData.anamnese.reforcoComportamental}
                        onChange={(e) => handleInputChange('anamnese.reforcoComportamental', e.target.value)}
                        placeholder="Orientações comportamentais"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estrategiasComplementares">Estratégias complementares:</Label>
                      <Textarea
                        id="estrategiasComplementares"
                        value={formData.anamnese.estrategiasComplementares}
                        onChange={(e) => handleInputChange('anamnese.estrategiasComplementares', e.target.value)}
                        placeholder="Outras estratégias e orientações complementares"
                        rows={2}
                      />
                    </div>
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

                <div className="space-y-2">
                  <Label htmlFor="sinaisAlerta" className="text-base font-medium text-destructive">
                    🚨 Sinais de Alerta
                  </Label>
                  <Textarea
                    id="sinaisAlerta"
                    value={formData.sinaisAlerta}
                    onChange={(e) => handleInputChange('sinaisAlerta', e.target.value)}
                    placeholder="Pontos de atenção importantes para a próxima consulta (ex: pressão alta, sintomas preocupantes, medicamentos, etc.)"
                    rows={3}
                    className="border-destructive/50 focus-visible:ring-destructive"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Este campo aparecerá em destaque no prontuário para facilitar a identificação na próxima consulta
                  </p>
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
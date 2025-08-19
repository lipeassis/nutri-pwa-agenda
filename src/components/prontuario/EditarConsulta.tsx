import { useState, useEffect } from "react";
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

interface EditarConsultaProps {
  cliente: Cliente;
  consulta: ConsultaProntuario;
  onClose: () => void;
}

export function EditarConsulta({ cliente, consulta, onClose }: EditarConsultaProps) {
  const { toast } = useToast();
  const [consultas, setConsultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [exames, setExames] = useLocalStorage<ExameBioquimico[]>('exames_bioquimicos', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    data: consulta.data,
    medidas: consulta.medidas,
    dobrasCutaneas: consulta.dobrasCutaneas || {
      tricipital: 0,
      bicipital: 0,
      subescapular: 0,
      suprailiaca: 0,
      abdominal: 0,
      coxa: 0,
      panturrilha: 0,
    } as DobrasCutaneas,
    bioimpedancia: consulta.bioimpedancia || {
      faseAngle: 0,
      aguaCorporal: 0,
      massaMuscular: 0,
      ecmIcw: 0,
    } as Bioimpedancia,
    anamnese: consulta.anamnese || {
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
    relatoPaciente: consulta.relatoPaciente || '',
    observacoesNutricionista: consulta.observacoesNutricionista || '',
    sinaisAlerta: consulta.sinaisAlerta || '',
  });

  const [resultadosExames, setResultadosExames] = useState<ResultadoExame[]>(consulta.resultadosExames || []);
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
      const consultaAtualizada: ConsultaProntuario = {
        ...consulta,
        data: formData.data,
        medidas: formData.medidas,
        dobrasCutaneas: formData.dobrasCutaneas,
        bioimpedancia: formData.bioimpedancia,
        resultadosExames: resultadosExames,
        anamnese: formData.anamnese,
        relatoPaciente: formData.relatoPaciente,
        observacoesNutricionista: formData.observacoesNutricionista,
        sinaisAlerta: formData.sinaisAlerta,
      };

      const consultasAtualizadas = consultas.map(c => 
        c.id === consulta.id ? consultaAtualizada : c
      );
      setConsultas(consultasAtualizadas);

      toast({
        title: "Consulta atualizada",
        description: "A consulta foi atualizada com sucesso.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a consulta.",
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

    const idade = calcularIdade(cliente.dataNascimento);
    
    const valorReferencia = exame.valoresReferencia.find(vr => 
      (vr.genero === 'ambos' || vr.genero === 'masculino') &&
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
      unidade: novoExame.unidade || '',
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
            Editar Consulta - {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Edite os dados da consulta do paciente
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

          <Tabs defaultValue="anamnese" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
              <TabsTrigger value="medidas">Antopometria</TabsTrigger>
              <TabsTrigger value="dobras">Dobras Cutâneas</TabsTrigger>
              <TabsTrigger value="exames">Exames</TabsTrigger>
              <TabsTrigger value="bioimpedancia">Bioimpedância</TabsTrigger>
              <TabsTrigger value="relatos">Evolução</TabsTrigger>
            </TabsList>

            <TabsContent value="anamnese" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anamnese</CardTitle>
                  <CardDescription>Informações sobre o histórico do paciente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="funcaoIntestinal">Função Intestinal</Label>
                      <Select
                        onValueChange={(value) => handleInputChange('anamnese.funcaoIntestinal', value)}
                        value={formData.anamnese.funcaoIntestinal}
                      >
                        <SelectTrigger id="funcaoIntestinal">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="constipacao">Constipação</SelectItem>
                          <SelectItem value="diarreia">Diarreia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="padraoAlimentar">Padrão Alimentar</Label>
                      <Input
                        id="padraoAlimentar"
                        type="text"
                        value={formData.anamnese.padraoAlimentar}
                        onChange={(e) => handleInputChange('anamnese.padraoAlimentar', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 flex items-center gap-2">
                      <Checkbox
                        id="horariosIrregulares"
                        checked={formData.anamnese.horariosIrregulares}
                        onCheckedChange={(checked) => handleInputChange('anamnese.horariosIrregulares', checked === true)}
                      />
                      <Label htmlFor="horariosIrregulares">Horários Irregulares</Label>
                    </div>
                    <div className="space-y-2 flex items-center gap-2">
                      <Checkbox
                        id="compulsoes"
                        checked={formData.anamnese.compulsoes}
                        onCheckedChange={(checked) => handleInputChange('anamnese.compulsoes', checked === true)}
                      />
                      <Label htmlFor="compulsoes">Compulsões Alimentares</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consumoAgua">Consumo de Água (ml)</Label>
                      <Input
                        id="consumoAgua"
                        type="number"
                        value={formData.anamnese.consumoAgua || ''}
                        onChange={(e) => handleInputChange('anamnese.consumoAgua', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sintomas Atuais</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Fadiga', 'Dor de cabeça', 'Náusea', 'Tontura'].map(sintoma => (
                          <div key={sintoma} className="flex items-center gap-2">
                            <Checkbox
                              id={`sintoma-${sintoma}`}
                              checked={formData.anamnese.sintomasAtuais.includes(sintoma)}
                              onCheckedChange={(checked) => handleSintomaChange(sintoma, checked === true)}
                            />
                            <Label htmlFor={`sintoma-${sintoma}`}>{sintoma}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outros">Outros</Label>
                      <Textarea
                        id="outros"
                        value={formData.anamnese.outros}
                        onChange={(e) => handleInputChange('anamnese.outros', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="habitosAjustar">Hábitos a Ajustar</Label>
                      <Textarea
                        id="habitosAjustar"
                        value={formData.anamnese.habitosAjustar}
                        onChange={(e) => handleInputChange('anamnese.habitosAjustar', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manutencaoPlano">Manutenção do Plano</Label>
                      <Textarea
                        id="manutencaoPlano"
                        value={formData.anamnese.manutencaoPlano}
                        onChange={(e) => handleInputChange('anamnese.manutencaoPlano', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suplementacao">Suplementação</Label>
                      <Textarea
                        id="suplementacao"
                        value={formData.anamnese.suplementacao}
                        onChange={(e) => handleInputChange('anamnese.suplementacao', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alimentosPriorizados">Alimentos Priorizados</Label>
                      <Textarea
                        id="alimentosPriorizados"
                        value={formData.anamnese.alimentosPriorizados}
                        onChange={(e) => handleInputChange('anamnese.alimentosPriorizados', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alimentosEvitados">Alimentos Evitados</Label>
                      <Textarea
                        id="alimentosEvitados"
                        value={formData.anamnese.alimentosEvitados}
                        onChange={(e) => handleInputChange('anamnese.alimentosEvitados', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reforcoComportamental">Reforço Comportamental</Label>
                      <Textarea
                        id="reforcoComportamental"
                        value={formData.anamnese.reforcoComportamental}
                        onChange={(e) => handleInputChange('anamnese.reforcoComportamental', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estrategiasComplementares">Estratégias Complementares</Label>
                      <Textarea
                        id="estrategiasComplementares"
                        value={formData.anamnese.estrategiasComplementares}
                        onChange={(e) => handleInputChange('anamnese.estrategiasComplementares', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <Zap className="w-5 h-5 text-primary" />
                    Dobras Cutâneas
                  </CardTitle>
                  <CardDescription>
                    Medidas das dobras cutâneas do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['tricipital', 'bicipital', 'subescapular', 'suprailiaca', 'abdominal', 'coxa', 'panturrilha'].map((campo) => (
                      <div key={campo} className="space-y-2">
                        <Label htmlFor={campo}>{campo.charAt(0).toUpperCase() + campo.slice(1)} (mm)</Label>
                        <Input
                          id={campo}
                          type="number"
                          step="0.1"
                          value={(formData.dobrasCutaneas as any)[campo] || ''}
                          onChange={(e) => handleInputChange(`dobrasCutaneas.${campo}`, e.target.value)}
                          placeholder="0.0"
                        />
                      </div>
                    ))}
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
                    Adicione e visualize os resultados dos exames
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      onValueChange={(value) => {
                        const exameSelecionado = exames.find(e => e.id === value);
                         setNovoExame(prev => ({
                           ...prev,
                           exameId: value,
                           unidade: ''
                         }));
                      }}
                      value={novoExame.exameId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o exame" />
                      </SelectTrigger>
                      <SelectContent>
                        {exames.map(exame => (
                          <SelectItem key={exame.id} value={exame.id}>{exame.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={novoExame.valor}
                      onChange={(e) => setNovoExame(prev => ({ ...prev, valor: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Unidade"
                      value={novoExame.unidade}
                      onChange={(e) => setNovoExame(prev => ({ ...prev, unidade: e.target.value }))}
                    />
                    <Button type="button" onClick={adicionarExame} className="col-span-full md:col-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Exame
                    </Button>
                  </div>

                  <div>
                    {resultadosExames.length === 0 && <p>Nenhum exame adicionado.</p>}
                    {resultadosExames.map((resultado, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 border rounded p-2 mb-2">
                        <div>
                          <p className="font-semibold">{resultado.exameNome}</p>
                          <p>{resultado.valor} {resultado.unidade} - <Badge variant={resultado.status === 'normal' ? 'secondary' : 'destructive'}>{resultado.status}</Badge></p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removerExame(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bioimpedancia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Bioimpedância
                  </CardTitle>
                  <CardDescription>
                    Dados da bioimpedância do paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="faseAngle">Ângulo de Fase</Label>
                      <Input
                        id="faseAngle"
                        type="number"
                        step="0.1"
                        value={formData.bioimpedancia.faseAngle || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.faseAngle', e.target.value)}
                        placeholder="0.0"
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
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="massaMuscular">Massa Muscular (kg)</Label>
                      <Input
                        id="massaMuscular"
                        type="number"
                        step="0.1"
                        value={formData.bioimpedancia.massaMuscular || ''}
                        onChange={(e) => handleInputChange('bioimpedancia.massaMuscular', e.target.value)}
                        placeholder="0.0"
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
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Evolução e Observações
                  </CardTitle>
                  <CardDescription>
                    Relato do paciente, observações do nutricionista e sinais de alerta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="relatoPaciente">Relato do Paciente</Label>
                    <Textarea
                      id="relatoPaciente"
                      value={formData.relatoPaciente}
                      onChange={(e) => handleInputChange('relatoPaciente', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoesNutricionista">Observações do Nutricionista</Label>
                    <Textarea
                      id="observacoesNutricionista"
                      value={formData.observacoesNutricionista}
                      onChange={(e) => handleInputChange('observacoesNutricionista', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sinaisAlerta">Sinais de Alerta</Label>
                    <Textarea
                      id="sinaisAlerta"
                      value={formData.sinaisAlerta}
                      onChange={(e) => handleInputChange('sinaisAlerta', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || consulta.fechado}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : consulta.fechado ? 'Consulta Fechada' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

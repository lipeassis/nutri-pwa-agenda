import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, ObjetivosCliente, Doenca, Alergia, DocumentoCliente, PlanejamentoAlimentar, Alimento, AtualizacaoQuestionario, ReceitaMedica, ClientePrograma } from "@/types";
import { ArrowLeft, Plus, TrendingUp, Target, Calendar, User, Weight, Ruler, Activity, FileText, Link as LinkIcon, Edit, Settings, TestTube, Upload, Download, Trash2, File, Image, Apple, ChefHat, Clock, Pill, Star, CheckCircle, XCircle, Eye, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NovaConsulta } from "@/components/prontuario/NovaConsulta";
import { NovoObjetivo } from "@/components/prontuario/NovoObjetivo";
import { GraficoEvolucao } from "@/components/prontuario/GraficoEvolucao";
import { EditarCliente } from "@/components/prontuario/EditarCliente";
import { AdicionarDoencasAlergias } from "@/components/prontuario/AdicionarDoencasAlergias";
import { NovoPlanejamento } from "@/components/prontuario/NovoPlanejamento";
import { NovaReceita } from "@/components/prontuario/NovaReceita";
import { AdicionarExame } from "@/components/prontuario/AdicionarExame";
import { VincularPrograma } from "@/components/prontuario/VincularPrograma";
import { AtualizacoesQuestionario } from "@/components/prontuario/AtualizacoesQuestionario";
import { VincularFormula } from "@/components/prontuario/VincularFormula";
import { FotosEvolucao } from "@/components/prontuario/FotosEvolucao";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Prontuario() {
  const { toast } = useToast();
  const { clienteId } = useParams<{ clienteId: string }>();
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [consultas, setConsultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [objetivos] = useLocalStorage<ObjetivosCliente[]>('nutriapp-objetivos', []);
  const [doencas] = useLocalStorage<Doenca[]>('nutriapp-doencas', []);
  const [alergias] = useLocalStorage<Alergia[]>('nutriapp-alergias', []);
  const [documentos, setDocumentos] = useLocalStorage<DocumentoCliente[]>('nutriapp-documentos', []);
  const [planejamentos, setPlanejamentos] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  const [receitas, setReceitas] = useLocalStorage<ReceitaMedica[]>('nutriapp-receitas', []);
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  const [atualizacoes, setAtualizacoes] = useLocalStorage<AtualizacaoQuestionario[]>('nutriapp-atualizacoes', []);
  const [clienteProgramas, setClienteProgramas] = useLocalStorage<ClientePrograma[]>('nutriapp-cliente-programas', []);
  const [showNovaConsulta, setShowNovaConsulta] = useState(false);
  const [showNovoObjetivo, setShowNovoObjetivo] = useState(false);
  const [showEditarCliente, setShowEditarCliente] = useState(false);
  const [showAdicionarDoencasAlergias, setShowAdicionarDoencasAlergias] = useState(false);
  const [showNovoPlanejamento, setShowNovoPlanejamento] = useState(false);
  const [planejamentoParaEditar, setPlanejamentoParaEditar] = useState<PlanejamentoAlimentar | null>(null);
  const [showNovaReceita, setShowNovaReceita] = useState(false);
  const [showAdicionarExame, setShowAdicionarExame] = useState(false);
  const [showVincularPrograma, setShowVincularPrograma] = useState(false);
  const [receitaParaEditar, setReceitaParaEditar] = useState<ReceitaMedica | null>(null);
  const [consultaSelecionada, setConsultaSelecionada] = useState<ConsultaProntuario | null>(null);
  const [showDetalhesConsulta, setShowDetalhesConsulta] = useState(false);

  const cliente = clientes.find(c => c.id === clienteId);
  const consultasCliente = consultas
    .filter(c => c.clienteId === clienteId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  const objetivosCliente = objetivos
    .filter(o => o.clienteId === clienteId)
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  const objetivoAtivo = objetivosCliente.find(o => o.ativo);
  const ultimaConsulta = consultasCliente[0];

  const doencasCliente = doencas.filter(d => cliente?.doencasIds?.includes(d.id) && d.ativo);
  const alergiasCliente = alergias.filter(a => cliente?.alergiasIds?.includes(a.id) && a.ativo);
  const programasCliente = clienteProgramas.filter(cp => cp.clienteId === clienteId);

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">O cliente solicitado não existe.</p>
          <Button asChild>
            <Link to="/clientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para clientes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const calcularIMC = (peso: number, altura: number) => {
    const alturaMetros = altura / 100;
    const imc = peso / (alturaMetros * alturaMetros);
    return imc.toFixed(1);
  };

  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { label: "Abaixo do peso", variant: "secondary" as const };
    if (imc < 25) return { label: "Peso normal", variant: "default" as const };
    if (imc < 30) return { label: "Sobrepeso", variant: "destructive" as const };
    return { label: "Obesidade", variant: "destructive" as const };
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = (documento: DocumentoCliente) => {
    const link = document.createElement('a');
    link.href = documento.arquivo;
    link.download = documento.nome;
    link.click();
  };

  const deleteDocument = (documentoId: string) => {
    setDocumentos(documentos.filter(d => d.id !== documentoId));
  };

  // Componente de Upload
  const UploadDocument = ({ clienteId, onUpload }: { clienteId: string; onUpload: (doc: DocumentoCliente) => void }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tipoDocumento, setTipoDocumento] = useState<DocumentoCliente['tipo']>('outros');
    const [descricao, setDescricao] = useState('');

    const tiposDocumento = [
      { value: 'exame', label: 'Exame Médico' },
      { value: 'receita', label: 'Receita Médica' },
      { value: 'relatorio', label: 'Relatório' },
      { value: 'atestado', label: 'Atestado' },
      { value: 'termo', label: 'Termo de Consentimento' },
      { value: 'foto', label: 'Foto/Imagem' },
      { value: 'outros', label: 'Outros' }
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      setShowDialog(true);
      
      // Reset form
      setTipoDocumento('outros');
      setDescricao('');
    };

    const handleUpload = () => {
      if (!selectedFile) return;

      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const documento: DocumentoCliente = {
          id: Date.now().toString(),
          clienteId,
          nome: selectedFile.name,
          tipo: tipoDocumento,
          arquivo: e.target?.result as string,
          tamanho: selectedFile.size,
          mimeType: selectedFile.type,
          descricao: descricao.trim() || undefined,
          criadoEm: new Date().toISOString(),
          criadoPor: 'user' // Substituir pelo ID do usuário logado
        };
        
        onUpload(documento);
        setIsUploading(false);
        setShowDialog(false);
        setSelectedFile(null);
        setDescricao('');
        toast({
          title: "Documento anexado",
          description: "O documento foi anexado com sucesso ao prontuário.",
        });
      };
      
      reader.readAsDataURL(selectedFile);
    };

    return (
      <>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Anexar Documento
            </label>
          </Button>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anexar Documento</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Arquivo selecionado: <span className="font-medium">{selectedFile?.name}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Tipo de Documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as DocumentoCliente['tipo'])}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {tiposDocumento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Descrição (opcional)</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Adicione uma breve descrição sobre o documento..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? 'Anexando...' : 'Anexar Documento'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const calcularTotaisRefeicao = (refeicao: any) => {
    return refeicao.alimentos.reduce((total: any, alimentoRef: any) => {
      const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
      if (!alimento) return total;

      const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
      return {
        kcal: total.kcal + (alimento.informacaoNutricional.kcal * fator),
        proteina: total.proteina + (alimento.informacaoNutricional.proteina * fator),
        carboidratos: total.carboidratos + (alimento.informacaoNutricional.carboidratos * fator),
        lipideos: total.lipideos + (alimento.informacaoNutricional.lipideos * fator),
      };
    }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });
  };

  const handleAddSampleAtualizacoes = (sampleData: AtualizacaoQuestionario[]) => {
    setAtualizacoes([...atualizacoes, ...sampleData]);
  };

  const finalizarPrograma = (programaId: string) => {
    if (window.confirm('Tem certeza que deseja finalizar este programa?')) {
      setClienteProgramas(clienteProgramas.map(cp => 
        cp.id === programaId ? { ...cp, ativo: false } : cp
      ));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/clientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <User className="w-8 h-8 mr-3 text-primary" />
              {cliente.nome}
            </h1>
            <p className="text-muted-foreground">Prontuário do paciente</p>
          </div>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Informações Básicas</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditarCliente(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar Dados
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdicionarDoencasAlergias(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Doenças/Alergias
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{cliente.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p className="text-base">{cliente.telefone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p className="text-base">
                {cliente.dataNascimento ? format(new Date(cliente.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
              <p className="text-base">
                {format(new Date(cliente.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats atuais */}
      {ultimaConsulta && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Weight className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.peso}kg</p>
                  <p className="text-sm text-muted-foreground">Peso atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-success" />
                <div>
                  <p className="text-2xl font-bold">
                    {calcularIMC(ultimaConsulta.medidas.peso, ultimaConsulta.medidas.altura)}
                  </p>
                  <p className="text-sm text-muted-foreground">IMC atual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.percentualGordura}%</p>
                  <p className="text-sm text-muted-foreground">Gordura corporal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{ultimaConsulta.medidas.massaMuscular}kg</p>
                  <p className="text-sm text-muted-foreground">Massa muscular</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sinais de Alerta */}
      {ultimaConsulta?.sinaisAlerta && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              🚨 Sinais de Alerta - Atenção na Próxima Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background p-4 rounded-md border border-destructive/20">
              <p className="text-sm whitespace-pre-wrap">{ultimaConsulta.sinaisAlerta}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              📅 Registrado em: {format(new Date(ultimaConsulta.data), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="historico" className="space-y-6">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="atualizacoes">Atualizações</TabsTrigger>
          <TabsTrigger value="historico">Consultas</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="receitas">Medicamentos</TabsTrigger>
          <TabsTrigger value="formulas">Fórmulas</TabsTrigger>
          <TabsTrigger value="programas">Programas</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="doencas">Doenças/Alergias</TabsTrigger>
          <TabsTrigger value="fotos">Fotos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consultas Realizadas</h3>
            <Button onClick={() => setShowNovaConsulta(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          {consultasCliente.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma consulta registrada</h3>
                <p className="text-muted-foreground mb-4">
                  Registre a primeira consulta do paciente
                </p>
                <Button onClick={() => setShowNovaConsulta(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Consulta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {consultasCliente.map((consulta, index) => (
                <Card key={consulta.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Consulta {format(new Date(consulta.data), "dd/MM/yyyy", { locale: ptBR })}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Badge>Mais recente</Badge>}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConsultaSelecionada(consulta);
                            setShowDetalhesConsulta(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta consulta?')) {
                              const consultasAtualizadas = consultas.filter(c => c.id !== consulta.id);
                              setConsultas(consultasAtualizadas);
                              toast({
                                title: "Consulta excluída",
                                description: "A consulta foi removida com sucesso.",
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Medidas */}
                    <div>
                      <h4 className="font-medium mb-2">Medidas Antropométricas</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Peso:</span> {consulta.medidas.peso}kg
                        </div>
                        <div>
                          <span className="text-muted-foreground">Altura:</span> {consulta.medidas.altura}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Braço:</span> {consulta.medidas.circunferenciaBraco}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Abdômen:</span> {consulta.medidas.circunferenciaAbdomen}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Quadril:</span> {consulta.medidas.circunferenciaQuadril}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">C. Pescoço:</span> {consulta.medidas.circunferenciaPescoco}cm
                        </div>
                        <div>
                          <span className="text-muted-foreground">% Gordura:</span> {consulta.medidas.percentualGordura}%
                        </div>
                        <div>
                          <span className="text-muted-foreground">M. Muscular:</span> {consulta.medidas.massaMuscular}kg
                        </div>
                      </div>
                    </div>

                    {/* Dobras Cutâneas */}
                    {consulta.dobrasCutaneas && (
                      <div>
                        <h4 className="font-medium mb-2">Dobras Cutâneas</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tricipital:</span> {consulta.dobrasCutaneas.tricipital}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bicipital:</span> {consulta.dobrasCutaneas.bicipital}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subescapular:</span> {consulta.dobrasCutaneas.subescapular}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Suprailíaca:</span> {consulta.dobrasCutaneas.suprailiaca}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Abdominal:</span> {consulta.dobrasCutaneas.abdominal}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Coxa:</span> {consulta.dobrasCutaneas.coxa}mm
                          </div>
                          <div>
                            <span className="text-muted-foreground">Panturrilha:</span> {consulta.dobrasCutaneas.panturrilha}mm
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Anamnese */}
                    {consulta.anamnese && (
                      <div>
                        <h4 className="font-medium mb-2">Anamnese</h4>
                        <div className="space-y-3 bg-muted p-4 rounded-md">
                          {consulta.anamnese.funcaoIntestinal && (
                            <div className="flex gap-2">
                              <span className="font-medium text-sm">Função Intestinal:</span>
                              <span className="text-sm capitalize">{consulta.anamnese.funcaoIntestinal}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.padraoAlimentar && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Padrão Alimentar:</span>
                              <span className="text-sm">{consulta.anamnese.padraoAlimentar}</span>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex gap-2">
                              <span className="font-medium text-sm">Horários Irregulares:</span>
                              <span className="text-sm">{consulta.anamnese.horariosIrregulares ? 'Sim' : 'Não'}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium text-sm">Compulsões:</span>
                              <span className="text-sm">{consulta.anamnese.compulsoes ? 'Sim' : 'Não'}</span>
                            </div>
                          </div>
                          
                          {consulta.anamnese.consumoAgua > 0 && (
                            <div className="flex gap-2">
                              <span className="font-medium text-sm">Consumo de Água:</span>
                              <span className="text-sm">{consulta.anamnese.consumoAgua}L/dia</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.sintomasAtuais && consulta.anamnese.sintomasAtuais.length > 0 && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Sintomas Atuais:</span>
                              <div className="flex flex-wrap gap-1">
                                {consulta.anamnese.sintomasAtuais.map((sintoma, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {sintoma}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {consulta.anamnese.outros && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Outros:</span>
                              <span className="text-sm">{consulta.anamnese.outros}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.habitosAjustar && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Hábitos a Ajustar:</span>
                              <span className="text-sm">{consulta.anamnese.habitosAjustar}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.manutencaoPlano && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Manutenção do Plano:</span>
                              <span className="text-sm">{consulta.anamnese.manutencaoPlano}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.suplementacao && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Suplementação:</span>
                              <span className="text-sm">{consulta.anamnese.suplementacao}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.alimentosPriorizados && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Alimentos Priorizados:</span>
                              <span className="text-sm">{consulta.anamnese.alimentosPriorizados}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.alimentosEvitados && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Alimentos Evitados:</span>
                              <span className="text-sm">{consulta.anamnese.alimentosEvitados}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.reforcoComportamental && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Reforço Comportamental:</span>
                              <span className="text-sm">{consulta.anamnese.reforcoComportamental}</span>
                            </div>
                          )}
                          
                          {consulta.anamnese.estrategiasComplementares && (
                            <div>
                              <span className="font-medium text-sm block mb-1">Estratégias Complementares:</span>
                              <span className="text-sm">{consulta.anamnese.estrategiasComplementares}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Relato do paciente */}
                    {consulta.relatoPaciente && (
                      <div>
                        <h4 className="font-medium mb-2">Relato do Paciente</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {consulta.relatoPaciente}
                        </p>
                      </div>
                    )}

                    {/* Observações */}
                    {consulta.observacoesNutricionista && (
                      <div>
                        <h4 className="font-medium mb-2">Observações do Nutricionista</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {consulta.observacoesNutricionista}
                        </p>
                      </div>
                    )}

                    {/* Sinais de Alerta */}
                    {consulta.sinaisAlerta && (
                      <div className="border border-destructive/50 bg-destructive/10 p-3 rounded-md">
                        <h4 className="font-medium mb-2 text-destructive flex items-center gap-2">
                          🚨 Sinais de Alerta
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">
                          {consulta.sinaisAlerta}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          <h3 className="text-lg font-semibold">Evolução do Paciente</h3>
          {consultasCliente.length >= 2 ? (
            <GraficoEvolucao consultas={consultasCliente} objetivos={objetivoAtivo} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Dados insuficientes para gráficos</h3>
                <p className="text-muted-foreground">
                  São necessárias pelo menos 2 consultas para gerar gráficos de evolução
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="objetivos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Objetivos do Paciente</h3>
            <Button onClick={() => setShowNovoObjetivo(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Objetivo
            </Button>
          </div>

          {objetivosCliente.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum objetivo definido</h3>
                <p className="text-muted-foreground mb-4">
                  Defina objetivos para acompanhar o progresso do paciente
                </p>
                <Button onClick={() => setShowNovoObjetivo(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Definir Objetivo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {objetivosCliente.map((objetivo) => (
                <Card key={objetivo.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Objetivo criado em {format(new Date(objetivo.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                      </CardTitle>
                      <Badge variant={objetivo.ativo ? "default" : "secondary"}>
                        {objetivo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Peso Meta</p>
                        <p className="text-lg font-semibold">{objetivo.pesoMeta}kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Prazo</p>
                        <p className="text-lg font-semibold">{objetivo.prazoMeses} meses</p>
                      </div>
                      {ultimaConsulta && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Progresso</p>
                          <p className="text-lg font-semibold">
                            {Math.abs(ultimaConsulta.medidas.peso - objetivo.pesoMeta).toFixed(1)}kg restantes
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {objetivo.observacoes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm bg-muted p-3 rounded-md">{objetivo.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exames" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Histórico de Exames Bioquímicos</h3>
            <Button onClick={() => setShowAdicionarExame(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Exames
            </Button>
          </div>
          
          {consultas.filter(c => c.resultadosExames && c.resultadosExames.length > 0).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum exame registrado</h3>
                <p className="text-muted-foreground">
                  Os resultados dos exames aparecerão aqui quando adicionados nas consultas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {consultas
                .filter(c => c.resultadosExames && c.resultadosExames.length > 0)
                .map((consulta) => (
                  <Card key={consulta.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-primary" />
                        Exames - {new Date(consulta.data).toLocaleDateString('pt-BR')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {consulta.resultadosExames.map((resultado, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{resultado.exameNome}</h4>
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
                              <div className="text-lg font-semibold">
                                {resultado.valor} {resultado.unidade}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Planejamento Alimentar</h3>
            <Button onClick={() => setShowNovoPlanejamento(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Planejamento
            </Button>
          </div>
          
          {planejamentos.filter(p => p.clienteId === cliente.id && p.ativo).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum planejamento alimentar</h3>
                <p className="text-muted-foreground">
                  Crie um planejamento alimentar personalizado para o paciente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {planejamentos
                .filter(p => p.clienteId === cliente.id && p.ativo)
                .map((plano) => (
                  <Card key={plano.id}>
                     <CardHeader>
                       <div className="flex items-center justify-between">
                         <div>
                           <CardTitle className="flex items-center gap-2">
                             <ChefHat className="w-5 h-5 text-primary" />
                             {plano.nome}
                           </CardTitle>
                           <CardDescription>
                             {plano.descricao}
                           </CardDescription>
                         </div>
                         <div className="flex items-center gap-3">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => setPlanejamentoParaEditar(plano)}
                           >
                             <Edit className="w-4 h-4 mr-2" />
                             Editar
                           </Button>
                           <div className="text-right text-sm text-muted-foreground">
                             <div>Início: {new Date(plano.dataInicio).toLocaleDateString('pt-BR')}</div>
                             {plano.dataFim && (
                               <div>Fim: {new Date(plano.dataFim).toLocaleDateString('pt-BR')}</div>
                             )}
                           </div>
                         </div>
                       </div>
                     </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {plano.refeicoes.map((refeicao) => {
                          const totais = calcularTotaisRefeicao(refeicao);
                          
                          return (
                            <div key={refeicao.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {refeicao.nome} - {refeicao.horario}
                                </h4>
                                <div className="text-sm text-muted-foreground">
                                  {totais.kcal.toFixed(0)} kcal | {totais.proteina.toFixed(1)}g P | {totais.carboidratos.toFixed(1)}g C | {totais.lipideos.toFixed(1)}g L
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                {refeicao.alimentos.map((alimentoRef, index) => {
                                  const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
                                  if (!alimento) return null;
                                  
                                  const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
                                  
                                  return (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                      <span className="font-medium">{alimentoRef.alimentoNome}</span>
                                      <div className="flex gap-4 text-muted-foreground">
                                        <span>{alimentoRef.quantidade} {alimentoRef.unidade}</span>
                                        <span>{(alimento.informacaoNutricional.kcal * fator).toFixed(0)} kcal</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="receitas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Receitas Médicas</h3>
            <Button onClick={() => setShowNovaReceita(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Receita
            </Button>
          </div>
          
          {receitas.filter(r => r.clienteId === cliente.id && r.ativo).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma receita cadastrada</h3>
                <p className="text-muted-foreground">
                  Cadastre medicamentos e suplementos prescritos para o paciente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receitas
                .filter(r => r.clienteId === cliente.id && r.ativo)
                .sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
                .map((receita) => (
                  <Card key={receita.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Pill className="w-5 h-5 text-primary" />
                            {receita.nome}
                            <Badge variant={receita.tipo === 'medicamento' ? 'default' : 'outline'}>
                              {receita.tipo}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {receita.dosagem} - {receita.frequencia}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setReceitaParaEditar(receita)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Emissão: {new Date(receita.dataEmissao).toLocaleDateString('pt-BR')}</div>
                            <div>Início: {new Date(receita.dataInicio).toLocaleDateString('pt-BR')}</div>
                            {receita.dataFim && (
                              <div>Fim: {new Date(receita.dataFim).toLocaleDateString('pt-BR')}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duração</p>
                          <p className="text-base">{receita.duracao}</p>
                        </div>
                        {receita.medico && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Médico</p>
                            <p className="text-base">{receita.medico}</p>
                          </div>
                        )}
                      </div>
                      
                      {receita.instrucoes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Instruções de Uso</p>
                          <p className="text-sm bg-muted p-3 rounded-md">{receita.instrucoes}</p>
                        </div>
                      )}
                      
                      {receita.observacoes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
                          <p className="text-sm bg-muted p-3 rounded-md">{receita.observacoes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="formulas" className="space-y-4">
          <VincularFormula 
            clienteId={cliente.id} 
            clienteNome={cliente.nome}
          />
        </TabsContent>

        <TabsContent value="fotos" className="space-y-4">
          <FotosEvolucao clienteId={cliente.id} />
        </TabsContent>

        <TabsContent value="programas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Programas Nutricionais</h3>
            <Button onClick={() => setShowVincularPrograma(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Vincular Programa
            </Button>
          </div>
          
          {programasCliente.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum programa vinculado</h3>
                <p className="text-muted-foreground">
                  Vincule o cliente a um programa nutricional para acompanhar seu progresso
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {programasCliente
                .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
                .map((clientePrograma) => {
                  const isAtivo = clientePrograma.ativo && new Date(clientePrograma.dataFim) >= new Date();
                  const isVencido = new Date(clientePrograma.dataFim) < new Date();
                  
                  return (
                    <Card key={clientePrograma.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-primary" />
                              {clientePrograma.programaNome}
                              {isAtivo ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Ativo
                                </Badge>
                              ) : isVencido ? (
                                <Badge variant="secondary">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Vencido
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Finalizado
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              Período: {format(new Date(clientePrograma.dataInicio), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(clientePrograma.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            {isAtivo && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => finalizarPrograma(clientePrograma.id)}
                              >
                                Finalizar
                              </Button>
                            )}
                            <div className="text-right text-sm text-muted-foreground">
                              <div>Valor: R$ {clientePrograma.preco.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                            <p className="text-base">{format(new Date(clientePrograma.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Data de Fim</p>
                            <p className="text-base">{format(new Date(clientePrograma.dataFim), "dd/MM/yyyy", { locale: ptBR })}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <p className="text-base">
                              {isAtivo ? "Em andamento" : isVencido ? "Vencido" : "Finalizado"}
                            </p>
                          </div>
                        </div>
                        
                        {clientePrograma.observacoes && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
                            <p className="text-sm bg-muted p-3 rounded-md">{clientePrograma.observacoes}</p>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          Vinculado em {format(new Date(clientePrograma.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="atualizacoes" className="space-y-4">
          <AtualizacoesQuestionario 
            clienteId={cliente.id} 
            atualizacoes={atualizacoes.filter(a => a.clienteId === cliente.id)} 
            onAddSampleData={handleAddSampleAtualizacoes}
          />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Documentos do Paciente</h3>
            <UploadDocument clienteId={cliente.id} onUpload={(doc) => setDocumentos([...documentos, doc])} />
          </div>
          
          {documentos.filter(d => d.clienteId === cliente.id).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento anexado</h3>
                <p className="text-muted-foreground">
                  Anexe documentos como exames, receitas e relatórios do paciente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documentos
                .filter(d => d.clienteId === cliente.id)
                .map((documento) => {
                  const tipoLabel = {
                    'exame': 'Exame Médico',
                    'receita': 'Receita Médica',
                    'relatorio': 'Relatório',
                    'atestado': 'Atestado',
                    'termo': 'Termo de Consentimento',
                    'foto': 'Foto/Imagem',
                    'outros': 'Outros'
                  }[documento.tipo] || documento.tipo;

                  return (
                    <Card key={documento.id}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getFileIcon(documento.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{documento.nome}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(documento.tamanho)}
                              </p>
                            </div>
                          </div>
                          
                          {documento.descricao && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {documento.descricao}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {tipoLabel}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadDocument(documento)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument(documento.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {new Date(documento.criadoEm).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doencas" className="space-y-4">
          <h3 className="text-lg font-semibold">Doenças e Alergias do Paciente</h3>
          
          {/* Doenças */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Doenças
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doencasCliente.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma doença registrada</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Doença</TableHead>
                      <TableHead>Resumo</TableHead>
                      <TableHead>Protocolo Nutricional</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Links Úteis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doencasCliente.map((doenca) => (
                      <TableRow key={doenca.id}>
                        <TableCell className="font-medium">{doenca.nome}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm">{doenca.resumo}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm whitespace-pre-wrap">
                            {doenca.protocoloNutricional || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm">{doenca.referencia || "-"}</div>
                        </TableCell>
                        <TableCell>
                          {doenca.linksUteis.length > 0 ? (
                            <div className="space-y-1">
                              {doenca.linksUteis.map((link, index) => (
                                <div key={index}>
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                                  >
                                    <LinkIcon className="w-3 h-3" />
                                    Link {index + 1}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Alergias */}
          <Card>
            <CardHeader>
              <CardTitle>Alergias</CardTitle>
            </CardHeader>
            <CardContent>
              {alergiasCliente.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma alergia registrada</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {alergiasCliente.map((alergia) => (
                    <Card key={alergia.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alergia.nome}</h4>
                            <Badge variant={
                              alergia.severidade === 'grave' ? 'destructive' :
                              alergia.severidade === 'moderada' ? 'default' : 'secondary'
                            }>
                              {alergia.severidade}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alergia.descricao}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modais */}
      {showNovaConsulta && (
        <NovaConsulta
          cliente={cliente}
          onClose={() => setShowNovaConsulta(false)}
        />
      )}

      {showNovoObjetivo && (
        <NovoObjetivo
          cliente={cliente}
          onClose={() => setShowNovoObjetivo(false)}
        />
      )}

      {showEditarCliente && (
        <EditarCliente
          cliente={cliente}
          open={showEditarCliente}
          onClose={() => setShowEditarCliente(false)}
        />
      )}

      {showAdicionarDoencasAlergias && (
        <AdicionarDoencasAlergias
          cliente={cliente}
          open={showAdicionarDoencasAlergias}
          onClose={() => setShowAdicionarDoencasAlergias(false)}
        />
      )}
        {showNovoPlanejamento && (
          <NovoPlanejamento
            clienteId={cliente.id}
            cliente={cliente}
            onClose={() => setShowNovoPlanejamento(false)}
            onSave={(plano) => setPlanejamentos([...planejamentos, plano])}
          />
        )}

        {planejamentoParaEditar && (
          <NovoPlanejamento
            clienteId={cliente.id}
            cliente={cliente}
            planejamentoParaEditar={planejamentoParaEditar}
            onClose={() => setPlanejamentoParaEditar(null)}
            onSave={(plano) => {
              setPlanejamentos(planejamentos.map(p => 
                p.id === plano.id ? plano : p
              ));
              setPlanejamentoParaEditar(null);
            }}
          />
        )}

        {showNovaReceita && (
          <NovaReceita
            clienteId={cliente.id}
            onClose={() => setShowNovaReceita(false)}
            onSave={(receita) => {
              setReceitas([...receitas, receita]);
              setShowNovaReceita(false);
            }}
          />
        )}

        {receitaParaEditar && (
          <NovaReceita
            clienteId={cliente.id}
            receitaParaEditar={receitaParaEditar}
            onClose={() => setReceitaParaEditar(null)}
            onSave={(receita) => {
              setReceitas(receitas.map(r => 
                r.id === receita.id ? receita : r
              ));
              setReceitaParaEditar(null);
            }}
          />
        )}

        {showAdicionarExame && (
          <AdicionarExame
            cliente={cliente}
            onClose={() => setShowAdicionarExame(false)}
          />
        )}

        {showVincularPrograma && (
          <VincularPrograma
            cliente={cliente}
            onClose={() => setShowVincularPrograma(false)}
          />
        )}

        {/* Modal de detalhes da consulta */}
        <Dialog open={showDetalhesConsulta} onOpenChange={setShowDetalhesConsulta}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Detalhes da Consulta - {consultaSelecionada && format(new Date(consultaSelecionada.data), "dd/MM/yyyy", { locale: ptBR })}
              </DialogTitle>
            </DialogHeader>
            
            {consultaSelecionada && (
              <div className="space-y-6">
                {/* Medidas Antropométricas */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg">Medidas Antropométricas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <span className="text-muted-foreground text-sm">Peso:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.peso}kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Altura:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.altura}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">C. Braço:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.circunferenciaBraco}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">C. Abdômen:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.circunferenciaAbdomen}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">C. Quadril:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.circunferenciaQuadril}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">C. Pescoço:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.circunferenciaPescoco}cm</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">% Gordura:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.percentualGordura}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">M. Muscular:</span>
                      <p className="font-medium">{consultaSelecionada.medidas.massaMuscular}kg</p>
                    </div>
                  </div>
                </div>

                {/* Dobras Cutâneas */}
                {consultaSelecionada.dobrasCutaneas && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Dobras Cutâneas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <span className="text-muted-foreground text-sm">Tricipital:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.tricipital}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Bicipital:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.bicipital}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Subescapular:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.subescapular}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Suprailíaca:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.suprailiaca}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Abdominal:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.abdominal}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Coxa:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.coxa}mm</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Panturrilha:</span>
                        <p className="font-medium">{consultaSelecionada.dobrasCutaneas.panturrilha}mm</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anamnese completa */}
                {consultaSelecionada.anamnese && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Anamnese Completa</h4>
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      {consultaSelecionada.anamnese.funcaoIntestinal && (
                        <div>
                          <span className="font-medium text-sm">Função Intestinal:</span>
                          <p className="mt-1 capitalize">{consultaSelecionada.anamnese.funcaoIntestinal}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.padraoAlimentar && (
                        <div>
                          <span className="font-medium text-sm">Padrão Alimentar:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.padraoAlimentar}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-sm">Horários Irregulares:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.horariosIrregulares ? 'Sim' : 'Não'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Compulsões:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.compulsoes ? 'Sim' : 'Não'}</p>
                        </div>
                      </div>
                      
                      {consultaSelecionada.anamnese.consumoAgua > 0 && (
                        <div>
                          <span className="font-medium text-sm">Consumo de Água:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.consumoAgua}L/dia</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.sintomasAtuais && consultaSelecionada.anamnese.sintomasAtuais.length > 0 && (
                        <div>
                          <span className="font-medium text-sm">Sintomas Atuais:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {consultaSelecionada.anamnese.sintomasAtuais.map((sintoma, index) => (
                              <Badge key={index} variant="outline">
                                {sintoma}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.outros && (
                        <div>
                          <span className="font-medium text-sm">Outros:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.outros}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.habitosAjustar && (
                        <div>
                          <span className="font-medium text-sm">Hábitos a Ajustar:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.habitosAjustar}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.manutencaoPlano && (
                        <div>
                          <span className="font-medium text-sm">Manutenção do Plano:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.manutencaoPlano}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.suplementacao && (
                        <div>
                          <span className="font-medium text-sm">Suplementação:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.suplementacao}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.alimentosPriorizados && (
                        <div>
                          <span className="font-medium text-sm">Alimentos Priorizados:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.alimentosPriorizados}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.alimentosEvitados && (
                        <div>
                          <span className="font-medium text-sm">Alimentos Evitados:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.alimentosEvitados}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.reforcoComportamental && (
                        <div>
                          <span className="font-medium text-sm">Reforço Comportamental:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.reforcoComportamental}</p>
                        </div>
                      )}
                      
                      {consultaSelecionada.anamnese.estrategiasComplementares && (
                        <div>
                          <span className="font-medium text-sm">Estratégias Complementares:</span>
                          <p className="mt-1">{consultaSelecionada.anamnese.estrategiasComplementares}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Relato do paciente */}
                {consultaSelecionada.relatoPaciente && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Relato do Paciente</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p>{consultaSelecionada.relatoPaciente}</p>
                    </div>
                  </div>
                )}

                {/* Observações do nutricionista */}
                {consultaSelecionada.observacoesNutricionista && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Observações do Nutricionista</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p>{consultaSelecionada.observacoesNutricionista}</p>
                    </div>
                  </div>
                )}

                {/* Exames */}
                {consultaSelecionada.resultadosExames && consultaSelecionada.resultadosExames.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Resultados de Exames</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {consultaSelecionada.resultadosExames.map((resultado, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{resultado.exameNome}</h5>
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
                            <div className="text-lg font-semibold">
                              {resultado.valor} {resultado.unidade}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
}
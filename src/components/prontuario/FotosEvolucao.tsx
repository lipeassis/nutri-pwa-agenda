import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Camera, Upload, Calendar, ArrowLeftRight, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FotoEvolucao {
  id: string;
  clienteId: string;
  data: string;
  frente?: string;
  lateral?: string;
  costas?: string;
  observacoes?: string;
  criadoEm: string;
}

interface FotosEvolucaoProps {
  clienteId: string;
}

const posicoes = [
  { key: 'frente' as keyof FotoEvolucao, label: 'Frente', icon: '👤' },
  { key: 'lateral' as keyof FotoEvolucao, label: 'Lateral', icon: '🔄' },
  { key: 'costas' as keyof FotoEvolucao, label: 'Costas', icon: '👥' }
];

export function FotosEvolucao({ clienteId }: FotosEvolucaoProps) {
  const { toast } = useToast();
  const [fotos, setFotos] = useLocalStorage<FotoEvolucao[]>('nutriapp-fotos-evolucao', []);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState<Partial<FotoEvolucao>>({
    clienteId,
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [comparativoOpen, setComparativoOpen] = useState(false);
  const [posicaoComparativo, setPosicaoComparativo] = useState<keyof FotoEvolucao>('frente');

  const fotosCliente = fotos
    .filter(f => f.clienteId === clienteId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const handleFileUpload = (posicao: keyof FotoEvolucao, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadData(prev => ({
        ...prev,
        [posicao]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const salvarFotos = () => {
    if (!uploadData.frente && !uploadData.lateral && !uploadData.costas) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma foto antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    const novaFoto: FotoEvolucao = {
      id: Date.now().toString(),
      clienteId,
      data: uploadData.data!,
      frente: uploadData.frente,
      lateral: uploadData.lateral,
      costas: uploadData.costas,
      observacoes: uploadData.observacoes,
      criadoEm: new Date().toISOString()
    };

    setFotos([...fotos, novaFoto]);
    setUploadData({
      clienteId,
      data: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setShowUpload(false);

    toast({
      title: "Sucesso",
      description: "Fotos de evolução salvas com sucesso!",
    });
  };

  const excluirFoto = (fotoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de fotos?')) {
      setFotos(fotos.filter(f => f.id !== fotoId));
      toast({
        title: "Sucesso",
        description: "Registro de fotos excluído com sucesso.",
      });
    }
  };

  const abrirComparativo = (posicao: keyof FotoEvolucao) => {
    setPosicaoComparativo(posicao);
    setComparativoOpen(true);
  };

  const fotosParaComparativo = fotosCliente.filter(f => f[posicaoComparativo]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Fotos de Evolução</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe a evolução visual do paciente através de fotos
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Camera className="w-4 h-4 mr-2" />
          Adicionar Fotos
        </Button>
      </div>

      {fotosCliente.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma foto registrada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione fotos para acompanhar a evolução do paciente
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Adicionar Primeira Foto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Botões de comparativo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo por Posição</CardTitle>
              <CardDescription>
                Visualize a evolução ao longo do tempo para cada posição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {posicoes.map(posicao => {
                  const fotosDisponíveis = fotosCliente.filter(f => f[posicao.key]).length;
                  return (
                    <Button
                      key={posicao.key}
                      variant="outline"
                      onClick={() => abrirComparativo(posicao.key)}
                      disabled={fotosDisponíveis < 2}
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      {posicao.label} ({fotosDisponíveis})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lista de registros */}
          {fotosCliente.map((foto) => (
            <Card key={foto.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">
                      {format(new Date(foto.data), "dd/MM/yyyy", { locale: ptBR })}
                    </CardTitle>
                    {foto.observacoes && (
                      <CardDescription>{foto.observacoes}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => excluirFoto(foto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {posicoes.map(posicao => (
                    <div key={posicao.key} className="text-center">
                      <div className="aspect-[3/4] border-2 border-dashed border-muted rounded-lg overflow-hidden mb-2">
                        {foto[posicao.key] ? (
                          <img
                            src={foto[posicao.key]}
                            alt={posicao.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <span className="text-2xl mb-2 block">{posicao.icon}</span>
                              <span className="text-sm">Sem foto</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">{posicao.label}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para adicionar fotos */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Adicionar Fotos de Evolução</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data das Fotos</label>
                <input
                  type="date"
                  value={uploadData.data}
                  onChange={(e) => setUploadData(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <input
                  type="text"
                  value={uploadData.observacoes}
                  onChange={(e) => setUploadData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Ex: Início do tratamento, após 30 dias..."
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {posicoes.map(posicao => (
                <div key={posicao.key} className="text-center">
                  <label className="text-sm font-medium block mb-2">{posicao.label}</label>
                  <div className="aspect-[3/4] border-2 border-dashed border-muted rounded-lg overflow-hidden mb-2">
                    {uploadData[posicao.key] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={uploadData[posicao.key]}
                          alt={posicao.label}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => setUploadData(prev => ({ ...prev, [posicao.key]: undefined }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-muted/50">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <span className="text-sm text-muted-foreground">Clique para adicionar</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(posicao.key, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarFotos}>
                Salvar Fotos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de comparativo */}
      <Dialog open={comparativoOpen} onOpenChange={setComparativoOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              Comparativo - {posicoes.find(p => p.key === posicaoComparativo)?.label}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {fotosParaComparativo.map((foto) => (
              <div key={foto.id} className="text-center">
                <div className="aspect-[3/4] border rounded-lg overflow-hidden mb-2">
                  <img
                    src={foto[posicaoComparativo] as string}
                    alt={`${posicaoComparativo} - ${format(new Date(foto.data), "dd/MM/yyyy", { locale: ptBR })}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(foto.data), "dd/MM/yyyy", { locale: ptBR })}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PlanejamentoPadrao, PlanejamentoAlimentar, Cliente, Alimento } from "@/types";
import { Search, ChefHat, Clock, Calculator, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CriarDePadraoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente;
}

export function CriarDePadraoModal({ open, onOpenChange, cliente }: CriarDePadraoModalProps) {
  const { toast } = useToast();
  const [planejamentosPadrao] = useLocalStorage<PlanejamentoPadrao[]>('nutriapp-planejamentos-padrao', []);
  const [planejamentos, setPlanejamentos] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPadrao, setSelectedPadrao] = useState<PlanejamentoPadrao | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    dataInicio: new Date().toISOString().split('T')[0]
  });

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

  const planejamentosFiltrados = planejamentosPadrao.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && p.ativo;
  });

  const handleSelectPadrao = (padrao: PlanejamentoPadrao) => {
    setSelectedPadrao(padrao);
    setFormData({
      nome: `${padrao.nome} - ${cliente.nome}`,
      descricao: padrao.descricao,
      dataInicio: new Date().toISOString().split('T')[0]
    });
    setShowDetails(true);
  };

  const handleCreateFromPadrao = () => {
    if (!selectedPadrao) return;

    if (!formData.nome.trim() || !formData.dataInicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e a data de início.",
        variant: "destructive",
      });
      return;
    }

    const novoPlanejamento: PlanejamentoAlimentar = {
      id: Date.now().toString(),
      clienteId: cliente.id,
      nome: formData.nome,
      descricao: formData.descricao,
      refeicoes: [...selectedPadrao.refeicoes], // Copia todas as refeições
      dataInicio: formData.dataInicio,
      ativo: true,
      criadoEm: new Date().toISOString(),
      criadoPor: 'user' // Substituir pelo ID do usuário logado
    };

    setPlanejamentos([...planejamentos, novoPlanejamento]);

    toast({
      title: "Planejamento criado",
      description: `Planejamento baseado em "${selectedPadrao.nome}" criado com sucesso.`,
    });

    // Reset
    setSelectedPadrao(null);
    setShowDetails(false);
    setFormData({
      nome: "",
      descricao: "",
      dataInicio: new Date().toISOString().split('T')[0]
    });
    setSearchTerm("");
    onOpenChange(false);
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedPadrao(null);
    setFormData({
      nome: "",
      descricao: "",
      dataInicio: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            {showDetails ? 'Personalizar Planejamento' : 'Criar Planejamento a partir de Padrão'}
          </DialogTitle>
        </DialogHeader>

        {!showDetails ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="buscarPadrao">Buscar Planejamento Padrão</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="buscarPadrao"
                  placeholder="Digite o nome, categoria ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {planejamentosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum planejamento encontrado" : "Nenhum planejamento padrão disponível"}
                  </p>
                </div>
              ) : (
                planejamentosFiltrados.map((padrao) => (
                  <Card 
                    key={padrao.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectPadrao(padrao)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-base">{padrao.nome}</CardTitle>
                          <p className="text-sm text-muted-foreground">{padrao.descricao}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{padrao.categoria}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calculator className="w-3 h-3" />
                              {padrao.kcalTotal} kcal
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {padrao.refeicoes.length} refeições
                            </div>
                          </div>
                          {padrao.tags && padrao.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {padrao.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{selectedPadrao?.nome}</h3>
                <p className="text-sm text-muted-foreground">Para: {cliente.nome}</p>
              </div>
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Planejamento *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Plano Emagrecimento - João"
                  />
                </div>
                <div>
                  <Label htmlFor="dataInicio">Data de Início *</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva os objetivos e características deste planejamento..."
                />
              </div>
            </div>

            {selectedPadrao && (
              <div className="space-y-4">
                <h4 className="text-base font-medium">Prévia do Planejamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedPadrao.kcalTotal}</div>
                    <div className="text-sm text-muted-foreground">Kcal Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedPadrao.refeicoes.length}</div>
                    <div className="text-sm text-muted-foreground">Refeições</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{selectedPadrao.categoria}</div>
                    <div className="text-sm text-muted-foreground">Categoria</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedPadrao.refeicoes.map((refeicao) => {
                    const totais = calcularTotaisRefeicao(refeicao);
                    return (
                      <div key={refeicao.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{refeicao.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {refeicao.horario} - {totais.kcal.toFixed(0)} kcal
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {refeicao.alimentos.length} alimentos
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFromPadrao}>
                Criar Planejamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PlanejamentoPadrao, Alimento, Refeicao, AlimentoRefeicao } from "@/types";
import { Plus, Edit, Trash2, ChefHat, Clock, Apple, Search, Tag, Copy, Eye, Calculator, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PlanejamentosPadrao() {
  const { toast } = useToast();
  const [planejamentosPadrao, setPlanejamentosPadrao] = useLocalStorage<PlanejamentoPadrao[]>('nutriapp-planejamentos-padrao', []);
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<PlanejamentoPadrao | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [visualizandoPlano, setVisualizandoPlano] = useState<PlanejamentoPadrao | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    observacoes: "",
    tags: "" as string,
    refeicoes: [] as Refeicao[]
  });

  const categorias = [
    "Emagrecimento",
    "Ganho de Massa",
    "Diabetes",
    "Hipertensão",
    "Vegetariano",
    "Vegano",
    "Low Carb",
    "Cetogênica",
    "Mediterrânea",
    "Detox",
    "Esportivo",
    "Infantil",
    "Idoso",
    "Gestante",
    "Lactante"
  ];

  const calcularTotaisPlano = (plano: PlanejamentoPadrao) => {
    return plano.refeicoes.reduce((totalPlano, refeicao) => {
      const totalRefeicao = refeicao.alimentos.reduce((totalRef, alimentoRef) => {
        const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
        if (!alimento) return totalRef;

        const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
        return {
          kcal: totalRef.kcal + (alimento.informacaoNutricional.kcal * fator),
          proteina: totalRef.proteina + (alimento.informacaoNutricional.proteina * fator),
          carboidratos: totalRef.carboidratos + (alimento.informacaoNutricional.carboidratos * fator),
          lipideos: totalRef.lipideos + (alimento.informacaoNutricional.lipideos * fator),
        };
      }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });

      return {
        kcal: totalPlano.kcal + totalRefeicao.kcal,
        proteina: totalPlano.proteina + totalRefeicao.proteina,
        carboidratos: totalPlano.carboidratos + totalRefeicao.carboidratos,
        lipideos: totalPlano.lipideos + totalRefeicao.lipideos,
      };
    }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });
  };

  const calcularTotaisRefeicao = (refeicao: Refeicao) => {
    return refeicao.alimentos.reduce((total, alimentoRef) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.categoria || formData.refeicoes.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome, categoria e adicione pelo menos uma refeição.",
        variant: "destructive",
      });
      return;
    }

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // Calcular kcal total do plano
    const totais = calcularTotaisPlano({ 
      ...formData, 
      id: '', 
      kcalTotal: 0, 
      tags,
      ativo: true, 
      criadoEm: '', 
      criadoPor: '' 
    } as PlanejamentoPadrao);

    if (editando) {
      const planejamentoAtualizado: PlanejamentoPadrao = {
        ...editando,
        ...formData,
        tags,
        kcalTotal: Math.round(totais.kcal),
      };

      setPlanejamentosPadrao(planejamentosPadrao.map(p => 
        p.id === editando.id ? planejamentoAtualizado : p
      ));

      toast({
        title: "Planejamento atualizado",
        description: "O planejamento padrão foi atualizado com sucesso.",
      });
    } else {
      const novoPlanejamento: PlanejamentoPadrao = {
        id: Date.now().toString(),
        ...formData,
        tags,
        kcalTotal: Math.round(totais.kcal),
        ativo: true,
        criadoEm: new Date().toISOString(),
        criadoPor: 'user', // Substituir pelo ID do usuário logado
      };

      setPlanejamentosPadrao([...planejamentosPadrao, novoPlanejamento]);

      toast({
        title: "Planejamento criado",
        description: "O planejamento padrão foi criado com sucesso.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      categoria: "",
      observacoes: "",
      tags: "",
      refeicoes: []
    });
    setEditando(null);
    setShowForm(false);
  };

  const handleEdit = (planejamento: PlanejamentoPadrao) => {
    setFormData({
      nome: planejamento.nome,
      descricao: planejamento.descricao,
      categoria: planejamento.categoria,
      observacoes: planejamento.observacoes || "",
      tags: planejamento.tags?.join(', ') || "",
      refeicoes: planejamento.refeicoes
    });
    setEditando(planejamento);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este planejamento padrão?')) {
      setPlanejamentosPadrao(planejamentosPadrao.filter(p => p.id !== id));
      toast({
        title: "Planejamento excluído",
        description: "O planejamento padrão foi excluído com sucesso.",
      });
    }
  };

  const duplicarPlano = (plano: PlanejamentoPadrao) => {
    const planoDuplicado: PlanejamentoPadrao = {
      ...plano,
      id: Date.now().toString(),
      nome: `${plano.nome} (Cópia)`,
      criadoEm: new Date().toISOString(),
      criadoPor: 'user',
    };

    setPlanejamentosPadrao([...planejamentosPadrao, planoDuplicado]);

    toast({
      title: "Planejamento duplicado",
      description: "O planejamento foi duplicado com sucesso.",
    });
  };

  const planejamentosFiltrados = planejamentosPadrao.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    
    return matchesSearch && matchesCategory && p.ativo;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planejamentos Padrão</h1>
          <p className="text-muted-foreground">Gerencie templates de planejamentos alimentares</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Planejamento Padrão
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, categoria ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Planejamentos */}
      {planejamentosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum planejamento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filtroCategoria !== "todas" 
                ? "Nenhum planejamento corresponde aos filtros aplicados."
                : "Crie seu primeiro planejamento padrão para começar."
              }
            </p>
            {!searchTerm && filtroCategoria === "todas" && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Planejamento
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {planejamentosFiltrados.map((plano) => {
            const totais = calcularTotaisPlano(plano);
            
            return (
              <Card key={plano.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{plano.nome}</CardTitle>
                      <CardDescription>{plano.descricao}</CardDescription>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{plano.categoria}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calculator className="w-3 h-3" />
                          {totais.kcal.toFixed(0)} kcal
                        </div>
                      </div>
                      {plano.tags && plano.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {plano.tags.map((tag, index) => (
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
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4" />
                        {plano.refeicoes.length} refeições
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Proteína: {totais.proteina.toFixed(1)}g</div>
                        <div>Carboidratos: {totais.carboidratos.toFixed(1)}g</div>
                        <div>Lipídeos: {totais.lipideos.toFixed(1)}g</div>
                        <div>Total: {totais.kcal.toFixed(0)} kcal</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisualizandoPlano(plano)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicarPlano(plano)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(plano)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(plano.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Visualização */}
      {visualizandoPlano && (
        <Dialog open={!!visualizandoPlano} onOpenChange={() => setVisualizandoPlano(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                {visualizandoPlano.nome}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoria</Label>
                  <div className="mt-1">
                    <Badge>{visualizandoPlano.categoria}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total de Calorias</Label>
                  <div className="mt-1 text-2xl font-bold">{visualizandoPlano.kcalTotal} kcal</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Refeições</Label>
                  <div className="mt-1 text-lg font-medium">{visualizandoPlano.refeicoes.length}</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="mt-1">{visualizandoPlano.descricao}</p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Refeições</Label>
                {visualizandoPlano.refeicoes.map((refeicao) => {
                  const totais = calcularTotaisRefeicao(refeicao);
                  
                  return (
                    <Card key={refeicao.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {refeicao.nome} - {refeicao.horario}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {totais.kcal.toFixed(0)} kcal
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {refeicao.alimentos.map((alimentoRef, index) => {
                            const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
                            if (!alimento) return null;
                            
                            const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
                            const kcalAlimento = alimento.informacaoNutricional.kcal * fator;
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                <span className="font-medium">{alimentoRef.alimentoNome}</span>
                                <div className="flex gap-4 text-muted-foreground">
                                  <span>{alimentoRef.quantidade} {alimentoRef.unidade}</span>
                                  <span>{kcalAlimento.toFixed(0)} kcal</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {visualizandoPlano.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-md">{visualizandoPlano.observacoes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Formulário - Implementação básica por enquanto */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Planejamento Padrão' : 'Novo Planejamento Padrão'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Plano Emagrecimento 1800 kcal"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objetivo e características deste planejamento..."
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ex: low carb, diabético, hipertenso"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre o planejamento..."
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Refeições</Label>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Refeição
                </Button>
              </div>
              
              {formData.refeicoes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma refeição adicionada</p>
                  <p className="text-sm">Clique em "Adicionar Refeição" para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.refeicoes.map((refeicao, index) => (
                    <div key={refeicao.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{refeicao.nome}</span>
                          <span className="text-muted-foreground ml-2">{refeicao.horario}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {refeicao.alimentos.length} alimentos
                          </span>
                          <Button type="button" variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editando ? 'Atualizar' : 'Criar'} Planejamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
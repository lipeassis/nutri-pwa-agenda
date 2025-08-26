import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDataSource } from "@/lib/apiMigration";
import { ProgramaService } from "@/services/programaService";
import { useToast } from "@/hooks/use-toast";
import { ProgramaNutricional } from "@/types";
import { Plus, Edit, Trash2, Star, Target, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";

export function Programas() {
  const { toast } = useToast();
  const { data: programas, setData: setProgramas } = useDataSource<ProgramaNutricional[]>('nutriapp-programas', []);
  const [showModal, setShowModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState<ProgramaNutricional | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao: 0,
    preco: 0,
    objetivos: '',
    fasesDoProjeto: '',
    beneficios: '',
    restricoes: '',
    ativo: true
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      duracao: 0,
      preco: 0,
      objetivos: '',
      fasesDoProjeto: '',
      beneficios: '',
      restricoes: '',
      ativo: true
    });
    setEditingPrograma(null);
  };

  const openModal = (programa?: ProgramaNutricional) => {
    if (programa) {
      setFormData({
        nome: programa.nome,
        descricao: programa.descricao,
        duracao: programa.duracao,
        preco: programa.preco,
        objetivos: programa.objetivos.join('\n'),
        fasesDoProjeto: programa.fasesDoProjeto.join('\n'),
        beneficios: programa.beneficios.join('\n'),
        restricoes: programa.restricoes || '',
        ativo: programa.ativo
      });
      setEditingPrograma(programa);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const programa: ProgramaNutricional = {
      id: editingPrograma?.id || Date.now().toString(),
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      duracao: formData.duracao,
      preco: formData.preco,
      objetivos: formData.objetivos.split('\n').filter(obj => obj.trim() !== ''),
      fasesDoProjeto: formData.fasesDoProjeto.split('\n').filter(fase => fase.trim() !== ''),
      beneficios: formData.beneficios.split('\n').filter(ben => ben.trim() !== ''),
      restricoes: formData.restricoes.trim() || undefined,
      ativo: formData.ativo,
      criadoEm: editingPrograma?.criadoEm || new Date().toISOString()
    };

    if (editingPrograma) {
      setProgramas(programas.map(p => p.id === editingPrograma.id ? programa : p));
      toast({
        title: "Programa atualizado",
        description: "O programa nutricional foi atualizado com sucesso.",
      });
    } else {
      setProgramas([...programas, programa]);
      toast({
        title: "Programa criado",
        description: "O programa nutricional foi criado com sucesso.",
      });
    }

    closeModal();
  };

  const toggleStatus = (programa: ProgramaNutricional) => {
    const updatedPrograma = { ...programa, ativo: !programa.ativo };
    setProgramas(programas.map(p => p.id === programa.id ? updatedPrograma : p));
    
    toast({
      title: updatedPrograma.ativo ? "Programa ativado" : "Programa desativado",
      description: `O programa "${programa.nome}" foi ${updatedPrograma.ativo ? 'ativado' : 'desativado'}.`,
    });
  };

  const deletePrograma = (programa: ProgramaNutricional) => {
    if (window.confirm(`Tem certeza que deseja excluir o programa "${programa.nome}"?`)) {
      setProgramas(programas.filter(p => p.id !== programa.id));
      toast({
        title: "Programa excluído",
        description: "O programa nutricional foi excluído com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Star className="w-8 h-8 mr-3 text-primary" />
            Programas Nutricionais
          </h1>
          <p className="text-muted-foreground">Gerencie os programas nutricionais oferecidos pela clínica</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Programa
        </Button>
      </div>

      {/* Lista de Programas */}
      {programas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum programa cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro programa nutricional para começar
            </p>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Programa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programas.map((programa) => (
            <Card key={programa.id} className="h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {programa.nome}
                      {programa.ativo ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {programa.descricao}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informações principais */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{programa.duracao} semanas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>R$ {programa.preco.toFixed(2)}</span>
                  </div>
                </div>

                {/* Objetivos */}
                {programa.objetivos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Objetivos
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {programa.objetivos.slice(0, 3).map((objetivo, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {objetivo}
                        </li>
                      ))}
                      {programa.objetivos.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{programa.objetivos.length - 3} objetivos
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Fases do Projeto */}
                {programa.fasesDoProjeto.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Fases do Projeto</h4>
                    <div className="text-sm text-muted-foreground">
                      {programa.fasesDoProjeto.length} fase(s) definida(s)
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Switch
                    checked={programa.ativo}
                    onCheckedChange={() => toggleStatus(programa)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(programa)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePrograma(programa)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrograma ? "Editar Programa" : "Novo Programa Nutricional"}
            </DialogTitle>
            <DialogDescription>
              {editingPrograma 
                ? "Edite as informações do programa nutricional" 
                : "Preencha as informações para criar um novo programa nutricional"
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Informações básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Programa *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Programa de Emagrecimento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (semanas) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  min="1"
                  value={formData.duracao || ''}
                  onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) || 0 })}
                  placeholder="12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco || ''}
                  onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                  placeholder="500.00"
                  required
                />
              </div>
              <div className="space-y-2 flex items-center gap-2 pt-6">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Programa ativo</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o programa nutricional..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivos">Objetivos (um por linha)</Label>
              <Textarea
                id="objetivos"
                value={formData.objetivos}
                onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                placeholder="Perda de peso saudável&#10;Melhoria dos hábitos alimentares&#10;Aumento da energia"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fasesDoProjeto">Fases do Projeto (uma por linha)</Label>
              <Textarea
                id="fasesDoProjeto"
                value={formData.fasesDoProjeto}
                onChange={(e) => setFormData({ ...formData, fasesDoProjeto: e.target.value })}
                placeholder="Avaliação inicial e anamnese&#10;Elaboração do plano alimentar&#10;Acompanhamento semanal&#10;Reavaliação e ajustes"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficios">Benefícios (um por linha)</Label>
              <Textarea
                id="beneficios"
                value={formData.beneficios}
                onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                placeholder="Resultados duradouros&#10;Suporte profissional especializado&#10;Plano alimentar personalizado"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restricoes">Restrições/Observações</Label>
              <Textarea
                id="restricoes"
                value={formData.restricoes}
                onChange={(e) => setFormData({ ...formData, restricoes: e.target.value })}
                placeholder="Contraindicações, restrições de idade, etc."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit">
                {editingPrograma ? "Atualizar" : "Criar"} Programa
              </Button>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
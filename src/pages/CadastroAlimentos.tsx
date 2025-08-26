import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alimento, InformacaoNutricional } from '@/types';
import { useDataSource } from '@/lib/apiMigration';
import { AlimentoService } from '@/services/alimentoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Apple } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'alimentos_cadastrados';

const categorias = [
  'Cereais e Grãos',
  'Carnes e Peixes',
  'Laticínios',
  'Frutas',
  'Vegetais e Legumes',
  'Leguminosas',
  'Oleaginosas',
  'Óleos e Gorduras',
  'Bebidas',
  'Doces e Sobremesas',
  'Outros'
];

const unidadesMedida = [
  'g', 'ml', 'unidade', 'colher de sopa', 'colher de chá', 'xícara', 'copo', 'fatia', 'porção'
];

export default function CadastroAlimentos() {
  const { hasPermission } = useAuth();
  const { data: alimentos, setData: setAlimentos } = useDataSource<Alimento[]>(STORAGE_KEY, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlimento, setEditingAlimento] = useState<Alimento | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    unidadeMedida: 'g',
    porcaoReferencia: 100,
    informacaoNutricional: {
      kcal: 0,
      proteina: 0,
      carboidratos: 0,
      lipideos: 0,
      fibras: 0,
      gordurasSaturadas: 0,
      gordurasTrans: 0,
      sodio: 0,
      vitaminaA: 0,
      vitaminaB1: 0,
      vitaminaB2: 0,
      vitaminaB6: 0,
      vitaminaB12: 0,
      vitaminaC: 0,
      vitaminaD: 0,
      vitaminaE: 0,
      vitaminaK: 0,
      acido_folico: 0,
      niacina: 0,
      calcio: 0,
      ferro: 0,
      magnesio: 0,
      fosforo: 0,
      potassio: 0,
      zinco: 0,
      selenio: 0,
    } as InformacaoNutricional
  });

  if (!hasPermission('administrador')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.categoria) {
      toast.error('Nome e categoria são obrigatórios');
      return;
    }

    const alimento: Alimento = {
      id: editingAlimento?.id || Date.now().toString(),
      nome: formData.nome,
      categoria: formData.categoria,
      unidadeMedida: formData.unidadeMedida,
      porcaoReferencia: formData.porcaoReferencia,
      informacaoNutricional: formData.informacaoNutricional,
      ativo: true,
      criadoEm: editingAlimento?.criadoEm || new Date().toISOString()
    };

    if (editingAlimento) {
      setAlimentos(alimentos.map(a => a.id === editingAlimento.id ? alimento : a));
      toast.success('Alimento atualizado com sucesso');
    } else {
      setAlimentos([...alimentos, alimento]);
      toast.success('Alimento cadastrado com sucesso');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      categoria: '',
      unidadeMedida: 'g',
      porcaoReferencia: 100,
      informacaoNutricional: {
        kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0, fibras: 0,
        gordurasSaturadas: 0, gordurasTrans: 0, sodio: 0,
        vitaminaA: 0, vitaminaB1: 0, vitaminaB2: 0, vitaminaB6: 0, vitaminaB12: 0,
        vitaminaC: 0, vitaminaD: 0, vitaminaE: 0, vitaminaK: 0, acido_folico: 0, niacina: 0,
        calcio: 0, ferro: 0, magnesio: 0, fosforo: 0, potassio: 0, zinco: 0, selenio: 0,
      }
    });
    setEditingAlimento(null);
  };

  const editarAlimento = (alimento: Alimento) => {
    setEditingAlimento(alimento);
    setFormData({
      nome: alimento.nome,
      categoria: alimento.categoria,
      unidadeMedida: alimento.unidadeMedida,
      porcaoReferencia: alimento.porcaoReferencia,
      informacaoNutricional: alimento.informacaoNutricional
    });
    setIsDialogOpen(true);
  };

  const excluirAlimento = (id: string) => {
    setAlimentos(alimentos.filter(a => a.id !== id));
    toast.success('Alimento excluído com sucesso');
  };

  const updateNutricional = (campo: keyof InformacaoNutricional, valor: string) => {
    setFormData(prev => ({
      ...prev,
      informacaoNutricional: {
        ...prev.informacaoNutricional,
        [campo]: parseFloat(valor) || 0
      }
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastro de Alimentos</h1>
          <p className="text-muted-foreground">Gerencie o banco de dados de alimentos e informações nutricionais</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Alimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAlimento ? 'Editar' : 'Novo'} Alimento</DialogTitle>
              <DialogDescription>
                Configure as informações nutricionais do alimento
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Alimento</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Arroz branco cozido"
                    required
                  />
                </div>
                
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
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

                <div>
                  <Label>Unidade de Medida</Label>
                  <Select value={formData.unidadeMedida} onValueChange={(value) => setFormData({ ...formData, unidadeMedida: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesMedida.map((unidade) => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="porcao">Porção de Referência</Label>
                  <Input
                    id="porcao"
                    type="number"
                    value={formData.porcaoReferencia}
                    onChange={(e) => setFormData({ ...formData, porcaoReferencia: parseInt(e.target.value) || 100 })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Valores nutricionais serão calculados para esta porção
                  </p>
                </div>
              </div>

              <Tabs defaultValue="macros" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="macros">Macronutrientes</TabsTrigger>
                  <TabsTrigger value="vitaminas">Vitaminas</TabsTrigger>
                  <TabsTrigger value="minerais">Minerais</TabsTrigger>
                </TabsList>

                <TabsContent value="macros" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Calorias (kcal)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.kcal}
                        onChange={(e) => updateNutricional('kcal', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Proteína (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.proteina}
                        onChange={(e) => updateNutricional('proteina', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Carboidratos (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.carboidratos}
                        onChange={(e) => updateNutricional('carboidratos', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Lipídeos (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.lipideos}
                        onChange={(e) => updateNutricional('lipideos', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Fibras (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.fibras}
                        onChange={(e) => updateNutricional('fibras', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gorduras Saturadas (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.gordurasSaturadas}
                        onChange={(e) => updateNutricional('gordurasSaturadas', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gorduras Trans (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.gordurasTrans}
                        onChange={(e) => updateNutricional('gordurasTrans', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Sódio (mg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={formData.informacaoNutricional.sodio}
                        onChange={(e) => updateNutricional('sodio', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vitaminas" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'vitaminaA', label: 'Vitamina A (μg)' },
                      { key: 'vitaminaB1', label: 'Vitamina B1 (mg)' },
                      { key: 'vitaminaB2', label: 'Vitamina B2 (mg)' },
                      { key: 'vitaminaB6', label: 'Vitamina B6 (mg)' },
                      { key: 'vitaminaB12', label: 'Vitamina B12 (μg)' },
                      { key: 'vitaminaC', label: 'Vitamina C (mg)' },
                      { key: 'vitaminaD', label: 'Vitamina D (μg)' },
                      { key: 'vitaminaE', label: 'Vitamina E (mg)' },
                      { key: 'vitaminaK', label: 'Vitamina K (μg)' },
                      { key: 'acido_folico', label: 'Ácido Fólico (μg)' },
                      { key: 'niacina', label: 'Niacina (mg)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.informacaoNutricional[key as keyof InformacaoNutricional]}
                          onChange={(e) => updateNutricional(key as keyof InformacaoNutricional, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="minerais" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'calcio', label: 'Cálcio (mg)' },
                      { key: 'ferro', label: 'Ferro (mg)' },
                      { key: 'magnesio', label: 'Magnésio (mg)' },
                      { key: 'fosforo', label: 'Fósforo (mg)' },
                      { key: 'potassio', label: 'Potássio (mg)' },
                      { key: 'zinco', label: 'Zinco (mg)' },
                      { key: 'selenio', label: 'Selênio (μg)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.informacaoNutricional[key as keyof InformacaoNutricional]}
                          onChange={(e) => updateNutricional(key as keyof InformacaoNutricional, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAlimento ? 'Atualizar' : 'Cadastrar'} Alimento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            Alimentos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alimentos.length === 0 ? (
            <div className="text-center py-8">
              <Apple className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum alimento cadastrado</h3>
              <p className="text-muted-foreground">Comece adicionando seu primeiro alimento</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Porção</TableHead>
                  <TableHead>Calorias</TableHead>
                  <TableHead>Proteína</TableHead>
                  <TableHead>Carboidratos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alimentos.map((alimento) => (
                  <TableRow key={alimento.id}>
                    <TableCell className="font-medium">{alimento.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{alimento.categoria}</Badge>
                    </TableCell>
                    <TableCell>{alimento.porcaoReferencia}{alimento.unidadeMedida}</TableCell>
                    <TableCell>{alimento.informacaoNutricional.kcal} kcal</TableCell>
                    <TableCell>{alimento.informacaoNutricional.proteina}g</TableCell>
                    <TableCell>{alimento.informacaoNutricional.carboidratos}g</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarAlimento(alimento)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirAlimento(alimento.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
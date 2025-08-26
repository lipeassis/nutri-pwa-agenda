import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/lib/apiMigration";
import { FormulaMagistral, ComponenteFormula } from "@/types";

export function FormulasMagistrais() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados usando localStorage
  const { data: formulas, setData: setFormulas } = useDataSource<FormulaMagistral[]>('formulas-magistrais', []);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [formulaEditando, setFormulaEditando] = useState<FormulaMagistral | null>(null);
  const [visualizandoFormula, setVisualizandoFormula] = useState<FormulaMagistral | null>(null);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [componentes, setComponentes] = useState<ComponenteFormula[]>([]);
  const [posologia, setPosologia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // Estados para novo componente
  const [novoComponente, setNovoComponente] = useState({
    nome: '',
    dosagem: '',
    unidade: 'mg'
  });

  const unidades = ['mg', 'g', 'mcg', 'ml', 'UI', 'gotas', '%'];

  const resetFormulario = () => {
    setNome('');
    setComponentes([]);
    setPosologia('');
    setObservacoes('');
    setNovoComponente({ nome: '', dosagem: '', unidade: 'mg' });
    setFormulaEditando(null);
  };

  const adicionarComponente = () => {
    if (novoComponente.nome && novoComponente.dosagem) {
      const componente: ComponenteFormula = {
        id: Date.now().toString(),
        nome: novoComponente.nome,
        dosagem: novoComponente.dosagem,
        unidade: novoComponente.unidade
      };
      setComponentes([...componentes, componente]);
      setNovoComponente({ nome: '', dosagem: '', unidade: 'mg' });
    }
  };

  const removerComponente = (id: string) => {
    setComponentes(componentes.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || componentes.length === 0 || !posologia) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const formula: FormulaMagistral = {
      id: formulaEditando?.id || Date.now().toString(),
      nome,
      componentes,
      posologia,
      observacoes,
      ativo: true,
      criadoEm: formulaEditando?.criadoEm || new Date().toISOString(),
      criadoPor: user?.id || ''
    };

    if (formulaEditando) {
      setFormulas(formulas.map(f => f.id === formula.id ? formula : f));
      toast({
        title: "Sucesso",
        description: "Fórmula magistral atualizada com sucesso!",
      });
    } else {
      setFormulas([...formulas, formula]);
      toast({
        title: "Sucesso",
        description: "Fórmula magistral cadastrada com sucesso!",
      });
    }

    resetFormulario();
    setDialogAberto(false);
  };

  const editarFormula = (formula: FormulaMagistral) => {
    setNome(formula.nome);
    setComponentes(formula.componentes);
    setPosologia(formula.posologia);
    setObservacoes(formula.observacoes || '');
    setFormulaEditando(formula);
    setDialogAberto(true);
  };

  const excluirFormula = (id: string) => {
    setFormulas(formulas.filter(f => f.id !== id));
    toast({
      title: "Sucesso",
      description: "Fórmula magistral excluída com sucesso!",
    });
  };

  const abrirDialog = () => {
    resetFormulario();
    setDialogAberto(true);
  };

  // Verificação de permissão
  if (user?.role !== 'administrador' && user?.role !== 'profissional') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-destructive">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fórmulas Magistrais</h1>
          <p className="text-muted-foreground">
            Gerencie fórmulas magistrais personalizadas para seus pacientes
          </p>
        </div>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Fórmula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {formulaEditando ? 'Editar Fórmula Magistral' : 'Nova Fórmula Magistral'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações da fórmula magistral
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Fórmula *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Fórmula para Emagrecimento"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Componentes</CardTitle>
                  <CardDescription>
                    Adicione os componentes e suas respectivas dosagens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <Label htmlFor="nomeComponente">Nome do Componente</Label>
                      <Input
                        id="nomeComponente"
                        value={novoComponente.nome}
                        onChange={(e) => setNovoComponente({...novoComponente, nome: e.target.value})}
                        placeholder="Ex: Sibutramina"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="dosagem">Dosagem</Label>
                      <Input
                        id="dosagem"
                        value={novoComponente.dosagem}
                        onChange={(e) => setNovoComponente({...novoComponente, dosagem: e.target.value})}
                        placeholder="Ex: 10"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="unidade">Unidade</Label>
                      <Select value={novoComponente.unidade} onValueChange={(value) => setNovoComponente({...novoComponente, unidade: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map(unidade => (
                            <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button type="button" onClick={adicionarComponente} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {componentes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Componentes Adicionados:</Label>
                      <div className="space-y-2">
                        {componentes.map((componente) => (
                          <div key={componente.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{componente.nome}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {componente.dosagem} {componente.unidade}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerComponente(componente.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Posologia e Observações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="posologia">Posologia *</Label>
                    <Textarea
                      id="posologia"
                      value={posologia}
                      onChange={(e) => setPosologia(e.target.value)}
                      placeholder="Ex: Tomar 1 cápsula pela manhã, em jejum"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Observações adicionais sobre a fórmula"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {formulaEditando ? 'Atualizar Fórmula' : 'Cadastrar Fórmula'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para visualizar fórmula */}
      <Dialog open={!!visualizandoFormula} onOpenChange={() => setVisualizandoFormula(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fórmula</DialogTitle>
          </DialogHeader>
          {visualizandoFormula && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Nome:</Label>
                <p>{visualizandoFormula.nome}</p>
              </div>
              <div>
                <Label className="font-semibold">Componentes:</Label>
                <div className="space-y-2 mt-2">
                  {visualizandoFormula.componentes.map((componente) => (
                    <div key={componente.id} className="flex items-center space-x-2">
                      <Badge variant="outline">{componente.nome}</Badge>
                      <span className="text-sm">
                        {componente.dosagem} {componente.unidade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Posologia:</Label>
                <p className="whitespace-pre-wrap">{visualizandoFormula.posologia}</p>
              </div>
              {visualizandoFormula.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <p className="whitespace-pre-wrap">{visualizandoFormula.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabela de fórmulas */}
      <Card>
        <CardHeader>
          <CardTitle>Fórmulas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {formulas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma fórmula magistral cadastrada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Componentes</TableHead>
                  <TableHead>Posologia</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formulas.map((formula) => (
                  <TableRow key={formula.id}>
                    <TableCell className="font-medium">{formula.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {formula.componentes.map((comp) => (
                          <Badge key={comp.id} variant="secondary" className="text-xs">
                            {comp.nome}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formula.posologia}
                    </TableCell>
                    <TableCell>
                      {new Date(formula.criadoEm).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVisualizandoFormula(formula)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarFormula(formula)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirFormula(formula.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
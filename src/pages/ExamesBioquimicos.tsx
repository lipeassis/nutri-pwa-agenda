import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExameBioquimico, ValorReferencia } from '@/types';
import { useDataSource } from "@/lib/apiMigration";
import { ExameBioquimicoService } from "@/services/exameBioquimicoService";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit, TestTube } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'exames_bioquimicos';

export default function ExamesBioquimicos() {
  const { hasPermission } = useAuth();
  const { data: exames, setData: setExames } = useDataSource<ExameBioquimico[]>(STORAGE_KEY, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExame, setEditingExame] = useState<ExameBioquimico | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valoresReferencia: [] as ValorReferencia[]
  });
  const [novoValor, setNovoValor] = useState({
    minimo: '',
    maximo: '',
    genero: 'ambos' as const,
    idadeMinima: '',
    idadeMaxima: '',
    unidade: ''
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
    
    if (!formData.nome.trim()) {
      toast.error('Nome do exame é obrigatório');
      return;
    }

    if (formData.valoresReferencia.length === 0) {
      toast.error('É necessário adicionar pelo menos um valor de referência');
      return;
    }

    const exame: ExameBioquimico = {
      id: editingExame?.id || Date.now().toString(),
      nome: formData.nome,
      descricao: formData.descricao,
      valoresReferencia: formData.valoresReferencia,
      ativo: true,
      criadoEm: editingExame?.criadoEm || new Date().toISOString()
    };

    if (editingExame) {
      setExames(exames.map(e => e.id === editingExame.id ? exame : e));
      toast.success('Exame atualizado com sucesso');
    } else {
      setExames([...exames, exame]);
      toast.success('Exame cadastrado com sucesso');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '', valoresReferencia: [] });
    setNovoValor({ minimo: '', maximo: '', genero: 'ambos', idadeMinima: '', idadeMaxima: '', unidade: '' });
    setEditingExame(null);
  };

  const adicionarValorReferencia = () => {
    if (!novoValor.minimo || !novoValor.maximo || !novoValor.idadeMinima || !novoValor.idadeMaxima || !novoValor.unidade) {
      toast.error('Todos os campos do valor de referência são obrigatórios');
      return;
    }

    const valor: ValorReferencia = {
      id: Date.now().toString(),
      minimo: parseFloat(novoValor.minimo),
      maximo: parseFloat(novoValor.maximo),
      genero: novoValor.genero,
      idadeMinima: parseInt(novoValor.idadeMinima),
      idadeMaxima: parseInt(novoValor.idadeMaxima),
      unidade: novoValor.unidade
    };

    setFormData({
      ...formData,
      valoresReferencia: [...formData.valoresReferencia, valor]
    });

    setNovoValor({ minimo: '', maximo: '', genero: 'ambos', idadeMinima: '', idadeMaxima: '', unidade: '' });
    toast.success('Valor de referência adicionado');
  };

  const removerValorReferencia = (id: string) => {
    setFormData({
      ...formData,
      valoresReferencia: formData.valoresReferencia.filter(v => v.id !== id)
    });
  };

  const editarExame = (exame: ExameBioquimico) => {
    setEditingExame(exame);
    setFormData({
      nome: exame.nome,
      descricao: exame.descricao,
      valoresReferencia: exame.valoresReferencia
    });
    setIsDialogOpen(true);
  };

  const excluirExame = (id: string) => {
    setExames(exames.filter(e => e.id !== id));
    toast.success('Exame excluído com sucesso');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Exames Bioquímicos</h1>
          <p className="text-muted-foreground">Gerencie os exames bioquímicos e seus valores de referência</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Exame
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExame ? 'Editar' : 'Novo'} Exame Bioquímico</DialogTitle>
              <DialogDescription>
                Configure o exame e seus valores de referência
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Exame</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Colesterol Total"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do exame..."
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valores de Referência</CardTitle>
                  <CardDescription>
                    Adicione os valores de referência para diferentes gêneros e idades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <Label>Valor Mínimo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novoValor.minimo}
                        onChange={(e) => setNovoValor({ ...novoValor, minimo: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Valor Máximo</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={novoValor.maximo}
                        onChange={(e) => setNovoValor({ ...novoValor, maximo: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Gênero</Label>
                      <Select value={novoValor.genero} onValueChange={(value: any) => setNovoValor({ ...novoValor, genero: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ambos">Ambos</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Idade Mín.</Label>
                      <Input
                        type="number"
                        value={novoValor.idadeMinima}
                        onChange={(e) => setNovoValor({ ...novoValor, idadeMinima: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label>Idade Máx.</Label>
                      <Input
                        type="number"
                        value={novoValor.idadeMaxima}
                        onChange={(e) => setNovoValor({ ...novoValor, idadeMaxima: e.target.value })}
                        placeholder="120"
                      />
                    </div>
                    
                    <div>
                      <Label>Unidade</Label>
                      <Input
                        value={novoValor.unidade}
                        onChange={(e) => setNovoValor({ ...novoValor, unidade: e.target.value })}
                        placeholder="mg/dL"
                      />
                    </div>
                  </div>
                  
                  <Button type="button" onClick={adicionarValorReferencia} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Valor de Referência
                  </Button>

                  {formData.valoresReferencia.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Valores Configurados:</h4>
                      {formData.valoresReferencia.map((valor) => (
                        <div key={valor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{valor.genero}</Badge>
                            <span className="text-sm">
                              {valor.minimo} - {valor.maximo} {valor.unidade}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Idade: {valor.idadeMinima}-{valor.idadeMaxima} anos
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerValorReferencia(valor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingExame ? 'Atualizar' : 'Cadastrar'} Exame
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Exames Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exames.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum exame cadastrado</h3>
              <p className="text-muted-foreground">Comece adicionando seu primeiro exame bioquímico</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valores de Referência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exames.map((exame) => (
                  <TableRow key={exame.id}>
                    <TableCell className="font-medium">{exame.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">{exame.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {exame.valoresReferencia.length} valor(es)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={exame.ativo ? "default" : "secondary"}>
                        {exame.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarExame(exame)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirExame(exame.id)}
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
import { useState } from "react";
import { TipoProfissional } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDataSource } from "@/lib/apiMigration";
import { TipoProfissionalService } from "@/services/tipoProfissionalService";
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const TIPOS_KEY = 'tipos_profissionais';

export function TiposProfissionais() {
  const { data: tipos, setData: setTipos } = useDataSource<TipoProfissional[]>(TIPOS_KEY, [
    {
      id: '1',
      nome: 'Nutricionista',
      descricao: 'Profissional especializado em nutrição e alimentação',
      ativo: true,
      criadoEm: new Date().toISOString()
    },
    {
      id: '2',
      nome: 'Psicólogo',
      descricao: 'Profissional especializado em saúde mental',
      ativo: true,
      criadoEm: new Date().toISOString()
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoProfissional | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const { toast } = useToast();

  const saveTipos = (newTipos: TipoProfissional[]) => {
    localStorage.setItem(TIPOS_KEY, JSON.stringify(newTipos));
    setTipos(newTipos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTipo) {
      // Editar tipo
      const updatedTipos = tipos.map(tipo => 
        tipo.id === editingTipo.id 
          ? { ...tipo, ...formData }
          : tipo
      );
      saveTipos(updatedTipos);
      toast({
        title: "Tipo atualizado",
        description: "O tipo de profissional foi atualizado com sucesso.",
      });
    } else {
      // Criar novo tipo
      const nomeExists = tipos.some(tipo => tipo.nome.toLowerCase() === formData.nome.toLowerCase());
      if (nomeExists) {
        toast({
          title: "Erro",
          description: "Já existe um tipo de profissional com este nome.",
          variant: "destructive",
        });
        return;
      }

      const newTipo: TipoProfissional = {
        id: Date.now().toString(),
        ...formData,
        ativo: true,
        criadoEm: new Date().toISOString()
      };
      
      const updatedTipos = [...tipos, newTipo];
      saveTipos(updatedTipos);
      toast({
        title: "Tipo criado",
        description: "Novo tipo de profissional adicionado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '' });
  };

  const handleEdit = (tipo: TipoProfissional) => {
    setEditingTipo(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (tipoId: string) => {
    const updatedTipos = tipos.filter(tipo => tipo.id !== tipoId);
    saveTipos(updatedTipos);
    toast({
      title: "Tipo removido",
      description: "O tipo de profissional foi removido do sistema.",
    });
  };

  const openNewTipoDialog = () => {
    setEditingTipo(null);
    setFormData({ nome: '', descricao: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tipos de Profissionais</h1>
            <p className="text-muted-foreground">Gerencie os tipos de profissionais do sistema</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTipoDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTipo ? 'Editar Tipo de Profissional' : 'Novo Tipo de Profissional'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Nutricionista, Psicólogo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição sobre este tipo de profissional"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTipo ? 'Atualizar' : 'Criar'} Tipo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nome}</TableCell>
                  <TableCell>{tipo.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={tipo.ativo ? "default" : "secondary"}>
                      {tipo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tipo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o tipo "{tipo.nome}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tipo.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
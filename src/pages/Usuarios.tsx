import { useState } from "react";
import { Usuario, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const USERS_KEY = 'system_users';

const roleLabels: Record<UserRole, string> = {
  'secretaria': 'Secretária',
  'profissional': 'Profissional',
  'administrador': 'Administrador'
};

const roleColors: Record<UserRole, string> = {
  'secretaria': 'secondary',
  'profissional': 'default',
  'administrador': 'destructive'
};

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'secretaria' as UserRole
  });
  const { toast } = useToast();

  const saveUsers = (newUsers: Usuario[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    setUsuarios(newUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar usuário
      const updatedUsers = usuarios.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      );
      saveUsers(updatedUsers);
      toast({
        title: "Usuário atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    } else {
      // Criar novo usuário
      const emailExists = usuarios.some(user => user.email === formData.email);
      if (emailExists) {
        toast({
          title: "Erro",
          description: "Já existe um usuário com este email.",
          variant: "destructive",
        });
        return;
      }

      const newUser: Usuario = {
        id: Date.now().toString(),
        ...formData,
        ativo: true,
        criadoEm: new Date().toISOString()
      };
      
      const updatedUsers = [...usuarios, newUser];
      saveUsers(updatedUsers);
      toast({
        title: "Usuário criado",
        description: "Novo usuário adicionado com sucesso.",
      });
    }

    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ nome: '', email: '', senha: '', role: 'secretaria' });
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: user.senha,
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    const updatedUsers = usuarios.filter(user => user.id !== userId);
    saveUsers(updatedUsers);
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido do sistema.",
    });
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    setFormData({ nome: '', email: '', senha: '', role: 'secretaria' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Usuários do Sistema</h1>
            <p className="text-muted-foreground">Gerencie os usuários e suas permissões</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewUserDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secretaria">Secretária</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
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
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleColors[usuario.role] as any}>
                      {roleLabels[usuario.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.ativo ? "default" : "secondary"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {usuario.email !== 'admin@admin.com' && (
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
                                Tem certeza que deseja excluir o usuário {usuario.nome}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(usuario.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
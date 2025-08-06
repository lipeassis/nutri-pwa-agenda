import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Usuario, TipoProfissional, DisponibilidadePorLocal } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfiguracaoAgenda } from "@/components/usuarios/ConfiguracaoAgenda";
import { useToast } from "@/hooks/use-toast";
import { User, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const USERS_KEY = 'system_users';
const TIPOS_KEY = 'tipos_profissionais';

export function EditarPerfil() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  });
  
  const [tiposProfissionais] = useState<TipoProfissional[]>(() => {
    return JSON.parse(localStorage.getItem(TIPOS_KEY) || '[]');
  });

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    tipoProfissionalId: user?.tipoProfissionalId || '',
    disponibilidade: user?.disponibilidade as DisponibilidadePorLocal | undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        tipoProfissionalId: user.tipoProfissionalId || '',
        disponibilidade: user.disponibilidade
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Verificar se o email já existe (exceto para o próprio usuário)
      const emailExists = usuarios.some(u => u.email === formData.email && u.id !== user.id);
      if (emailExists) {
        toast({
          title: "Erro",
          description: "Já existe um usuário com este email.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Atualizar usuário no localStorage
      const updatedUsers = usuarios.map(u => 
        u.id === user.id 
          ? { 
              ...u, 
              nome: formData.nome,
              email: formData.email,
              tipoProfissionalId: user.role === 'profissional' ? formData.tipoProfissionalId : undefined,
              disponibilidade: user.role === 'profissional' ? formData.disponibilidade : undefined
            }
          : u
      );
      
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setUsuarios(updatedUsers);

      // Atualizar o contexto de autenticação
      const updatedUser = updatedUsers.find(u => u.id === user.id);
      if (updatedUser) {
        updateUser(updatedUser);
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Usuário não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tipoProfissional = tiposProfissionais.find(tipo => tipo.id === user.tipoProfissionalId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Editar Perfil
          </h1>
          <p className="text-muted-foreground">
            Atualize suas informações pessoais
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <Input
                  value={user.role === 'secretaria' ? 'Secretária' : 
                        user.role === 'profissional' ? 'Profissional' : 
                        'Administrador'}
                  disabled
                  className="bg-muted"
                />
              </div>

              {user.role === 'profissional' && (
                <div className="space-y-2">
                  <Label htmlFor="tipoProfissionalId">Tipo de Profissional</Label>
                  <Select 
                    value={formData.tipoProfissionalId} 
                    onValueChange={(value) => setFormData({ ...formData, tipoProfissionalId: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposProfissionais.filter(tipo => tipo.ativo).map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {user.role === 'profissional' && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Configuração de Agenda</h3>
                  <ConfiguracaoAgenda
                    disponibilidade={formData.disponibilidade}
                    onDisponibilidadeChange={(disponibilidade) => 
                      setFormData({ ...formData, disponibilidade })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                asChild
                disabled={isSubmitting}
              >
                <Link to="/">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
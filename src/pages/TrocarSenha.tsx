import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Usuario } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const USERS_KEY = 'system_users';

export function TrocarSenha() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmarSenha: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("A senha deve ter pelo menos 8 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }
    
    return errors;
  };

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
      // Verificar senha atual
      if (formData.senhaAtual !== user.senha) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validar nova senha
      const passwordErrors = validatePassword(formData.novaSenha);
      if (passwordErrors.length > 0) {
        toast({
          title: "Senha inválida",
          description: passwordErrors.join(". "),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Confirmar senha
      if (formData.novaSenha !== formData.confirmarSenha) {
        toast({
          title: "Erro",
          description: "A confirmação de senha não confere.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Verificar se a nova senha é diferente da atual
      if (formData.novaSenha === formData.senhaAtual) {
        toast({
          title: "Erro",
          description: "A nova senha deve ser diferente da senha atual.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Atualizar senha no localStorage
      const usuarios: Usuario[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const updatedUsers = usuarios.map(u => 
        u.id === user.id 
          ? { ...u, senha: formData.novaSenha }
          : u
      );
      
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      // Atualizar o contexto de autenticação
      const updatedUser = updatedUsers.find(u => u.id === user.id);
      if (updatedUser) {
        updateUser(updatedUser);
      }

      // Limpar formulário
      setFormData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      });

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar a senha.",
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Trocar Senha
          </h1>
          <p className="text-muted-foreground">
            Atualize sua senha de acesso
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={showPasswords.senhaAtual ? "text" : "password"}
                    value={formData.senhaAtual}
                    onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('senhaAtual')}
                    disabled={isSubmitting}
                  >
                    {showPasswords.senhaAtual ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={showPasswords.novaSenha ? "text" : "password"}
                    value={formData.novaSenha}
                    onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('novaSenha')}
                    disabled={isSubmitting}
                  >
                    {showPasswords.novaSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pelo menos 8 caracteres</li>
                    <li>Uma letra maiúscula</li>
                    <li>Uma letra minúscula</li>
                    <li>Um número</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showPasswords.confirmarSenha ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirmarSenha')}
                    disabled={isSubmitting}
                  >
                    {showPasswords.confirmarSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2 flex-1"
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Alterando...' : 'Alterar Senha'}
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
    </div>
  );
}
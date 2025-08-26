import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDataSource } from "@/lib/apiMigration";
import { LocalAtendimentoService } from "@/services/localAtendimentoService";
import { LocalAtendimento } from "@/types";
import { Plus, Edit, Trash2, MapPin, Phone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LocaisAtendimento() {
  const { toast } = useToast();
  const { data: locais, setData: setLocais } = useDataSource<LocalAtendimento[]>('nutriapp-locais', []);
  const [localEditando, setLocalEditando] = useState<LocalAtendimento | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    observacoes: "",
    ativo: true
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      endereco: "",
      telefone: "",
      observacoes: "",
      ativo: true
    });
    setLocalEditando(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.endereco.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e endereço são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (localEditando) {
      // Editar local existente
      const localAtualizado: LocalAtendimento = {
        ...localEditando,
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        observacoes: formData.observacoes.trim(),
        ativo: formData.ativo
      };

      setLocais(prev => prev.map(local => 
        local.id === localEditando.id ? localAtualizado : local
      ));

      toast({
        title: "Local atualizado!",
        description: `Local "${formData.nome}" foi atualizado com sucesso.`
      });
    } else {
      // Criar novo local
      const novoLocal: LocalAtendimento = {
        id: crypto.randomUUID(),
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        observacoes: formData.observacoes.trim(),
        ativo: formData.ativo,
        criadoEm: new Date().toISOString()
      };

      setLocais(prev => [...prev, novoLocal]);

      toast({
        title: "Local criado!",
        description: `Local "${formData.nome}" foi criado com sucesso.`
      });
    }

    resetForm();
    setShowDialog(false);
  };

  const handleEdit = (local: LocalAtendimento) => {
    setLocalEditando(local);
    setFormData({
      nome: local.nome,
      endereco: local.endereco,
      telefone: local.telefone || "",
      observacoes: local.observacoes || "",
      ativo: local.ativo
    });
    setShowDialog(true);
  };

  const handleDelete = (local: LocalAtendimento) => {
    if (window.confirm(`Tem certeza que deseja excluir o local "${local.nome}"?`)) {
      setLocais(prev => prev.filter(l => l.id !== local.id));
      
      toast({
        title: "Local excluído!",
        description: `Local "${local.nome}" foi excluído com sucesso.`
      });
    }
  };

  const handleToggleAtivo = (local: LocalAtendimento) => {
    const localAtualizado = { ...local, ativo: !local.ativo };
    setLocais(prev => prev.map(l => l.id === local.id ? localAtualizado : l));
    
    toast({
      title: local.ativo ? "Local desativado!" : "Local ativado!",
      description: `Local "${local.nome}" foi ${local.ativo ? 'desativado' : 'ativado'} com sucesso.`
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Locais de Atendimento</h1>
          <p className="text-muted-foreground">
            Gerencie os locais onde são realizados os atendimentos
          </p>
        </div>

        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Local
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {localEditando ? "Editar Local" : "Novo Local de Atendimento"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Clínica Centro, Consultório Shopping..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Textarea
                  id="endereco"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  placeholder="Endereço completo do local"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais, instruções de acesso..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Local ativo</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {localEditando ? "Atualizar" : "Criar"} Local
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{locais.length}</p>
                <p className="text-sm text-muted-foreground">Total de Locais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{locais.filter(l => l.ativo).length}</p>
                <p className="text-sm text-muted-foreground">Locais Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{locais.filter(l => l.telefone).length}</p>
                <p className="text-sm text-muted-foreground">Com Telefone</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Locais */}
      <Card>
        <CardHeader>
          <CardTitle>Locais Cadastrados</CardTitle>
          <CardDescription>
            {locais.length === 0 
              ? "Nenhum local cadastrado ainda" 
              : `${locais.length} local(is) cadastrado(s)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locais.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum local de atendimento cadastrado ainda.</p>
              <p className="text-sm">Crie o primeiro local para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {locais.map((local) => (
                <div key={local.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{local.nome}</h3>
                      <Badge variant={local.ativo ? "default" : "secondary"}>
                        {local.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{local.endereco}</span>
                    </div>
                    
                    {local.telefone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{local.telefone}</span>
                      </div>
                    )}
                    
                    {local.observacoes && (
                      <p className="text-sm text-muted-foreground">{local.observacoes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAtivo(local)}
                    >
                      {local.ativo ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(local)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(local)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
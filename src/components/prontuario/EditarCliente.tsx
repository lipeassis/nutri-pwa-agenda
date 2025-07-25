import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente } from "@/types";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditarClienteProps {
  cliente: Cliente;
  open: boolean;
  onClose: () => void;
}

export function EditarCliente({ cliente, open, onClose }: EditarClienteProps) {
  const { toast } = useToast();
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    dataNascimento: cliente.dataNascimento,
    objetivos: cliente.objetivos,
    observacoes: cliente.observacoes || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.nome || !formData.email || !formData.telefone) {
        toast({
          title: "Campos obrigatórios",
          description: "Nome, email e telefone são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      const clienteAtualizado: Cliente = {
        ...cliente,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        dataNascimento: formData.dataNascimento,
        objetivos: formData.objetivos,
        observacoes: formData.observacoes
      };

      setClientes(prev => prev.map(c => 
        c.id === cliente.id ? clienteAtualizado : c
      ));

      toast({
        title: "Cliente atualizado!",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar os dados do cliente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Dados do Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações básicas do cliente
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="cliente@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Objetivos e Observações */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Objetivos e Observações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="objetivos">Objetivos</Label>
              <Textarea
                id="objetivos"
                name="objetivos"
                value={formData.objetivos}
                onChange={handleInputChange}
                placeholder="Descreva os objetivos do cliente"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, PlanejamentoAlimentar } from "@/types";
import { Search, User, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopiarPlanoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteOrigem: Cliente;
  planejamentosCliente: PlanejamentoAlimentar[];
  planejamentoSelecionado: PlanejamentoAlimentar | null;
}

export function CopiarPlanoModal({ 
  open, 
  onOpenChange, 
  clienteOrigem, 
  planejamentosCliente,
  planejamentoSelecionado 
}: CopiarPlanoModalProps) {
  const { toast } = useToast();
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [planejamentos, setPlanejamentos] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [copying, setCopying] = useState(false);

  // Filtrar clientes (excluir o próprio cliente)
  const clientesFiltrados = clientes
    .filter(c => c.id !== clienteOrigem.id)
    .filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCopiarPlano = async () => {
    if (!clienteSelecionado || !planejamentoSelecionado) return;

    setCopying(true);
    
    try {
      // Criar novo planejamento com os dados copiados
      const novoPlano: PlanejamentoAlimentar = {
        ...planejamentoSelecionado,
        id: Date.now().toString(),
        clienteId: clienteSelecionado.id,
        nome: `${planejamentoSelecionado.nome} (Copiado de ${clienteOrigem.nome})`,
        criadoEm: new Date().toISOString(),
        criadoPor: 'user', // Substituir pelo ID do usuário logado
      };

      // Adicionar à lista de planejamentos
      setPlanejamentos([...planejamentos, novoPlano]);

      toast({
        title: "Plano copiado com sucesso!",
        description: `O planejamento "${planejamentoSelecionado.nome}" foi copiado para ${clienteSelecionado.nome}.`,
      });

      // Reset e fechar modal
      setClienteSelecionado(null);
      setSearchTerm("");
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Erro ao copiar plano",
        description: "Ocorreu um erro ao copiar o planejamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copiar Planejamento Alimentar
          </DialogTitle>
          <DialogDescription>
            Selecione o plano alimentar e o cliente de destino para copiar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mostrar Plano Selecionado */}
          {planejamentoSelecionado && (
            <div>
              <Label className="text-base font-medium">Plano a ser copiado:</Label>
              <div className="mt-2 p-3 border rounded-lg bg-primary/10 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{planejamentoSelecionado.nome}</h4>
                    <p className="text-sm text-muted-foreground">{planejamentoSelecionado.descricao}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Início: {new Date(planejamentoSelecionado.dataInicio).toLocaleDateString('pt-BR')}</div>
                    {planejamentoSelecionado.dataFim && (
                      <div>Fim: {new Date(planejamentoSelecionado.dataFim).toLocaleDateString('pt-BR')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Busca de Clientes */}
          <div>
            <Label className="text-base font-medium">Cliente de destino:</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Clientes */}
          <div>
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-2">
                {clientesFiltrados.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                  </div>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        clienteSelecionado?.id === cliente.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setClienteSelecionado(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{cliente.nome}</h4>
                          <p className="text-sm text-muted-foreground">{cliente.email}</p>
                        </div>
                        {clienteSelecionado?.id === cliente.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setClienteSelecionado(null);
                setSearchTerm("");
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCopiarPlano}
              disabled={!clienteSelecionado || !planejamentoSelecionado || copying}
            >
              {copying ? 'Copiando...' : 'Copiar Plano'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DocumentoPadrao } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface NovoDocumentoPadraoProps {
  onClose: () => void;
}

export function NovoDocumentoPadrao({ onClose }: NovoDocumentoPadraoProps) {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useLocalStorage<DocumentoPadrao[]>('nutriapp-documentos-padrao', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    conteudoHtml: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const novoDocumento: DocumentoPadrao = {
        id: Date.now().toString(),
        nome: formData.nome,
        conteudoHtml: formData.conteudoHtml,
        ativo: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        criadoPor: 'usuario-atual', // Seria o ID do usuário logado
      };

      setDocumentos(prev => [...prev, novoDocumento]);

      toast({
        title: "Documento criado",
        description: "O documento padrão foi criado com sucesso.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Documento Padrão</DialogTitle>
          <DialogDescription>
            Crie um novo modelo de documento com conteúdo HTML
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="nome">Nome do Documento *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Receita Nutricional, Termo de Consentimento..."
              required
            />
          </div>

          <div>
            <Label htmlFor="conteudoHtml">Conteúdo HTML *</Label>
            <Textarea
              id="conteudoHtml"
              value={formData.conteudoHtml}
              onChange={(e) => handleInputChange('conteudoHtml', e.target.value)}
              placeholder="Digite o conteúdo HTML do documento..."
              className="min-h-[300px] font-mono text-sm"
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              Use HTML para formatar o documento. Exemplos: &lt;h1&gt;Título&lt;/h1&gt;, &lt;p&gt;Parágrafo&lt;/p&gt;, &lt;strong&gt;Negrito&lt;/strong&gt;, &lt;em&gt;Itálico&lt;/em&gt;
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">Prévia do Documento</Label>
            <div 
              className="prose max-w-none bg-background border rounded p-4 min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: formData.conteudoHtml || '<p class="text-muted-foreground">A prévia aparecerá aqui conforme você digita o HTML...</p>' }}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
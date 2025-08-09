import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DocumentoPadrao, DocumentoCliente, Cliente } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface CriarDocumentoTemplateProps {
  cliente: Cliente;
  onClose: () => void;
  onSave: (documento: DocumentoCliente) => void;
}

export function CriarDocumentoTemplate({ cliente, onClose, onSave }: CriarDocumentoTemplateProps) {
  const { toast } = useToast();
  const [documentosPadrao] = useLocalStorage<DocumentoPadrao[]>('nutriapp-documentos-padrao', []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    templateId: '',
    nomeDocumento: '',
    conteudoPersonalizado: '',
    tipo: 'outros' as DocumentoCliente['tipo'],
    descricao: '',
  });

  const documentosAtivos = documentosPadrao.filter(doc => doc.ativo);
  const templateSelecionado = documentosPadrao.find(doc => doc.id === formData.templateId);

  const tiposDocumento = [
    { value: 'exame', label: 'Exame Médico' },
    { value: 'receita', label: 'Receita Médica' },
    { value: 'relatorio', label: 'Relatório' },
    { value: 'atestado', label: 'Atestado' },
    { value: 'termo', label: 'Termo de Consentimento' },
    { value: 'foto', label: 'Foto/Imagem' },
    { value: 'outros', label: 'Outros' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = documentosPadrao.find(doc => doc.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        nomeDocumento: `${template.nome} - ${cliente.nome}`,
        conteudoPersonalizado: processarTemplate(template.conteudoHtml),
      }));
      setStep(2);
    }
  };

  const processarTemplate = (conteudoHtml: string) => {
    // Substitui marcadores com dados do cliente
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString('pt-BR');
    
    return conteudoHtml
      .replace(/\{NOME_CLIENTE\}/g, cliente.nome)
      .replace(/\{EMAIL_CLIENTE\}/g, cliente.email)
      .replace(/\{TELEFONE_CLIENTE\}/g, cliente.telefone)
      .replace(/\{DATA_NASCIMENTO\}/g, cliente.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado')
      .replace(/\{DATA_ATUAL\}/g, dataAtual)
      .replace(/\{OBJETIVOS_CLIENTE\}/g, cliente.objetivos || 'Não informado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Converter HTML para base64 para simular um arquivo
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${formData.nomeDocumento}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${formData.nomeDocumento}</h1>
            <p>Cliente: ${cliente.nome}</p>
          </div>
          <div class="content">
            ${formData.conteudoPersonalizado}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const reader = new FileReader();
      
      reader.onload = () => {
        const documento: DocumentoCliente = {
          id: Date.now().toString(),
          clienteId: cliente.id,
          nome: formData.nomeDocumento,
          tipo: formData.tipo,
          arquivo: reader.result as string,
          tamanho: blob.size,
          mimeType: 'text/html',
          descricao: formData.descricao || `Documento criado a partir do modelo: ${templateSelecionado?.nome}`,
          criadoEm: new Date().toISOString(),
          criadoPor: 'usuario-atual'
        };

        onSave(documento);
        
        toast({
          title: "Documento criado",
          description: "O documento foi criado com sucesso a partir do modelo.",
        });

        onClose();
      };
      
      reader.readAsDataURL(blob);
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
          <DialogTitle>Criar Documento a partir de Modelo</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Selecione um modelo de documento para personalizar"
              : "Personalize o documento com as informações específicas do cliente"
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          // Seleção de template
          <div className="space-y-4">
            {documentosAtivos.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum modelo disponível</h3>
                <p className="text-muted-foreground">
                  É necessário criar modelos de documentos padrão antes de usar esta funcionalidade.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                <Label>Selecione um modelo de documento:</Label>
                {documentosAtivos.map((documento) => (
                  <div 
                    key={documento.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleTemplateSelect(documento.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{documento.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(documento.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Usar Modelo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Personalização do documento
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeDocumento">Nome do Documento *</Label>
                <Input
                  id="nomeDocumento"
                  value={formData.nomeDocumento}
                  onChange={(e) => handleInputChange('nomeDocumento', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Documento *</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Adicione uma breve descrição sobre o documento..."
              />
            </div>

            <div>
              <Label htmlFor="conteudoPersonalizado">Conteúdo do Documento *</Label>
              <Textarea
                id="conteudoPersonalizado"
                value={formData.conteudoPersonalizado}
                onChange={(e) => handleInputChange('conteudoPersonalizado', e.target.value)}
                placeholder="Personalize o conteúdo do documento..."
                className="min-h-[300px] font-mono text-sm"
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                O documento foi automaticamente preenchido com os dados do cliente. Você pode editar conforme necessário.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="text-sm font-medium mb-2 block">Prévia do Documento</Label>
              <div 
                className="prose max-w-none bg-background border rounded p-4 min-h-[200px]"
                dangerouslySetInnerHTML={{ 
                  __html: formData.conteudoPersonalizado || '<p class="text-muted-foreground">A prévia aparecerá aqui...</p>' 
                }}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Documento"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 1 && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentoPadrao } from "@/types";
import { Printer } from "lucide-react";

interface VisualizarDocumentoPadraoProps {
  documento: DocumentoPadrao;
  onClose: () => void;
}

export function VisualizarDocumentoPadrao({ documento, onClose }: VisualizarDocumentoPadraoProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documento.nome}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              h1, h2, h3, h4, h5, h6 { 
                color: #2c3e50; 
                margin-top: 2em;
                margin-bottom: 1em;
              }
              p { 
                margin-bottom: 1em; 
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 1em 0; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${documento.conteudoHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{documento.nome}</DialogTitle>
          <DialogDescription>
            Visualização do documento padrão
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-6 bg-background min-h-[400px]">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: documento.conteudoHtml }}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
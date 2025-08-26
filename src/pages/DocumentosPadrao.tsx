import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataSource } from "@/lib/apiMigration";
import { DocumentoPadraoService } from "@/services/documentoPadraoService";
import { DocumentoPadrao } from "@/types";
import { NovoDocumentoPadrao } from "@/components/documentos/NovoDocumentoPadrao";
import { EditarDocumentoPadrao } from "@/components/documentos/EditarDocumentoPadrao";
import { VisualizarDocumentoPadrao } from "@/components/documentos/VisualizarDocumentoPadrao";

export default function DocumentosPadrao() {
  const { data: documentos } = useDataSource<DocumentoPadrao[]>('nutriapp-documentos-padrao', []);
  const [filtro, setFiltro] = useState("");
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoPadrao | null>(null);

  const documentosFiltrados = documentos.filter(doc =>
    doc.nome.toLowerCase().includes(filtro.toLowerCase()) && doc.ativo
  );

  const handleEditarDocumento = (documento: DocumentoPadrao) => {
    setDocumentoSelecionado(documento);
    setShowEditModal(true);
  };

  const handleVisualizarDocumento = (documento: DocumentoPadrao) => {
    setDocumentoSelecionado(documento);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos Padrão</h1>
          <p className="text-muted-foreground">
            Gerencie modelos de documentos com conteúdo HTML
          </p>
        </div>
        <Button onClick={() => setShowNovoModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {documentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum documento encontrado</p>
              <p className="text-sm text-muted-foreground">
                {filtro ? "Tente ajustar os filtros" : "Clique em 'Novo Documento' para começar"}
              </p>
            </CardContent>
          </Card>
        ) : (
          documentosFiltrados.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{documento.nome}</CardTitle>
                    <CardDescription>
                      Criado em {new Date(documento.criadoEm).toLocaleDateString('pt-BR')}
                      {documento.atualizadoEm !== documento.criadoEm && (
                        <span className="ml-2">
                          • Atualizado em {new Date(documento.atualizadoEm).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={documento.ativo ? "default" : "secondary"}>
                    {documento.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisualizarDocumento(documento)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarDocumento(documento)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showNovoModal && (
        <NovoDocumentoPadrao onClose={() => setShowNovoModal(false)} />
      )}

      {showEditModal && documentoSelecionado && (
        <EditarDocumentoPadrao
          documento={documentoSelecionado}
          onClose={() => {
            setShowEditModal(false);
            setDocumentoSelecionado(null);
          }}
        />
      )}

      {showViewModal && documentoSelecionado && (
        <VisualizarDocumentoPadrao
          documento={documentoSelecionado}
          onClose={() => {
            setShowViewModal(false);
            setDocumentoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { DocumentoPadraoService, type CreateDocumentoPadraoData, type UpdateDocumentoPadraoData, type DocumentoPadraoFilters } from '@/services/documentoPadraoService';
import { useToast } from '@/hooks/use-toast';
import type { DocumentoPadrao } from '@/types';

export function useDocumentosPadrao(filters?: DocumentoPadraoFilters) {
  const [documentos, setDocumentos] = useState<DocumentoPadrao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchDocumentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await DocumentoPadraoService.getDocumentosPadrao(filters);
      setDocumentos(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar documentos');
      toast({
        title: "Erro",
        description: "Erro ao carregar documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDocumento = async (data: CreateDocumentoPadraoData) => {
    try {
      const response = await DocumentoPadraoService.createDocumentoPadrao(data);
      await fetchDocumentos();
      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar documento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateDocumento = async (id: string, data: UpdateDocumentoPadraoData) => {
    try {
      const response = await DocumentoPadraoService.updateDocumentoPadrao(id, data);
      await fetchDocumentos();
      toast({
        title: "Sucesso",
        description: "Documento atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar documento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      await DocumentoPadraoService.deleteDocumentoPadrao(id);
      await fetchDocumentos();
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir documento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await DocumentoPadraoService.toggleDocumentoPadraoStatus(id);
      await fetchDocumentos();
      toast({
        title: "Sucesso",
        description: "Status do documento atualizado"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao alterar status",
        variant: "destructive"
      });
      throw err;
    }
  };

  const duplicateDocumento = async (id: string) => {
    try {
      const response = await DocumentoPadraoService.duplicateDocumentoPadrao(id);
      await fetchDocumentos();
      toast({
        title: "Sucesso",
        description: "Documento duplicado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao duplicar documento",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [filters]);

  return {
    documentos,
    loading,
    error,
    pagination,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    toggleStatus,
    duplicateDocumento,
    refetch: fetchDocumentos
  };
}
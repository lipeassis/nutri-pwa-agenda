import { useState, useEffect } from 'react';
import { ConvenioService, type CreateConvenioData, type UpdateConvenioData, type ConvenioFilters } from '@/services/convenioService';
import { useToast } from '@/hooks/use-toast';
import type { Convenio } from '@/types';

export function useConvenios(filters?: ConvenioFilters) {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchConvenios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ConvenioService.getConvenios(filters);
      setConvenios(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar convênios');
      toast({
        title: "Erro",
        description: "Erro ao carregar convênios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createConvenio = async (data: CreateConvenioData) => {
    try {
      const response = await ConvenioService.createConvenio(data);
      await fetchConvenios();
      toast({
        title: "Sucesso",
        description: "Convênio criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar convênio",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateConvenio = async (id: string, data: UpdateConvenioData) => {
    try {
      const response = await ConvenioService.updateConvenio(id, data);
      await fetchConvenios();
      toast({
        title: "Sucesso",
        description: "Convênio atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar convênio",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteConvenio = async (id: string) => {
    try {
      await ConvenioService.deleteConvenio(id);
      await fetchConvenios();
      toast({
        title: "Sucesso",
        description: "Convênio excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir convênio",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await ConvenioService.toggleConvenioStatus(id);
      await fetchConvenios();
      toast({
        title: "Sucesso",
        description: "Status do convênio atualizado"
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

  useEffect(() => {
    fetchConvenios();
  }, [filters]);

  return {
    convenios,
    loading,
    error,
    pagination,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    toggleStatus,
    refetch: fetchConvenios
  };
}
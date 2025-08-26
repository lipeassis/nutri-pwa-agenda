import { useState, useEffect } from 'react';
import { LocalAtendimentoService, type CreateLocalAtendimentoData, type UpdateLocalAtendimentoData, type LocalAtendimentoFilters } from '@/services/localAtendimentoService';
import { useToast } from '@/hooks/use-toast';
import type { LocalAtendimento } from '@/types';

export function useLocaisAtendimento(filters?: LocalAtendimentoFilters) {
  const [locaisAtendimento, setLocaisAtendimento] = useState<LocalAtendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchLocaisAtendimento = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await LocalAtendimentoService.getLocaisAtendimento(filters);
      setLocaisAtendimento(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar locais de atendimento');
      toast({
        title: "Erro",
        description: "Erro ao carregar locais de atendimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLocalAtendimento = async (data: CreateLocalAtendimentoData) => {
    try {
      const response = await LocalAtendimentoService.createLocalAtendimento(data);
      await fetchLocaisAtendimento();
      toast({
        title: "Sucesso",
        description: "Local de atendimento criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar local de atendimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateLocalAtendimento = async (id: string, data: UpdateLocalAtendimentoData) => {
    try {
      const response = await LocalAtendimentoService.updateLocalAtendimento(id, data);
      await fetchLocaisAtendimento();
      toast({
        title: "Sucesso",
        description: "Local de atendimento atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar local de atendimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteLocalAtendimento = async (id: string) => {
    try {
      await LocalAtendimentoService.deleteLocalAtendimento(id);
      await fetchLocaisAtendimento();
      toast({
        title: "Sucesso",
        description: "Local de atendimento excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir local de atendimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await LocalAtendimentoService.toggleLocalAtendimentoStatus(id);
      await fetchLocaisAtendimento();
      toast({
        title: "Sucesso",
        description: "Status do local de atendimento atualizado"
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
    fetchLocaisAtendimento();
  }, [filters]);

  return {
    locaisAtendimento,
    loading,
    error,
    pagination,
    createLocalAtendimento,
    updateLocalAtendimento,
    deleteLocalAtendimento,
    toggleStatus,
    refetch: fetchLocaisAtendimento
  };
}
import { useState, useEffect } from 'react';
import { AlimentoService, type CreateAlimentoData, type UpdateAlimentoData, type AlimentoFilters } from '@/services/alimentoService';
import { useToast } from '@/hooks/use-toast';
import type { Alimento } from '@/types';

export function useAlimentos(filters?: AlimentoFilters) {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchAlimentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await AlimentoService.getAlimentos(filters);
      setAlimentos(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar alimentos');
      toast({
        title: "Erro",
        description: "Erro ao carregar alimentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlimento = async (data: CreateAlimentoData) => {
    try {
      const response = await AlimentoService.createAlimento(data);
      await fetchAlimentos();
      toast({
        title: "Sucesso",
        description: "Alimento criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar alimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateAlimento = async (id: string, data: UpdateAlimentoData) => {
    try {
      const response = await AlimentoService.updateAlimento(id, data);
      await fetchAlimentos();
      toast({
        title: "Sucesso",
        description: "Alimento atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar alimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteAlimento = async (id: string) => {
    try {
      await AlimentoService.deleteAlimento(id);
      await fetchAlimentos();
      toast({
        title: "Sucesso",
        description: "Alimento excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir alimento",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await AlimentoService.toggleAlimentoStatus(id);
      await fetchAlimentos();
      toast({
        title: "Sucesso",
        description: "Status do alimento atualizado"
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

  const getCategorias = async () => {
    try {
      const response = await AlimentoService.getCategorias();
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao carregar categorias",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchAlimentos();
  }, [filters]);

  return {
    alimentos,
    loading,
    error,
    pagination,
    createAlimento,
    updateAlimento,
    deleteAlimento,
    toggleStatus,
    getCategorias,
    refetch: fetchAlimentos
  };
}
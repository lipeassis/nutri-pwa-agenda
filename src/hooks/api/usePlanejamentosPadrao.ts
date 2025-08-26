import { useState, useEffect } from 'react';
import { PlanejamentoPadraoService, type CreatePlanejamentoPadraoData, type UpdatePlanejamentoPadraoData, type PlanejamentoPadraoFilters } from '@/services/planejamentoPadraoService';
import { useToast } from '@/hooks/use-toast';
import type { PlanejamentoPadrao } from '@/types';

export function usePlanejamentosPadrao(filters?: PlanejamentoPadraoFilters) {
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoPadrao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchPlanejamentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await PlanejamentoPadraoService.getPlanejamentosPadrao(filters);
      setPlanejamentos(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar planejamentos padrão');
      toast({
        title: "Erro",
        description: "Erro ao carregar planejamentos padrão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlanejamento = async (data: CreatePlanejamentoPadraoData) => {
    try {
      const response = await PlanejamentoPadraoService.createPlanejamentoPadrao(data);
      await fetchPlanejamentos();
      toast({
        title: "Sucesso",
        description: "Planejamento padrão criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar planejamento padrão",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updatePlanejamento = async (id: string, data: UpdatePlanejamentoPadraoData) => {
    try {
      const response = await PlanejamentoPadraoService.updatePlanejamentoPadrao(id, data);
      await fetchPlanejamentos();
      toast({
        title: "Sucesso",
        description: "Planejamento padrão atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar planejamento padrão",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deletePlanejamento = async (id: string) => {
    try {
      await PlanejamentoPadraoService.deletePlanejamentoPadrao(id);
      await fetchPlanejamentos();
      toast({
        title: "Sucesso",
        description: "Planejamento padrão excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir planejamento padrão",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await PlanejamentoPadraoService.togglePlanejamentoPadraoStatus(id);
      await fetchPlanejamentos();
      toast({
        title: "Sucesso",
        description: "Status do planejamento padrão atualizado"
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

  const duplicatePlanejamento = async (id: string) => {
    try {
      const response = await PlanejamentoPadraoService.duplicatePlanejamentoPadrao(id);
      await fetchPlanejamentos();
      toast({
        title: "Sucesso",
        description: "Planejamento padrão duplicado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao duplicar planejamento padrão",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getCategorias = async () => {
    try {
      const response = await PlanejamentoPadraoService.getCategorias();
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

  const getTags = async () => {
    try {
      const response = await PlanejamentoPadraoService.getTags();
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao carregar tags",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchPlanejamentos();
  }, [filters]);

  return {
    planejamentos,
    loading,
    error,
    pagination,
    createPlanejamento,
    updatePlanejamento,
    deletePlanejamento,
    toggleStatus,
    duplicatePlanejamento,
    getCategorias,
    getTags,
    refetch: fetchPlanejamentos
  };
}
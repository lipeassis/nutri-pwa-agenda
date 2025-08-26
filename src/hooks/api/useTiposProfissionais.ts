import { useState, useEffect } from 'react';
import { TipoProfissionalService, type CreateTipoProfissionalData, type UpdateTipoProfissionalData, type TipoProfissionalFilters } from '@/services/tipoProfissionalService';
import { useToast } from '@/hooks/use-toast';
import type { TipoProfissional } from '@/types';

export function useTiposProfissionais(filters?: TipoProfissionalFilters) {
  const [tiposProfissionais, setTiposProfissionais] = useState<TipoProfissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchTiposProfissionais = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await TipoProfissionalService.getTiposProfissionais(filters);
      setTiposProfissionais(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tipos de profissionais');
      toast({
        title: "Erro",
        description: "Erro ao carregar tipos de profissionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTipoProfissional = async (data: CreateTipoProfissionalData) => {
    try {
      const response = await TipoProfissionalService.createTipoProfissional(data);
      await fetchTiposProfissionais();
      toast({
        title: "Sucesso",
        description: "Tipo de profissional criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar tipo de profissional",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTipoProfissional = async (id: string, data: UpdateTipoProfissionalData) => {
    try {
      const response = await TipoProfissionalService.updateTipoProfissional(id, data);
      await fetchTiposProfissionais();
      toast({
        title: "Sucesso",
        description: "Tipo de profissional atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar tipo de profissional",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteTipoProfissional = async (id: string) => {
    try {
      await TipoProfissionalService.deleteTipoProfissional(id);
      await fetchTiposProfissionais();
      toast({
        title: "Sucesso",
        description: "Tipo de profissional excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir tipo de profissional",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await TipoProfissionalService.toggleTipoProfissionalStatus(id);
      await fetchTiposProfissionais();
      toast({
        title: "Sucesso",
        description: "Status do tipo de profissional atualizado"
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
    fetchTiposProfissionais();
  }, [filters]);

  return {
    tiposProfissionais,
    loading,
    error,
    pagination,
    createTipoProfissional,
    updateTipoProfissional,
    deleteTipoProfissional,
    toggleStatus,
    refetch: fetchTiposProfissionais
  };
}
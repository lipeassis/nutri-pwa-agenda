import { useState, useEffect } from 'react';
import { FormulaMagistralService, type CreateFormulaMagistralData, type UpdateFormulaMagistralData, type FormulaMagistralFilters } from '@/services/formulaMagistralService';
import { useToast } from '@/hooks/use-toast';
import type { FormulaMagistral } from '@/types';

export function useFormulasMagistrais(filters?: FormulaMagistralFilters) {
  const [formulas, setFormulas] = useState<FormulaMagistral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchFormulas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await FormulaMagistralService.getFormulasMagistrais(filters);
      setFormulas(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar fórmulas');
      toast({
        title: "Erro",
        description: "Erro ao carregar fórmulas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFormula = async (data: CreateFormulaMagistralData) => {
    try {
      const response = await FormulaMagistralService.createFormulaMagistral(data);
      await fetchFormulas();
      toast({
        title: "Sucesso",
        description: "Fórmula criada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar fórmula",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateFormula = async (id: string, data: UpdateFormulaMagistralData) => {
    try {
      const response = await FormulaMagistralService.updateFormulaMagistral(id, data);
      await fetchFormulas();
      toast({
        title: "Sucesso",
        description: "Fórmula atualizada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar fórmula",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteFormula = async (id: string) => {
    try {
      await FormulaMagistralService.deleteFormulaMagistral(id);
      await fetchFormulas();
      toast({
        title: "Sucesso",
        description: "Fórmula excluída com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir fórmula",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await FormulaMagistralService.toggleFormulaMagistralStatus(id);
      await fetchFormulas();
      toast({
        title: "Sucesso",
        description: "Status da fórmula atualizado"
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
    fetchFormulas();
  }, [filters]);

  return {
    formulas,
    loading,
    error,
    pagination,
    createFormula,
    updateFormula,
    deleteFormula,
    toggleStatus,
    refetch: fetchFormulas
  };
}
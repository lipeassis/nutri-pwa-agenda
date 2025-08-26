import { useState, useEffect } from 'react';
import { ExameBioquimicoService, type CreateExameBioquimicoData, type UpdateExameBioquimicoData, type ExameBioquimicoFilters } from '@/services/exameBioquimicoService';
import { useToast } from '@/hooks/use-toast';
import type { ExameBioquimico } from '@/types';

export function useExamesBioquimicos(filters?: ExameBioquimicoFilters) {
  const [exames, setExames] = useState<ExameBioquimico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchExames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ExameBioquimicoService.getExamesBioquimicos(filters);
      setExames(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar exames');
      toast({
        title: "Erro",
        description: "Erro ao carregar exames",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createExame = async (data: CreateExameBioquimicoData) => {
    try {
      const response = await ExameBioquimicoService.createExameBioquimico(data);
      await fetchExames();
      toast({
        title: "Sucesso",
        description: "Exame criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar exame",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateExame = async (id: string, data: UpdateExameBioquimicoData) => {
    try {
      const response = await ExameBioquimicoService.updateExameBioquimico(id, data);
      await fetchExames();
      toast({
        title: "Sucesso",
        description: "Exame atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar exame",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteExame = async (id: string) => {
    try {
      await ExameBioquimicoService.deleteExameBioquimico(id);
      await fetchExames();
      toast({
        title: "Sucesso",
        description: "Exame excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir exame",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await ExameBioquimicoService.toggleExameBioquimicoStatus(id);
      await fetchExames();
      toast({
        title: "Sucesso",
        description: "Status do exame atualizado"
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
    fetchExames();
  }, [filters]);

  return {
    exames,
    loading,
    error,
    pagination,
    createExame,
    updateExame,
    deleteExame,
    toggleStatus,
    refetch: fetchExames
  };
}
import { useState, useEffect } from 'react';
import { ProgramaService, type CreateProgramaData, type UpdateProgramaData, type ProgramaFilters } from '@/services/programaService';
import { useToast } from '@/hooks/use-toast';
import type { ProgramaNutricional } from '@/types';

export function useProgramas(filters?: ProgramaFilters) {
  const [programas, setProgramas] = useState<ProgramaNutricional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchProgramas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ProgramaService.getProgramas(filters);
      setProgramas(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar programas');
      toast({
        title: "Erro",
        description: "Erro ao carregar programas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrograma = async (data: CreateProgramaData) => {
    try {
      const response = await ProgramaService.createPrograma(data);
      await fetchProgramas();
      toast({
        title: "Sucesso",
        description: "Programa criado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar programa",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updatePrograma = async (id: string, data: UpdateProgramaData) => {
    try {
      const response = await ProgramaService.updatePrograma(id, data);
      await fetchProgramas();
      toast({
        title: "Sucesso",
        description: "Programa atualizado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar programa",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deletePrograma = async (id: string) => {
    try {
      await ProgramaService.deletePrograma(id);
      await fetchProgramas();
      toast({
        title: "Sucesso",
        description: "Programa excluído com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir programa",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await ProgramaService.toggleProgramaStatus(id);
      await fetchProgramas();
      toast({
        title: "Sucesso",
        description: "Status do programa atualizado"
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

  const duplicatePrograma = async (id: string) => {
    try {
      const response = await ProgramaService.duplicatePrograma(id);
      await fetchProgramas();
      toast({
        title: "Sucesso",
        description: "Programa duplicado com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao duplicar programa",
        variant: "destructive"
      });
      throw err;
    }
  };

  const getCategorias = async () => {
    try {
      const response = await ProgramaService.getCategorias();
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
    fetchProgramas();
  }, [filters]);

  return {
    programas,
    loading,
    error,
    pagination,
    createPrograma,
    updatePrograma,
    deletePrograma,
    toggleStatus,
    duplicatePrograma,
    getCategorias,
    refetch: fetchProgramas
  };
}
import { useState, useEffect } from 'react';
import { ClinicaService, type CreateClinicaData, type UpdateClinicaData, type ClinicaFilters } from '@/services/clinicaService';
import { useToast } from '@/hooks/use-toast';
import type { Clinica } from '@/types';

export function useClinicas(filters?: ClinicaFilters) {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchClinicas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ClinicaService.getClinicas(filters);
      setClinicas(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar clínicas');
      toast({
        title: "Erro",
        description: "Erro ao carregar clínicas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClinica = async (data: CreateClinicaData) => {
    try {
      const response = await ClinicaService.createClinica(data);
      await fetchClinicas();
      toast({
        title: "Sucesso",
        description: "Clínica criada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar clínica",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateClinica = async (id: string, data: UpdateClinicaData) => {
    try {
      const response = await ClinicaService.updateClinica(id, data);
      await fetchClinicas();
      toast({
        title: "Sucesso",
        description: "Clínica atualizada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar clínica",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteClinica = async (id: string) => {
    try {
      await ClinicaService.deleteClinica(id);
      await fetchClinicas();
      toast({
        title: "Sucesso",
        description: "Clínica excluída com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir clínica",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await ClinicaService.toggleClinicaStatus(id);
      await fetchClinicas();
      toast({
        title: "Sucesso",
        description: "Status da clínica atualizado"
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
    fetchClinicas();
  }, [filters]);

  return {
    clinicas,
    loading,
    error,
    pagination,
    createClinica,
    updateClinica,
    deleteClinica,
    toggleStatus,
    refetch: fetchClinicas
  };
}
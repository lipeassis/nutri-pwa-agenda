import { useState, useEffect } from 'react';
import { DoencaService, type CreateDoencaData, type UpdateDoencaData, type DoencaFilters } from '@/services/doencaService';
import { AlergiaService, type CreateAlergiaData, type UpdateAlergiaData, type AlergiaFilters } from '@/services/alergiaService';
import { useToast } from '@/hooks/use-toast';
import type { Doenca, Alergia } from '@/types';

export function useDoencas(filters?: DoencaFilters) {
  const [doencas, setDoencas] = useState<Doenca[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchDoencas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await DoencaService.getDoencas(filters);
      setDoencas(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar doenças');
      toast({
        title: "Erro",
        description: "Erro ao carregar doenças",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDoenca = async (data: CreateDoencaData) => {
    try {
      const response = await DoencaService.createDoenca(data);
      await fetchDoencas();
      toast({
        title: "Sucesso",
        description: "Doença criada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar doença",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateDoenca = async (id: string, data: UpdateDoencaData) => {
    try {
      const response = await DoencaService.updateDoenca(id, data);
      await fetchDoencas();
      toast({
        title: "Sucesso",
        description: "Doença atualizada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar doença",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteDoenca = async (id: string) => {
    try {
      await DoencaService.deleteDoenca(id);
      await fetchDoencas();
      toast({
        title: "Sucesso",
        description: "Doença excluída com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir doença",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchDoencas();
  }, [filters]);

  return {
    doencas,
    loading,
    error,
    pagination,
    createDoenca,
    updateDoenca,
    deleteDoenca,
    refetch: fetchDoencas
  };
}

export function useAlergias(filters?: AlergiaFilters) {
  const [alergias, setAlergias] = useState<Alergia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const { toast } = useToast();

  const fetchAlergias = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await AlergiaService.getAlergias(filters);
      setAlergias(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar alergias');
      toast({
        title: "Erro",
        description: "Erro ao carregar alergias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlergia = async (data: CreateAlergiaData) => {
    try {
      const response = await AlergiaService.createAlergia(data);
      await fetchAlergias();
      toast({
        title: "Sucesso",
        description: "Alergia criada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao criar alergia",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateAlergia = async (id: string, data: UpdateAlergiaData) => {
    try {
      const response = await AlergiaService.updateAlergia(id, data);
      await fetchAlergias();
      toast({
        title: "Sucesso",
        description: "Alergia atualizada com sucesso"
      });
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar alergia",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteAlergia = async (id: string) => {
    try {
      await AlergiaService.deleteAlergia(id);
      await fetchAlergias();
      toast({
        title: "Sucesso",
        description: "Alergia excluída com sucesso"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir alergia",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAlergias();
  }, [filters]);

  return {
    alergias,
    loading,
    error,
    pagination,
    createAlergia,
    updateAlergia,
    deleteAlergia,
    refetch: fetchAlergias
  };
}
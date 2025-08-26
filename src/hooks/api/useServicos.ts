import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ServicoService, ServicoFilters, CreateServicoData, UpdateServicoData } from '@/services/servicoService';
import { Servico } from '@/types';
import { ApiError } from '@/lib/api';

export function useServicos(filters?: ServicoFilters) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchServicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ServicoService.getServicos(filters);
      setServicos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao carregar serviços';
      setError(message);
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, [filters]);

  const createServico = async (data: CreateServicoData) => {
    try {
      const response = await ServicoService.createServico(data);
      await fetchServicos();
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao criar serviço';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const updateServico = async (id: string, data: UpdateServicoData) => {
    try {
      const response = await ServicoService.updateServico(id, data);
      await fetchServicos();
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao atualizar serviço';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const deleteServico = async (id: string) => {
    try {
      await ServicoService.deleteServico(id);
      await fetchServicos();
      toast({
        title: "Sucesso",
        description: "Serviço removido com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao remover serviço';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  return {
    servicos,
    loading,
    error,
    pagination,
    createServico,
    updateServico,
    deleteServico,
    refetch: fetchServicos
  };
}

export function useServicosAtivos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServicosAtivos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ServicoService.getServicosAtivos();
        setServicos(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar serviços';
        setError(message);
        toast({
          variant: "destructive",
          title: "Erro",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServicosAtivos();
  }, [toast]);

  return {
    servicos,
    loading,
    error
  };
}
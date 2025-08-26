import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  AgendamentoService, 
  AgendamentoFilters, 
  CreateAgendamentoData, 
  UpdateAgendamentoData,
  ReagendarData,
  CancelarData
} from '@/services/agendamentoService';
import { Agendamento } from '@/types';
import { ApiError } from '@/lib/api';

export function useAgendamentos(filters?: AgendamentoFilters) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AgendamentoService.getAgendamentos(filters);
      setAgendamentos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao carregar agendamentos';
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
    fetchAgendamentos();
  }, [filters]);

  const createAgendamento = async (data: CreateAgendamentoData) => {
    try {
      const response = await AgendamentoService.createAgendamento(data);
      await fetchAgendamentos();
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao criar agendamento';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const updateAgendamento = async (id: string, data: UpdateAgendamentoData) => {
    try {
      const response = await AgendamentoService.updateAgendamento(id, data);
      await fetchAgendamentos();
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao atualizar agendamento';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const reagendarAgendamento = async (id: string, data: ReagendarData) => {
    try {
      const response = await AgendamentoService.reagendarAgendamento(id, data);
      await fetchAgendamentos();
      toast({
        title: "Sucesso",
        description: "Agendamento reagendado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao reagendar agendamento';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const cancelarAgendamento = async (id: string, data: CancelarData) => {
    try {
      const response = await AgendamentoService.cancelarAgendamento(id, data);
      await fetchAgendamentos();
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao cancelar agendamento';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const marcarComoRealizado = async (id: string) => {
    try {
      const response = await AgendamentoService.marcarComoRealizado(id);
      await fetchAgendamentos();
      toast({
        title: "Sucesso",
        description: "Agendamento marcado como realizado",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao marcar como realizado';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  return {
    agendamentos,
    loading,
    error,
    pagination,
    createAgendamento,
    updateAgendamento,
    reagendarAgendamento,
    cancelarAgendamento,
    marcarComoRealizado,
    refetch: fetchAgendamentos
  };
}

export function useAgendamento(id: string) {
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgendamento = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AgendamentoService.getAgendamentoById(id);
        setAgendamento(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar agendamento';
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

    if (id) {
      fetchAgendamento();
    }
  }, [id, toast]);

  return {
    agendamento,
    loading,
    error
  };
}

export function useAgendamentosHoje() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgendamentosHoje = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AgendamentoService.getAgendamentosHoje();
        setAgendamentos(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar agendamentos de hoje';
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

    fetchAgendamentosHoje();
  }, [toast]);

  return {
    agendamentos,
    loading,
    error
  };
}
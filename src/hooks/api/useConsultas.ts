import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConsultaService, ConsultaFilters, CreateConsultaData, UpdateConsultaData } from '@/services/consultaService';
import { Consulta } from '@/types';
import { ApiError } from '@/lib/api';

export function useConsultas(filters?: ConsultaFilters) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ConsultaService.getConsultas(filters);
      setConsultas(response.data);
      setPagination(response.pagination);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao carregar consultas';
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
    fetchConsultas();
  }, [filters]);

  const createConsulta = async (data: CreateConsultaData) => {
    try {
      const response = await ConsultaService.createConsulta(data);
      await fetchConsultas();
      toast({
        title: "Sucesso",
        description: "Consulta criada com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao criar consulta';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const updateConsulta = async (id: string, data: UpdateConsultaData) => {
    try {
      const response = await ConsultaService.updateConsulta(id, data);
      await fetchConsultas();
      toast({
        title: "Sucesso",
        description: "Consulta atualizada com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao atualizar consulta';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const deleteConsulta = async (id: string) => {
    try {
      await ConsultaService.deleteConsulta(id);
      await fetchConsultas();
      toast({
        title: "Sucesso",
        description: "Consulta removida com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao remover consulta';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  return {
    consultas,
    loading,
    error,
    pagination,
    createConsulta,
    updateConsulta,
    deleteConsulta,
    refetch: fetchConsultas
  };
}

export function useConsulta(id: string) {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConsulta = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ConsultaService.getConsultaById(id);
        setConsulta(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar consulta';
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
      fetchConsulta();
    }
  }, [id, toast]);

  return {
    consulta,
    loading,
    error
  };
}

export function useConsultasCliente(clienteId: string) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConsultasCliente = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ConsultaService.getConsultasCliente(clienteId);
        setConsultas(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar consultas do cliente';
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

    if (clienteId) {
      fetchConsultasCliente();
    }
  }, [clienteId, toast]);

  return {
    consultas,
    loading,
    error
  };
}
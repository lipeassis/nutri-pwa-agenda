import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ClienteService, ClienteFilters, CreateClienteData, UpdateClienteData } from '@/services/clienteService';
import { Cliente } from '@/types';
import { ApiError } from '@/lib/api';

export function useClientes(filters?: ClienteFilters) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ClienteService.getClientes(filters);
      setClientes(response.data);
      setPagination(response.pagination);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao carregar clientes';
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
    fetchClientes();
  }, [filters]);

  const createCliente = async (data: CreateClienteData) => {
    try {
      const response = await ClienteService.createCliente(data);
      await fetchClientes(); // Refresh list
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao criar cliente';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const updateCliente = async (id: string, data: UpdateClienteData) => {
    try {
      const response = await ClienteService.updateCliente(id, data);
      await fetchClientes(); // Refresh list
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      });
      return response.data;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao atualizar cliente';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      await ClienteService.deleteCliente(id);
      await fetchClientes(); // Refresh list
      toast({
        title: "Sucesso",
        description: "Cliente removido com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao remover cliente';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  return {
    clientes,
    loading,
    error,
    pagination,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes
  };
}

export function useCliente(id: string) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ClienteService.getClienteById(id);
        setCliente(response.data);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Erro ao carregar cliente';
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
      fetchCliente();
    }
  }, [id, toast]);

  return {
    cliente,
    loading,
    error
  };
}
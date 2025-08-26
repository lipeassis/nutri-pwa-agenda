import { useState, useEffect } from 'react';
import { DashboardService, type DashboardStats, type DashboardFilters } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';

export function useDashboard(filters?: DashboardFilters) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await DashboardService.getStats(filters);
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEvolucaoReceita = async (filters?: DashboardFilters) => {
    try {
      const response = await DashboardService.getEvolucaoReceita(filters);
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao carregar evolução de receita",
        variant: "destructive"
      });
      return [];
    }
  };

  const getDistribuicaoServicos = async (filters?: DashboardFilters) => {
    try {
      const response = await DashboardService.getDistribuicaoServicos(filters);
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao carregar distribuição de serviços",
        variant: "destructive"
      });
      return [];
    }
  };

  const getAgendamentosProximos = async (limit?: number) => {
    try {
      const response = await DashboardService.getAgendamentosProximos(limit);
      return response.data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao carregar próximos agendamentos",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  return {
    stats,
    loading,
    error,
    getEvolucaoReceita,
    getDistribuicaoServicos,
    getAgendamentosProximos,
    refetch: fetchStats
  };
}
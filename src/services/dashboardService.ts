import { apiClient } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';

export interface DashboardStats {
  totalClientes: number;
  clientesNovosEsteMes: number;
  agendamentosHoje: number;
  agendamentosPendentes: number;
  consultasRealizadas: number;
  receitaTotal: number;
  receitaMes: number;
  proximasConsultas: {
    id: string;
    clienteNome: string;
    data: string;
    hora: string;
    servicoNome: string;
  }[];
  graficoEvolucao: {
    periodo: string;
    consultas: number;
    receita: number;
  }[];
  distribuicaoServicos: {
    nome: string;
    quantidade: number;
    valor: number;
  }[];
}

export interface DashboardFilters {
  dataInicio?: string;
  dataFim?: string;
  profissionalId?: string;
}

export class DashboardService {
  static async getStats(filters?: DashboardFilters): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats', filters);
  }

  static async getEvolucaoReceita(filters?: DashboardFilters): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/dashboard/evolucao-receita', filters);
  }

  static async getDistribuicaoServicos(filters?: DashboardFilters): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/dashboard/distribuicao-servicos', filters);
  }

  static async getAgendamentosProximos(limit?: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>('/dashboard/agendamentos-proximos', { limit });
  }
}
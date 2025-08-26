import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Servico } from '@/types';

export interface ServicoFilters {
  nome?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateServicoData {
  nome: string;
  descricao: string;
  tempoMinutos: number;
  valorParticular: number;
  valoresConvenios?: { [convenioId: string]: number };
}

export interface UpdateServicoData extends Partial<CreateServicoData> {
  ativo?: boolean;
}

export class ServicoService {
  static async getServicos(filters?: ServicoFilters): Promise<PaginatedResponse<Servico>> {
    return apiClient.get<PaginatedResponse<Servico>>('/servicos', filters);
  }

  static async getServicoById(id: string): Promise<ApiResponse<Servico>> {
    return apiClient.get<ApiResponse<Servico>>(`/servicos/${id}`);
  }

  static async createServico(data: CreateServicoData): Promise<ApiResponse<Servico>> {
    return apiClient.post<ApiResponse<Servico>>('/servicos', data);
  }

  static async updateServico(id: string, data: UpdateServicoData): Promise<ApiResponse<Servico>> {
    return apiClient.put<ApiResponse<Servico>>(`/servicos/${id}`, data);
  }

  static async deleteServico(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/servicos/${id}`);
  }

  static async getServicosAtivos(): Promise<ApiResponse<Servico[]>> {
    return apiClient.get<ApiResponse<Servico[]>>('/servicos/ativos');
  }
}
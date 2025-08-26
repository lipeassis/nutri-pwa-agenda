import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { LocalAtendimento } from '@/types';

export interface LocalAtendimentoFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateLocalAtendimentoData {
  nome: string;
  endereco: string;
  telefone?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateLocalAtendimentoData extends Partial<CreateLocalAtendimentoData> {}

export class LocalAtendimentoService {
  static async getLocaisAtendimento(filters?: LocalAtendimentoFilters): Promise<PaginatedResponse<LocalAtendimento>> {
    return apiClient.get<PaginatedResponse<LocalAtendimento>>('/locais-atendimento', filters);
  }

  static async getLocalAtendimentoById(id: string): Promise<ApiResponse<LocalAtendimento>> {
    return apiClient.get<ApiResponse<LocalAtendimento>>(`/locais-atendimento/${id}`);
  }

  static async createLocalAtendimento(data: CreateLocalAtendimentoData): Promise<ApiResponse<LocalAtendimento>> {
    return apiClient.post<ApiResponse<LocalAtendimento>>('/locais-atendimento', data);
  }

  static async updateLocalAtendimento(id: string, data: UpdateLocalAtendimentoData): Promise<ApiResponse<LocalAtendimento>> {
    return apiClient.put<ApiResponse<LocalAtendimento>>(`/locais-atendimento/${id}`, data);
  }

  static async deleteLocalAtendimento(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/locais-atendimento/${id}`);
  }

  static async toggleLocalAtendimentoStatus(id: string): Promise<ApiResponse<LocalAtendimento>> {
    return apiClient.patch<ApiResponse<LocalAtendimento>>(`/locais-atendimento/${id}/toggle-status`);
  }
}
import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { TipoProfissional } from '@/types';

export interface TipoProfissionalFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateTipoProfissionalData {
  nome: string;
  descricao: string;
  ativo?: boolean;
}

export interface UpdateTipoProfissionalData extends Partial<CreateTipoProfissionalData> {}

export class TipoProfissionalService {
  static async getTiposProfissionais(filters?: TipoProfissionalFilters): Promise<PaginatedResponse<TipoProfissional>> {
    return apiClient.get<PaginatedResponse<TipoProfissional>>('/tipos-profissionais', filters);
  }

  static async getTipoProfissionalById(id: string): Promise<ApiResponse<TipoProfissional>> {
    return apiClient.get<ApiResponse<TipoProfissional>>(`/tipos-profissionais/${id}`);
  }

  static async createTipoProfissional(data: CreateTipoProfissionalData): Promise<ApiResponse<TipoProfissional>> {
    return apiClient.post<ApiResponse<TipoProfissional>>('/tipos-profissionais', data);
  }

  static async updateTipoProfissional(id: string, data: UpdateTipoProfissionalData): Promise<ApiResponse<TipoProfissional>> {
    return apiClient.put<ApiResponse<TipoProfissional>>(`/tipos-profissionais/${id}`, data);
  }

  static async deleteTipoProfissional(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/tipos-profissionais/${id}`);
  }

  static async toggleTipoProfissionalStatus(id: string): Promise<ApiResponse<TipoProfissional>> {
    return apiClient.patch<ApiResponse<TipoProfissional>>(`/tipos-profissionais/${id}/toggle-status`);
  }
}
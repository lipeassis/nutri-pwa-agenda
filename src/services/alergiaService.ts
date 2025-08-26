import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { Alergia } from '@/types';

export interface AlergiaFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
  severidade?: 'leve' | 'moderada' | 'grave';
}

export interface CreateAlergiaData {
  nome: string;
  descricao: string;
  severidade: 'leve' | 'moderada' | 'grave';
  ativo?: boolean;
}

export interface UpdateAlergiaData extends Partial<CreateAlergiaData> {}

export class AlergiaService {
  static async getAlergias(filters?: AlergiaFilters): Promise<PaginatedResponse<Alergia>> {
    return apiClient.get<PaginatedResponse<Alergia>>('/alergias', filters);
  }

  static async getAlergiaById(id: string): Promise<ApiResponse<Alergia>> {
    return apiClient.get<ApiResponse<Alergia>>(`/alergias/${id}`);
  }

  static async createAlergia(data: CreateAlergiaData): Promise<ApiResponse<Alergia>> {
    return apiClient.post<ApiResponse<Alergia>>('/alergias', data);
  }

  static async updateAlergia(id: string, data: UpdateAlergiaData): Promise<ApiResponse<Alergia>> {
    return apiClient.put<ApiResponse<Alergia>>(`/alergias/${id}`, data);
  }

  static async deleteAlergia(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/alergias/${id}`);
  }

  static async toggleAlergiaStatus(id: string): Promise<ApiResponse<Alergia>> {
    return apiClient.patch<ApiResponse<Alergia>>(`/alergias/${id}/toggle-status`);
  }
}
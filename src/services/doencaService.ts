import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { Doenca } from '@/types';

export interface DoencaFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateDoencaData {
  nome: string;
  resumo: string;
  protocoloNutricional?: string;
  referencia?: string;
  linksUteis?: string[];
  ativo?: boolean;
}

export interface UpdateDoencaData extends Partial<CreateDoencaData> {}

export class DoencaService {
  static async getDoencas(filters?: DoencaFilters): Promise<PaginatedResponse<Doenca>> {
    return apiClient.get<PaginatedResponse<Doenca>>('/doencas', filters);
  }

  static async getDoencaById(id: string): Promise<ApiResponse<Doenca>> {
    return apiClient.get<ApiResponse<Doenca>>(`/doencas/${id}`);
  }

  static async createDoenca(data: CreateDoencaData): Promise<ApiResponse<Doenca>> {
    return apiClient.post<ApiResponse<Doenca>>('/doencas', data);
  }

  static async updateDoenca(id: string, data: UpdateDoencaData): Promise<ApiResponse<Doenca>> {
    return apiClient.put<ApiResponse<Doenca>>(`/doencas/${id}`, data);
  }

  static async deleteDoenca(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/doencas/${id}`);
  }

  static async toggleDoencaStatus(id: string): Promise<ApiResponse<Doenca>> {
    return apiClient.patch<ApiResponse<Doenca>>(`/doencas/${id}/toggle-status`);
  }
}
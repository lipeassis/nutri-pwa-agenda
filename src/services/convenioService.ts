import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { Convenio } from '@/types';

export interface ConvenioFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateConvenioData {
  nome: string;
  descricao?: string;
  percentualDesconto: number;
  valorConsulta: number;
  ativo?: boolean;
}

export interface UpdateConvenioData extends Partial<CreateConvenioData> {}

export class ConvenioService {
  static async getConvenios(filters?: ConvenioFilters): Promise<PaginatedResponse<Convenio>> {
    return apiClient.get<PaginatedResponse<Convenio>>('/convenios', filters);
  }

  static async getConvenioById(id: string): Promise<ApiResponse<Convenio>> {
    return apiClient.get<ApiResponse<Convenio>>(`/convenios/${id}`);
  }

  static async createConvenio(data: CreateConvenioData): Promise<ApiResponse<Convenio>> {
    return apiClient.post<ApiResponse<Convenio>>('/convenios', data);
  }

  static async updateConvenio(id: string, data: UpdateConvenioData): Promise<ApiResponse<Convenio>> {
    return apiClient.put<ApiResponse<Convenio>>(`/convenios/${id}`, data);
  }

  static async deleteConvenio(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/convenios/${id}`);
  }

  static async toggleConvenioStatus(id: string): Promise<ApiResponse<Convenio>> {
    return apiClient.patch<ApiResponse<Convenio>>(`/convenios/${id}/toggle-status`);
  }
}
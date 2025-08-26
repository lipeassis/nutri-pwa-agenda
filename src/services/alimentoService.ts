import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { Alimento } from '@/types';

export interface AlimentoFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
  ativo?: boolean;
}

export interface CreateAlimentoData {
  nome: string;
  categoria: string;
  valorEnergetico: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  sodio?: number;
  colesterol?: number;
  ferro?: number;
  calcio?: number;
  vitaminas?: { [key: string]: number };
  unidadeMedida: string;
  porcaoReferencia: number;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateAlimentoData extends Partial<CreateAlimentoData> {}

export class AlimentoService {
  static async getAlimentos(filters?: AlimentoFilters): Promise<PaginatedResponse<Alimento>> {
    return apiClient.get<PaginatedResponse<Alimento>>('/alimentos', filters);
  }

  static async getAlimentoById(id: string): Promise<ApiResponse<Alimento>> {
    return apiClient.get<ApiResponse<Alimento>>(`/alimentos/${id}`);
  }

  static async createAlimento(data: CreateAlimentoData): Promise<ApiResponse<Alimento>> {
    return apiClient.post<ApiResponse<Alimento>>('/alimentos', data);
  }

  static async updateAlimento(id: string, data: UpdateAlimentoData): Promise<ApiResponse<Alimento>> {
    return apiClient.put<ApiResponse<Alimento>>(`/alimentos/${id}`, data);
  }

  static async deleteAlimento(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/alimentos/${id}`);
  }

  static async toggleAlimentoStatus(id: string): Promise<ApiResponse<Alimento>> {
    return apiClient.patch<ApiResponse<Alimento>>(`/alimentos/${id}/toggle-status`);
  }

  static async getCategorias(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>('/alimentos/categorias');
  }
}
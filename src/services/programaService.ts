import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { ProgramaNutricional } from '@/types';

export interface ProgramaFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
  categoria?: string;
  precoMin?: number;
  precoMax?: number;
}

export interface CreateProgramaData {
  nome: string;
  descricao: string;
  duracao: number; // em semanas
  preco: number;
  objetivos: string[];
  fasesDoProjeto: string[];
  beneficios: string[];
  restricoes?: string;
  categoria: string;
  ativo?: boolean;
}

export interface UpdateProgramaData extends Partial<CreateProgramaData> {}

export class ProgramaService {
  static async getProgramas(filters?: ProgramaFilters): Promise<PaginatedResponse<ProgramaNutricional>> {
    return apiClient.get<PaginatedResponse<ProgramaNutricional>>('/programas', filters);
  }

  static async getProgramaById(id: string): Promise<ApiResponse<ProgramaNutricional>> {
    return apiClient.get<ApiResponse<ProgramaNutricional>>(`/programas/${id}`);
  }

  static async createPrograma(data: CreateProgramaData): Promise<ApiResponse<ProgramaNutricional>> {
    return apiClient.post<ApiResponse<ProgramaNutricional>>('/programas', data);
  }

  static async updatePrograma(id: string, data: UpdateProgramaData): Promise<ApiResponse<ProgramaNutricional>> {
    return apiClient.put<ApiResponse<ProgramaNutricional>>(`/programas/${id}`, data);
  }

  static async deletePrograma(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/programas/${id}`);
  }

  static async toggleProgramaStatus(id: string): Promise<ApiResponse<ProgramaNutricional>> {
    return apiClient.patch<ApiResponse<ProgramaNutricional>>(`/programas/${id}/toggle-status`);
  }

  static async duplicatePrograma(id: string): Promise<ApiResponse<ProgramaNutricional>> {
    return apiClient.post<ApiResponse<ProgramaNutricional>>(`/programas/${id}/duplicate`);
  }

  static async getCategorias(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>('/programas/categorias');
  }
}
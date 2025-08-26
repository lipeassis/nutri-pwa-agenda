import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { PlanejamentoPadrao, Refeicao } from '@/types';

export interface PlanejamentoPadraoFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
  ativo?: boolean;
  kcalMin?: number;
  kcalMax?: number;
  tags?: string[];
}

export interface CreatePlanejamentoPadraoData {
  nome: string;
  descricao: string;
  categoria: string;
  refeicoes: Omit<Refeicao, 'id'>[];
  observacoes?: string;
  tags?: string[];
  ativo?: boolean;
}

export interface UpdatePlanejamentoPadraoData extends Partial<CreatePlanejamentoPadraoData> {}

export class PlanejamentoPadraoService {
  static async getPlanejamentosPadrao(filters?: PlanejamentoPadraoFilters): Promise<PaginatedResponse<PlanejamentoPadrao>> {
    return apiClient.get<PaginatedResponse<PlanejamentoPadrao>>('/planejamentos-padrao', filters);
  }

  static async getPlanejamentoPadraoById(id: string): Promise<ApiResponse<PlanejamentoPadrao>> {
    return apiClient.get<ApiResponse<PlanejamentoPadrao>>(`/planejamentos-padrao/${id}`);
  }

  static async createPlanejamentoPadrao(data: CreatePlanejamentoPadraoData): Promise<ApiResponse<PlanejamentoPadrao>> {
    return apiClient.post<ApiResponse<PlanejamentoPadrao>>('/planejamentos-padrao', data);
  }

  static async updatePlanejamentoPadrao(id: string, data: UpdatePlanejamentoPadraoData): Promise<ApiResponse<PlanejamentoPadrao>> {
    return apiClient.put<ApiResponse<PlanejamentoPadrao>>(`/planejamentos-padrao/${id}`, data);
  }

  static async deletePlanejamentoPadrao(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/planejamentos-padrao/${id}`);
  }

  static async togglePlanejamentoPadraoStatus(id: string): Promise<ApiResponse<PlanejamentoPadrao>> {
    return apiClient.patch<ApiResponse<PlanejamentoPadrao>>(`/planejamentos-padrao/${id}/toggle-status`);
  }

  static async duplicatePlanejamentoPadrao(id: string): Promise<ApiResponse<PlanejamentoPadrao>> {
    return apiClient.post<ApiResponse<PlanejamentoPadrao>>(`/planejamentos-padrao/${id}/duplicate`);
  }

  static async getCategorias(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>('/planejamentos-padrao/categorias');
  }

  static async getTags(): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>('/planejamentos-padrao/tags');
  }
}
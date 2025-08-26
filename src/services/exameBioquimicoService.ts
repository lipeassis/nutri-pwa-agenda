import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { ExameBioquimico, ValorReferencia } from '@/types';

export interface ExameBioquimicoFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateExameBioquimicoData {
  nome: string;
  descricao?: string;
  valoresReferencia: Omit<ValorReferencia, 'id'>[];
  ativo?: boolean;
}

export interface UpdateExameBioquimicoData extends Partial<CreateExameBioquimicoData> {}

export class ExameBioquimicoService {
  static async getExamesBioquimicos(filters?: ExameBioquimicoFilters): Promise<PaginatedResponse<ExameBioquimico>> {
    return apiClient.get<PaginatedResponse<ExameBioquimico>>('/exames-bioquimicos', filters);
  }

  static async getExameBioquimicoById(id: string): Promise<ApiResponse<ExameBioquimico>> {
    return apiClient.get<ApiResponse<ExameBioquimico>>(`/exames-bioquimicos/${id}`);
  }

  static async createExameBioquimico(data: CreateExameBioquimicoData): Promise<ApiResponse<ExameBioquimico>> {
    return apiClient.post<ApiResponse<ExameBioquimico>>('/exames-bioquimicos', data);
  }

  static async updateExameBioquimico(id: string, data: UpdateExameBioquimicoData): Promise<ApiResponse<ExameBioquimico>> {
    return apiClient.put<ApiResponse<ExameBioquimico>>(`/exames-bioquimicos/${id}`, data);
  }

  static async deleteExameBioquimico(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/exames-bioquimicos/${id}`);
  }

  static async toggleExameBioquimicoStatus(id: string): Promise<ApiResponse<ExameBioquimico>> {
    return apiClient.patch<ApiResponse<ExameBioquimico>>(`/exames-bioquimicos/${id}/toggle-status`);
  }
}
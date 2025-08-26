import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { FormulaMagistral, ComponenteFormula } from '@/types';

export interface FormulaMagistralFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
  criadoPor?: string;
}

export interface CreateFormulaMagistralData {
  nome: string;
  componentes: Omit<ComponenteFormula, 'id'>[];
  posologia: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateFormulaMagistralData extends Partial<CreateFormulaMagistralData> {}

export class FormulaMagistralService {
  static async getFormulasMagistrais(filters?: FormulaMagistralFilters): Promise<PaginatedResponse<FormulaMagistral>> {
    return apiClient.get<PaginatedResponse<FormulaMagistral>>('/formulas-magistrais', filters);
  }

  static async getFormulaMagistralById(id: string): Promise<ApiResponse<FormulaMagistral>> {
    return apiClient.get<ApiResponse<FormulaMagistral>>(`/formulas-magistrais/${id}`);
  }

  static async createFormulaMagistral(data: CreateFormulaMagistralData): Promise<ApiResponse<FormulaMagistral>> {
    return apiClient.post<ApiResponse<FormulaMagistral>>('/formulas-magistrais', data);
  }

  static async updateFormulaMagistral(id: string, data: UpdateFormulaMagistralData): Promise<ApiResponse<FormulaMagistral>> {
    return apiClient.put<ApiResponse<FormulaMagistral>>(`/formulas-magistrais/${id}`, data);
  }

  static async deleteFormulaMagistral(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/formulas-magistrais/${id}`);
  }

  static async toggleFormulaMagistralStatus(id: string): Promise<ApiResponse<FormulaMagistral>> {
    return apiClient.patch<ApiResponse<FormulaMagistral>>(`/formulas-magistrais/${id}/toggle-status`);
  }
}
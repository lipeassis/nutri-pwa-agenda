import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { Clinica } from '@/types';

export interface ClinicaFilters {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export interface CreateClinicaData {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  responsavel?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateClinicaData extends Partial<CreateClinicaData> {}

export class ClinicaService {
  static async getClinicas(filters?: ClinicaFilters): Promise<PaginatedResponse<Clinica>> {
    return apiClient.get<PaginatedResponse<Clinica>>('/clinicas', filters);
  }

  static async getClinicaById(id: string): Promise<ApiResponse<Clinica>> {
    return apiClient.get<ApiResponse<Clinica>>(`/clinicas/${id}`);
  }

  static async createClinica(data: CreateClinicaData): Promise<ApiResponse<Clinica>> {
    return apiClient.post<ApiResponse<Clinica>>('/clinicas', data);
  }

  static async updateClinica(id: string, data: UpdateClinicaData): Promise<ApiResponse<Clinica>> {
    return apiClient.put<ApiResponse<Clinica>>(`/clinicas/${id}`, data);
  }

  static async deleteClinica(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/clinicas/${id}`);
  }

  static async toggleClinicaStatus(id: string): Promise<ApiResponse<Clinica>> {
    return apiClient.patch<ApiResponse<Clinica>>(`/clinicas/${id}/toggle-status`);
  }
}
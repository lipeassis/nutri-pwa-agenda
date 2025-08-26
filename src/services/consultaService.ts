import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Consulta } from '@/types';

export interface ConsultaFilters {
  clienteId?: string;
  profissionalId?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface CreateConsultaData {
  clienteId: string;
  profissionalId: string;
  agendamentoId?: string;
  data: string;
  tipo: 'presencial' | 'online';
  anamnese?: string;
  exameFisico?: string;
  diagnostico?: string;
  conduta?: string;
  observacoes?: string;
  medidas?: {
    peso?: number;
    altura?: number;
    circunferencias?: Record<string, number>;
    pregas?: Record<string, number>;
  };
  exames?: Array<{
    tipo: string;
    resultado: string;
    data: string;
    arquivo?: string;
  }>;
}

export interface UpdateConsultaData extends Partial<CreateConsultaData> {}

export class ConsultaService {
  static async getConsultas(filters?: ConsultaFilters): Promise<PaginatedResponse<Consulta>> {
    return apiClient.get<PaginatedResponse<Consulta>>('/consultas', filters);
  }

  static async getConsultaById(id: string): Promise<ApiResponse<Consulta>> {
    return apiClient.get<ApiResponse<Consulta>>(`/consultas/${id}`);
  }

  static async createConsulta(data: CreateConsultaData): Promise<ApiResponse<Consulta>> {
    return apiClient.post<ApiResponse<Consulta>>('/consultas', data);
  }

  static async updateConsulta(id: string, data: UpdateConsultaData): Promise<ApiResponse<Consulta>> {
    return apiClient.put<ApiResponse<Consulta>>(`/consultas/${id}`, data);
  }

  static async deleteConsulta(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/consultas/${id}`);
  }

  static async getConsultasCliente(clienteId: string): Promise<ApiResponse<Consulta[]>> {
    return apiClient.get<ApiResponse<Consulta[]>>(`/consultas/cliente/${clienteId}`);
  }

  static async getUltimaConsulta(clienteId: string): Promise<ApiResponse<Consulta | null>> {
    return apiClient.get<ApiResponse<Consulta | null>>(`/consultas/cliente/${clienteId}/ultima`);
  }

  static async duplicarConsulta(id: string): Promise<ApiResponse<Consulta>> {
    return apiClient.post<ApiResponse<Consulta>>(`/consultas/${id}/duplicar`);
  }
}
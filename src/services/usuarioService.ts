import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Usuario } from '@/types';

export interface UsuarioFilters {
  nome?: string;
  email?: string;
  role?: 'administrador' | 'profissional' | 'assistente';
  ativo?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateUsuarioData {
  nome: string;
  email: string;
  senha: string;
  role: 'administrador' | 'profissional' | 'assistente';
  tipoProfissionalId?: string;
  disponibilidade?: any;
}

export interface UpdateUsuarioData extends Partial<CreateUsuarioData> {
  ativo?: boolean;
}

export class UsuarioService {
  static async getUsuarios(filters?: UsuarioFilters): Promise<PaginatedResponse<Usuario>> {
    return apiClient.get<PaginatedResponse<Usuario>>('/usuarios', filters);
  }

  static async getUsuarioById(id: string): Promise<ApiResponse<Usuario>> {
    return apiClient.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
  }

  static async createUsuario(data: CreateUsuarioData): Promise<ApiResponse<Usuario>> {
    return apiClient.post<ApiResponse<Usuario>>('/usuarios', data);
  }

  static async updateUsuario(id: string, data: UpdateUsuarioData): Promise<ApiResponse<Usuario>> {
    return apiClient.put<ApiResponse<Usuario>>(`/usuarios/${id}`, data);
  }

  static async deleteUsuario(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/usuarios/${id}`);
  }

  static async getProfissionais(): Promise<ApiResponse<Usuario[]>> {
    return apiClient.get<ApiResponse<Usuario[]>>('/usuarios/profissionais');
  }

  static async updateDisponibilidade(id: string, disponibilidade: any): Promise<ApiResponse<Usuario>> {
    return apiClient.patch<ApiResponse<Usuario>>(`/usuarios/${id}/disponibilidade`, { disponibilidade });
  }
}
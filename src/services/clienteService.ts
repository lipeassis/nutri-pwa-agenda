import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Cliente } from '@/types';

export interface ClienteFilters {
  nome?: string;
  telefone?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateClienteData {
  nome: string;
  telefone: string;
  email?: string;
  dataNascimento: string;
  genero?: 'masculino' | 'feminino' | 'outro';
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  observacoes?: string;
}

export interface UpdateClienteData extends Partial<CreateClienteData> {
  ativo?: boolean;
}

export class ClienteService {
  static async getClientes(filters?: ClienteFilters): Promise<PaginatedResponse<Cliente>> {
    return apiClient.get<PaginatedResponse<Cliente>>('/clientes', filters);
  }

  static async getClienteById(id: string): Promise<ApiResponse<Cliente>> {
    return apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`);
  }

  static async createCliente(data: CreateClienteData): Promise<ApiResponse<Cliente>> {
    return apiClient.post<ApiResponse<Cliente>>('/clientes', data);
  }

  static async updateCliente(id: string, data: UpdateClienteData): Promise<ApiResponse<Cliente>> {
    return apiClient.put<ApiResponse<Cliente>>(`/clientes/${id}`, data);
  }

  static async deleteCliente(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/clientes/${id}`);
  }

  static async getClienteFamilias(clienteId: string): Promise<ApiResponse<Cliente[]>> {
    return apiClient.get<ApiResponse<Cliente[]>>(`/clientes/${clienteId}/familias`);
  }

  static async vincularFamilia(clienteId: string, familiarId: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/clientes/${clienteId}/familias`, { familiarId });
  }

  static async desvincularFamilia(clienteId: string, familiarId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/clientes/${clienteId}/familias/${familiarId}`);
  }
}
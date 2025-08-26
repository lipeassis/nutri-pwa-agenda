import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';
import { Agendamento } from '@/types';

export interface AgendamentoFilters {
  data?: string;
  status?: 'agendado' | 'realizado' | 'cancelado' | 'remarcado';
  tipo?: 'presencial' | 'online';
  clienteId?: string;
  profissionalId?: string;
  page?: number;
  limit?: number;
}

export interface CreateAgendamentoData {
  clienteId: string;
  profissionalId: string;
  servicosIds: string[];
  data: string;
  horario: string;
  tipo: 'presencial' | 'online';
  localId?: string;
  observacoes?: string;
}

export interface UpdateAgendamentoData extends Partial<CreateAgendamentoData> {
  status?: 'agendado' | 'realizado' | 'cancelado' | 'remarcado';
  motivoCancelamento?: string;
}

export interface ReagendarData {
  novaData: string;
  novoHorario: string;
  motivo?: string;
}

export interface CancelarData {
  motivo: string;
}

export class AgendamentoService {
  static async getAgendamentos(filters?: AgendamentoFilters): Promise<PaginatedResponse<Agendamento>> {
    return apiClient.get<PaginatedResponse<Agendamento>>('/agendamentos', filters);
  }

  static async getAgendamentoById(id: string): Promise<ApiResponse<Agendamento>> {
    return apiClient.get<ApiResponse<Agendamento>>(`/agendamentos/${id}`);
  }

  static async createAgendamento(data: CreateAgendamentoData): Promise<ApiResponse<Agendamento>> {
    return apiClient.post<ApiResponse<Agendamento>>('/agendamentos', data);
  }

  static async updateAgendamento(id: string, data: UpdateAgendamentoData): Promise<ApiResponse<Agendamento>> {
    return apiClient.put<ApiResponse<Agendamento>>(`/agendamentos/${id}`, data);
  }

  static async reagendarAgendamento(id: string, data: ReagendarData): Promise<ApiResponse<Agendamento>> {
    return apiClient.patch<ApiResponse<Agendamento>>(`/agendamentos/${id}/reagendar`, data);
  }

  static async cancelarAgendamento(id: string, data: CancelarData): Promise<ApiResponse<Agendamento>> {
    return apiClient.patch<ApiResponse<Agendamento>>(`/agendamentos/${id}/cancelar`, data);
  }

  static async marcarComoRealizado(id: string): Promise<ApiResponse<Agendamento>> {
    return apiClient.patch<ApiResponse<Agendamento>>(`/agendamentos/${id}/realizado`);
  }

  static async confirmarAgendamento(id: string, token: string): Promise<ApiResponse<Agendamento>> {
    return apiClient.patch<ApiResponse<Agendamento>>(`/agendamentos/${id}/confirmar`, { token });
  }

  static async getAgendamentosHoje(): Promise<ApiResponse<Agendamento[]>> {
    return apiClient.get<ApiResponse<Agendamento[]>>('/agendamentos/hoje');
  }

  static async getHorariosDisponiveis(profissionalId: string, data: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(`/agendamentos/horarios-disponiveis`, {
      profissionalId,
      data
    });
  }
}
import { apiClient } from '@/lib/api';
import type { ApiResponse, PaginatedResponse } from '@/lib/api';
import type { DocumentoPadrao } from '@/types';

export interface DocumentoPadraoFilters {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  ativo?: boolean;
  criadoPor?: string;
}

export interface CreateDocumentoPadraoData {
  titulo: string;
  tipo: 'receita' | 'laudo' | 'plano' | 'relatorio' | 'atestado' | 'outros';
  conteudo: string;
  variaveis?: string[];
  tags?: string[];
  ativo?: boolean;
}

export interface UpdateDocumentoPadraoData extends Partial<CreateDocumentoPadraoData> {}

export class DocumentoPadraoService {
  static async getDocumentosPadrao(filters?: DocumentoPadraoFilters): Promise<PaginatedResponse<DocumentoPadrao>> {
    return apiClient.get<PaginatedResponse<DocumentoPadrao>>('/documentos-padrao', filters);
  }

  static async getDocumentoPadraoById(id: string): Promise<ApiResponse<DocumentoPadrao>> {
    return apiClient.get<ApiResponse<DocumentoPadrao>>(`/documentos-padrao/${id}`);
  }

  static async createDocumentoPadrao(data: CreateDocumentoPadraoData): Promise<ApiResponse<DocumentoPadrao>> {
    return apiClient.post<ApiResponse<DocumentoPadrao>>('/documentos-padrao', data);
  }

  static async updateDocumentoPadrao(id: string, data: UpdateDocumentoPadraoData): Promise<ApiResponse<DocumentoPadrao>> {
    return apiClient.put<ApiResponse<DocumentoPadrao>>(`/documentos-padrao/${id}`, data);
  }

  static async deleteDocumentoPadrao(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/documentos-padrao/${id}`);
  }

  static async toggleDocumentoPadraoStatus(id: string): Promise<ApiResponse<DocumentoPadrao>> {
    return apiClient.patch<ApiResponse<DocumentoPadrao>>(`/documentos-padrao/${id}/toggle-status`);
  }

  static async duplicateDocumentoPadrao(id: string): Promise<ApiResponse<DocumentoPadrao>> {
    return apiClient.post<ApiResponse<DocumentoPadrao>>(`/documentos-padrao/${id}/duplicate`);
  }
}
import { create, ApisauceInstance, ApiResponse as ApisauceResponse } from 'apisauce';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private api: ApisauceInstance;

  constructor(baseURL: string) {
    this.api = create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add auth token interceptor
    this.api.addRequestTransform((request) => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    });

    // Add response transform to handle errors
    this.api.addResponseTransform((response) => {
      if (!response.ok) {
        const errorData = response.data as any;
        throw new ApiError(
          errorData?.message || 'Erro na requisição',
          response.status || 0,
          errorData?.code
        );
      }
    });
  }

  private handleResponse<T>(response: ApisauceResponse<T>): T {
    if (!response.ok) {
      const errorData = response.data as any;
      throw new ApiError(
        errorData?.message || response.problem || 'Erro na requisição',
        response.status || 0,
        errorData?.code
      );
    }

    return response.data as T;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.api.get<T>(endpoint, params);
    return this.handleResponse(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(endpoint, data);
    return this.handleResponse(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(endpoint, data);
    return this.handleResponse(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.patch<T>(endpoint, data);
    return this.handleResponse(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<T>(endpoint);
    return this.handleResponse(response);
  }

  // Método para obter a instância do apisauce (para configurações avançadas)
  getApiInstance() {
    return this.api;
  }

  // Método para adicionar interceptors customizados
  addRequestTransform(transform: (request: any) => void) {
    this.api.addRequestTransform(transform);
  }

  addResponseTransform(transform: (response: any) => void) {
    this.api.addResponseTransform(transform);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
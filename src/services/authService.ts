import { apiClient, ApiResponse } from '@/lib/api';
import { Usuario } from '@/types';

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  tipo: 'administrador' | 'profissional' | 'assistente';
  tipoProfissionalId?: string;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
  refreshToken: string;
}

export interface ChangePasswordData {
  senhaAtual: string;
  novaSenha: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdateProfileData {
  nome?: string;
  email?: string;
  tipoProfissionalId?: string;
  configuracaoAgenda?: any;
}

export class AuthService {
  static async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    if (response.success && response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
      localStorage.setItem('refresh-token', response.data.refreshToken);
    }
    
    return response;
  }

  static async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<Usuario>> {
    return apiClient.get<ApiResponse<Usuario>>('/auth/me');
  }

  static async updateProfile(data: UpdateProfileData): Promise<ApiResponse<Usuario>> {
    return apiClient.put<ApiResponse<Usuario>>('/auth/profile', data);
  }

  static async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/change-password', data);
  }

  static async requestPasswordReset(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/reset-password', data);
  }

  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken
    });

    if (response.success && response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }

    return response;
  }

  static async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}
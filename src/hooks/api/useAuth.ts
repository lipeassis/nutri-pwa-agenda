import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthService, LoginData, RegisterData, ChangePasswordData, UpdateProfileData } from '@/services/authService';
import { Usuario } from '@/types';
import { ApiError } from '@/lib/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (token) {
          const response = await AuthService.getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          await AuthService.refreshToken();
          const response = await AuthService.getCurrentUser();
          setUser(response.data);
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await AuthService.login(data);
      setUser(response.data.user);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro no login';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await AuthService.register(data);
      setUser(response.data.user);
      toast({
        title: "Sucesso",
        description: "Cadastro realizado com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro no cadastro';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso",
      });
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await AuthService.updateProfile(data);
      setUser(response.data);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao atualizar perfil';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      await AuthService.changePassword(data);
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Erro ao alterar senha';
      toast({
        variant: "destructive",
        title: "Erro",
        description: message,
      });
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user
  };
}

export { AuthContext };
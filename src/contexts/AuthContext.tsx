import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, UserRole } from '@/types';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  updateUser: (updatedUser: Usuario) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user';
const USERS_KEY = 'system_users';

// Usuário administrador padrão
const defaultAdmin: Usuario = {
  id: '1',
  nome: 'Administrador',
  email: 'admin@admin.com',
  senha: '123Mudar',
  role: 'administrador',
  ativo: true,
  criadoEm: new Date().toISOString()
};

const roleHierarchy: Record<UserRole, number> = {
  'secretaria': 1,
  'profissional': 2,
  'administrador': 3
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    // Inicializar usuários do sistema se não existirem
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    }

    // Verificar se há usuário logado
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, senha: string): boolean => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: Usuario) => 
      u.email === email && u.senha === senha && u.ativo
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (updatedUser: Usuario) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[user.role];
    
    return requiredRoles.some(role => userLevel >= roleHierarchy[role]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      hasPermission,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
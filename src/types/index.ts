export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  peso: number;
  altura: number;
  objetivos: string;
  observacoes?: string;
  criadoEm: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  hora: string;
  tipo: 'consulta' | 'retorno' | 'avaliacao';
  status: 'agendado' | 'realizado' | 'cancelado';
  observacoes?: string;
  criadoEm: string;
}

export interface MedidasAntropometricas {
  peso: number;
  altura: number;
  circunferenciaBraco: number;
  circunferenciaAbdomen: number;
  circunferenciaQuadril: number;
  circunferenciaPescoco: number;
  percentualGordura: number;
  massaMuscular: number;
}

export interface ConsultaProntuario {
  id: string;
  clienteId: string;
  data: string;
  medidas: MedidasAntropometricas;
  relatoPaciente: string;
  observacoesNutricionista: string;
  criadoEm: string;
}

export interface ObjetivosCliente {
  id: string;
  clienteId: string;
  pesoMeta: number;
  medidasMeta: Partial<MedidasAntropometricas>;
  prazoMeses: number;
  observacoes: string;
  criadoEm: string;
  ativo: boolean;
}

export type UserRole = 'secretaria' | 'profissional' | 'administrador';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
}
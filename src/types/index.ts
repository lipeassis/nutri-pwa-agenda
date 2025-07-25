export interface Doenca {
  id: string;
  nome: string;
  resumo: string;
  protocoloNutricional: string;
  referencia: string;
  linksUteis: string[];
  ativo: boolean;
  criadoEm: string;
}

export interface Alergia {
  id: string;
  nome: string;
  descricao: string;
  severidade: 'leve' | 'moderada' | 'grave';
  ativo: boolean;
  criadoEm: string;
}

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
  doencasIds: string[];
  alergiasIds: string[];
  criadoEm: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  profissionalId: string; // Novo campo
  profissionalNome: string; // Novo campo
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

export interface TipoProfissional {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  criadoEm: string;
}

export interface HorarioDisponivel {
  inicio: string; // HH:mm
  fim: string; // HH:mm
}

export interface DisponibilidadeAgenda {
  domingo: HorarioDisponivel[];
  segunda: HorarioDisponivel[];
  terca: HorarioDisponivel[];
  quarta: HorarioDisponivel[];
  quinta: HorarioDisponivel[];
  sexta: HorarioDisponivel[];
  sabado: HorarioDisponivel[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  tipoProfissionalId?: string; // Apenas para role 'profissional'
  disponibilidade?: DisponibilidadeAgenda; // Apenas para role 'profissional'
  ativo: boolean;
  criadoEm: string;
}
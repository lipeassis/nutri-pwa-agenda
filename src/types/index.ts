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
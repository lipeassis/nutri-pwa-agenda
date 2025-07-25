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

export interface Convenio {
  id: string;
  nome: string;
  descricao: string;
  percentualDesconto: number;
  valorConsulta: number;
  ativo: boolean;
  criadoEm: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  tempoMinutos: number;
  valorParticular: number;
  valoresConvenios: { [convenioId: string]: number }; // convenioId -> valor
  ativo: boolean;
  criadoEm: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
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
  profissionalId: string;
  profissionalNome: string;
  servicoId: string; // Alterado de tipo para servicoId
  servicoNome: string; // Nome do serviço
  data: string;
  hora: string;
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

export interface DobrasCutaneas {
  tricipital: number;
  bicipital: number;
  subescapular: number;
  suprailiaca: number;
  abdominal: number;
  coxa: number;
  panturrilha: number;
}

export interface ConsultaProntuario {
  id: string;
  clienteId: string;
  data: string;
  medidas: MedidasAntropometricas;
  dobrasCutaneas: DobrasCutaneas;
  resultadosExames: ResultadoExame[];
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

export interface ValorReferencia {
  id: string;
  minimo: number;
  maximo: number;
  genero: 'masculino' | 'feminino' | 'ambos';
  idadeMinima: number;
  idadeMaxima: number;
  unidade: string;
}

export interface ExameBioquimico {
  id: string;
  nome: string;
  descricao: string;
  valoresReferencia: ValorReferencia[];
  ativo: boolean;
  criadoEm: string;
}

export interface ResultadoExame {
  exameId: string;
  exameNome: string;
  valor: number;
  unidade: string;
  status: 'abaixo' | 'normal' | 'acima';
}

export interface DocumentoCliente {
  id: string;
  clienteId: string;
  nome: string;
  tipo: 'exame' | 'receita' | 'relatorio' | 'outros';
  arquivo: string; // base64 ou URL
  tamanho: number; // em bytes
  mimeType: string;
  criadoEm: string;
  criadoPor: string; // id do usuário
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
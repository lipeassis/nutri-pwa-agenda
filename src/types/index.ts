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
  convenioId?: string; // ID do convênio (opcional)
  convenioNome?: string; // Nome do convênio (opcional)
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

export interface InformacaoNutricional {
  kcal: number;
  proteina: number;
  carboidratos: number;
  lipideos: number;
  fibras: number;
  gordurasSaturadas: number;
  gordurasTrans: number;
  sodio: number;
  // Vitaminas
  vitaminaA: number;
  vitaminaB1: number;
  vitaminaB2: number;
  vitaminaB6: number;
  vitaminaB12: number;
  vitaminaC: number;
  vitaminaD: number;
  vitaminaE: number;
  vitaminaK: number;
  acido_folico: number;
  niacina: number;
  // Minerais
  calcio: number;
  ferro: number;
  magnesio: number;
  fosforo: number;
  potassio: number;
  zinco: number;
  selenio: number;
}

export interface Alimento {
  id: string;
  nome: string;
  categoria: string;
  unidadeMedida: string; // g, ml, unidade, colher, etc.
  porcaoReferencia: number; // quantidade da porção de referência (ex: 100g)
  informacaoNutricional: InformacaoNutricional; // valores por porção de referência
  ativo: boolean;
  criadoEm: string;
}

export interface AlimentoRefeicao {
  alimentoId: string;
  alimentoNome: string;
  quantidade: number;
  unidade: string;
}

export interface Refeicao {
  id: string;
  nome: string;
  horario: string;
  alimentos: AlimentoRefeicao[];
}

export interface PlanejamentoAlimentar {
  id: string;
  clienteId: string;
  nome: string;
  descricao: string;
  refeicoes: Refeicao[];
  dataInicio: string;
  dataFim?: string;
  ativo: boolean;
  criadoEm: string;
  criadoPor: string;
}

export interface RespostasDetalhadas {
  adesaoAlimentar: number[]; // 5 respostas (1-5 cada)
  fomeSaciedade: number[]; // 5 respostas (1-5 cada)
  energia: number[]; // 5 respostas (1-5 cada)
  sono: number[]; // 5 respostas (1-5 cada)
  atividadeFisica: number[]; // 5 respostas (1-5 cada)
  hidratacao: number[]; // 5 respostas (1-5 cada)
  comportamentoEmocional: number[]; // 5 respostas (1-5 cada)
  motivacaoProgresso: number[]; // 5 respostas (1-5 cada)
}

export interface TransacaoFinanceira {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: 'agendamento' | 'despesa' | 'receita_extra';
  descricao: string;
  valor: number;
  data: string;
  usuarioId?: string; // Profissional responsável
  servicoId?: string; // Serviço relacionado
  agendamentoId?: string; // Agendamento relacionado (se aplicável)
  observacoes?: string;
  criadoEm: string;
  criadoPor: string;
}

export interface RelatorioFinanceiro {
  periodo: string;
  totalConsultas: number;
  totalFaturamento: number;
  consultasRealizadas: number;
  consultasCanceladas: number;
  ticketMedio: number;
  totalEntradas: number;
  totalSaidas: number;
  lucroLiquido: number;
}

export interface AtualizacaoQuestionario {
  id: string;
  clienteId: string;
  dataResposta: string;
  adesaoAlimentar: number; // 1-5 (média das 5 respostas)
  fomeSaciedade: number; // 1-5 (média das 5 respostas)
  energia: number; // 1-5 (média das 5 respostas)
  sono: number; // 1-5 (média das 5 respostas)
  atividadeFisica: number; // 1-5 (média das 5 respostas)
  hidratacao: number; // 1-5 (média das 5 respostas)
  comportamentoEmocional: number; // 1-5 (média das 5 respostas)
  motivacaoProgresso: number; // 1-5 (média das 5 respostas)
  respostasDetalhadas?: RespostasDetalhadas;
  observacoes?: string;
  criadoEm: string;
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
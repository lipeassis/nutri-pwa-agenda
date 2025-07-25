import { AtualizacaoQuestionario, RespostasDetalhadas } from '@/types';

const generateRespostasDetalhadas = (): RespostasDetalhadas => {
  const generateRandomResponses = () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 5) + 1);
  
  return {
    adesaoAlimentar: generateRandomResponses(),
    fomeSaciedade: generateRandomResponses(),
    energia: generateRandomResponses(),
    sono: generateRandomResponses(),
    atividadeFisica: generateRandomResponses(),
    hidratacao: generateRandomResponses(),
    comportamentoEmocional: generateRandomResponses(),
    motivacaoProgresso: generateRandomResponses(),
  };
};

const calcularMedia = (respostas: number[]): number => {
  const soma = respostas.reduce((acc, val) => acc + val, 0);
  return Math.round(soma / respostas.length);
};

export const generateSampleAtualizacoes = (clienteId: string): AtualizacaoQuestionario[] => {
  const now = new Date();
  const atualizacoes: AtualizacaoQuestionario[] = [];

  // Gerar atualizações para os últimos 30 dias (uma a cada 3 dias)
  for (let i = 0; i < 10; i++) {
    const dataResposta = new Date(now);
    dataResposta.setDate(now.getDate() - (i * 3));

    const respostasDetalhadas = generateRespostasDetalhadas();

    atualizacoes.push({
      id: `atualizacao_${Date.now()}_${i}`,
      clienteId,
      dataResposta: dataResposta.toISOString(),
      adesaoAlimentar: calcularMedia(respostasDetalhadas.adesaoAlimentar),
      fomeSaciedade: calcularMedia(respostasDetalhadas.fomeSaciedade),
      energia: calcularMedia(respostasDetalhadas.energia),
      sono: calcularMedia(respostasDetalhadas.sono),
      atividadeFisica: calcularMedia(respostasDetalhadas.atividadeFisica),
      hidratacao: calcularMedia(respostasDetalhadas.hidratacao),
      comportamentoEmocional: calcularMedia(respostasDetalhadas.comportamentoEmocional),
      motivacaoProgresso: calcularMedia(respostasDetalhadas.motivacaoProgresso),
      respostasDetalhadas,
      observacoes: i % 3 === 0 ? `Observação da atualização ${i + 1}` : undefined,
      criadoEm: dataResposta.toISOString(),
    });
  }

  return atualizacoes.sort((a, b) => new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime());
};
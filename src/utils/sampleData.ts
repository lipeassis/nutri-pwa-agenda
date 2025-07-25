import { AtualizacaoQuestionario } from '@/types';

export const generateSampleAtualizacoes = (clienteId: string): AtualizacaoQuestionario[] => {
  const now = new Date();
  const atualizacoes: AtualizacaoQuestionario[] = [];

  // Gerar atualizações para os últimos 30 dias (uma a cada 3 dias)
  for (let i = 0; i < 10; i++) {
    const dataResposta = new Date(now);
    dataResposta.setDate(now.getDate() - (i * 3));

    atualizacoes.push({
      id: `atualizacao_${Date.now()}_${i}`,
      clienteId,
      dataResposta: dataResposta.toISOString(),
      adesaoAlimentar: Math.floor(Math.random() * 3) + 3, // 3-5
      fomeSaciedade: Math.floor(Math.random() * 5) + 1, // 1-5
      energia: Math.floor(Math.random() * 4) + 2, // 2-5
      sono: Math.floor(Math.random() * 3) + 3, // 3-5
      atividadeFisica: Math.floor(Math.random() * 4) + 2, // 2-5
      hidratacao: Math.floor(Math.random() * 2) + 4, // 4-5
      comportamentoEmocional: Math.floor(Math.random() * 4) + 2, // 2-5
      motivacaoProgresso: Math.floor(Math.random() * 4) + 2, // 2-5
      observacoes: i % 3 === 0 ? `Observação da atualização ${i + 1}` : undefined,
      criadoEm: dataResposta.toISOString(),
    });
  }

  return atualizacoes.sort((a, b) => new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime());
};
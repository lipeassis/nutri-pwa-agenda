import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RespostasDetalhadas } from '@/types';

interface DetalhesQuestionarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: string;
  respostasDetalhadas: RespostasDetalhadas;
}

const perguntasPorCategoria = {
  adesaoAlimentar: [
    "Segui meu plano alimentar conforme orientado",
    "Respeitei os horários das refeições",
    "Cumpri as porções recomendadas",
    "Evitei alimentos não permitidos",
    "Mantive consistência na alimentação durante a semana"
  ],
  fomeSaciedade: [
    "Senti fome nos horários apropriados",
    "Me senti saciado após as refeições",
    "Consegui identificar minha sensação de fome",
    "Parei de comer quando me senti satisfeito",
    "Minha relação com fome e saciedade está equilibrada"
  ],
  energia: [
    "Senti-me disposto durante o dia",
    "Tive energia para realizar minhas atividades",
    "Não senti sonolência excessiva",
    "Minha energia se manteve estável",
    "Me senti bem-disposto ao acordar"
  ],
  sono: [
    "Dormi a quantidade de horas adequada",
    "Tive um sono reparador",
    "Adormeci facilmente",
    "Não acordei várias vezes durante a noite",
    "Acordei descansado"
  ],
  atividadeFisica: [
    "Pratiquei exercícios conforme planejado",
    "Mantive-me ativo durante o dia",
    "Senti motivação para me exercitar",
    "Completei minha rotina de exercícios",
    "Me senti bem após as atividades físicas"
  ],
  hidratacao: [
    "Bebi a quantidade adequada de água",
    "Lembrei de me hidratar regularmente",
    "Minha urina estava clara/amarelo claro",
    "Não senti sede excessiva",
    "Mantive boa hidratação durante exercícios"
  ],
  comportamentoEmocional: [
    "Controlei a ansiedade relacionada à comida",
    "Não comi por impulso emocional",
    "Me senti equilibrado emocionalmente",
    "Lidei bem com situações estressantes",
    "Mantive uma atitude positiva sobre minha alimentação"
  ],
  motivacaoProgresso: [
    "Senti-me motivado a continuar o plano",
    "Percebi progressos positivos",
    "Mantive foco nos meus objetivos",
    "Senti-me confiante sobre minha evolução",
    "Estou satisfeito com meu progresso atual"
  ]
};

const categoriasLabels = {
  adesaoAlimentar: "Adesão Alimentar",
  fomeSaciedade: "Fome/Saciedade",
  energia: "Energia",
  sono: "Sono",
  atividadeFisica: "Atividade Física",
  hidratacao: "Hidratação",
  comportamentoEmocional: "Comportamento Emocional",
  motivacaoProgresso: "Motivação/Progresso"
};

export function DetalhesQuestionarioModal({ open, onOpenChange, data, respostasDetalhadas }: DetalhesQuestionarioModalProps) {
  const getScoreColor = (valor: number) => {
    if (valor >= 4) return 'bg-green-100 text-green-800';
    if (valor >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreIcon = (valor: number) => {
    if (valor >= 4) return '🟢';
    if (valor >= 3) return '🟡';
    return '🔴';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Questionário - {data}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(respostasDetalhadas).map(([categoria, respostas]) => {
            const categoriaKey = categoria as keyof RespostasDetalhadas;
            const perguntas = perguntasPorCategoria[categoriaKey];
            const media = Math.round(respostas.reduce((acc, val) => acc + val, 0) / respostas.length);
            
            return (
              <div key={categoria} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{categoriasLabels[categoriaKey]}</h3>
                  <Badge className={getScoreColor(media)}>
                    {getScoreIcon(media)} {media}/5
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {perguntas.map((pergunta, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm flex-1">{index + 1}. {pergunta}</span>
                      <Badge className={getScoreColor(respostas[index])}>
                        {respostas[index]}/5
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
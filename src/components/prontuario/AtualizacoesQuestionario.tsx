import React, { useState } from 'react';
import { AtualizacaoQuestionario } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateSampleAtualizacoes } from '@/utils/sampleData';
import { DetalhesQuestionarioModal } from './DetalhesQuestionarioModal';
import { Eye } from 'lucide-react';

interface AtualizacoesQuestionarioProps {
  clienteId: string;
  atualizacoes: AtualizacaoQuestionario[];
  onAddSampleData?: (atualizacoes: AtualizacaoQuestionario[]) => void;
}

export function AtualizacoesQuestionario({ clienteId, atualizacoes, onAddSampleData }: AtualizacoesQuestionarioProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [atualizacaoSelecionada, setAtualizacaoSelecionada] = useState<AtualizacaoQuestionario | null>(null);
  const getScoreColor = (valor: number) => {
    if (valor >= 4) return 'text-green-600';
    if (valor >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (valor: number) => {
    if (valor >= 4) return '🟢';
    if (valor >= 3) return '🟡';
    return '🔴';
  };

  const calcularScoreTotal = (atualizacao: AtualizacaoQuestionario) => {
    const total = atualizacao.adesaoAlimentar + 
                 atualizacao.fomeSaciedade + 
                 atualizacao.energia + 
                 atualizacao.sono + 
                 atualizacao.atividadeFisica + 
                 atualizacao.hidratacao + 
                 atualizacao.comportamentoEmocional + 
                 atualizacao.motivacaoProgresso;
    
    const percentual = (total / 40) * 100;
    return { total, percentual };
  };

  const getAlerta = (percentual: number) => {
    if (percentual >= 80) return { texto: 'OK', cor: 'bg-green-100 text-green-800', icone: '✅' };
    if (percentual >= 60) return { texto: 'Monitorar', cor: 'bg-yellow-100 text-yellow-800', icone: '⚠️' };
    return { texto: 'Atenção', cor: 'bg-red-100 text-red-800', icone: '❗' };
  };

  const atualizacoesOrdenadas = atualizacoes
    .sort((a, b) => new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime())
    .slice(0, 10); // Últimas 10 atualizações

  const handleAddSampleData = () => {
    if (onAddSampleData) {
      const sampleData = generateSampleAtualizacoes(clienteId);
      onAddSampleData(sampleData);
    }
  };

  if (atualizacoesOrdenadas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atualizações do Questionário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              Nenhuma atualização disponível
            </div>
            {onAddSampleData && (
              <Button onClick={handleAddSampleData} variant="outline">
                Gerar Dados de Exemplo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualizações do Questionário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Data</TableHead>
                <TableHead className="text-center">Adesão Alimentar</TableHead>
                <TableHead className="text-center">Fome e Saciedade</TableHead>
                <TableHead className="text-center">Energia</TableHead>
                <TableHead className="text-center">Sono</TableHead>
                <TableHead className="text-center">Atividade Física</TableHead>
                <TableHead className="text-center">Hidratação</TableHead>
                <TableHead className="text-center">Comportamento Emocional</TableHead>
                <TableHead className="text-center">Motivação e Progresso</TableHead>
                <TableHead className="text-center">Alerta</TableHead>
                <TableHead className="text-center">Score Final</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atualizacoesOrdenadas.map((atualizacao) => {
                const { total, percentual } = calcularScoreTotal(atualizacao);
                const alerta = getAlerta(percentual);
                
                return (
                  <TableRow key={atualizacao.id}>
                    <TableCell className="font-medium">
                      {format(new Date(atualizacao.dataResposta), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.adesaoAlimentar)}`}>
                        {atualizacao.adesaoAlimentar}/5 {getScoreIcon(atualizacao.adesaoAlimentar)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.fomeSaciedade)}`}>
                        {atualizacao.fomeSaciedade}/5 {getScoreIcon(atualizacao.fomeSaciedade)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.energia)}`}>
                        {atualizacao.energia}/5 {getScoreIcon(atualizacao.energia)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.sono)}`}>
                        {atualizacao.sono}/5 {getScoreIcon(atualizacao.sono)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.atividadeFisica)}`}>
                        {atualizacao.atividadeFisica}/5 {getScoreIcon(atualizacao.atividadeFisica)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.hidratacao)}`}>
                        {atualizacao.hidratacao}/5 {getScoreIcon(atualizacao.hidratacao)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.comportamentoEmocional)}`}>
                        {atualizacao.comportamentoEmocional}/5 {getScoreIcon(atualizacao.comportamentoEmocional)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <div className={`font-semibold ${getScoreColor(atualizacao.motivacaoProgresso)}`}>
                        {atualizacao.motivacaoProgresso}/5 {getScoreIcon(atualizacao.motivacaoProgresso)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge className={alerta.cor}>
                        {alerta.icone} {alerta.texto}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className={`text-center ${alerta.cor}`}>
                      <div className="font-bold" >
                        <div>{total}/40</div>
                        <div className="text-sm text-muted-foreground">
                          {percentual.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setAtualizacaoSelecionada(atualizacao);
                          setModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {atualizacoes.length > 10 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Mostrando as 10 atualizações mais recentes de {atualizacoes.length} total
          </div>
        )}
      </CardContent>
      
      {atualizacaoSelecionada && (
        <DetalhesQuestionarioModal 
          open={modalOpen}
          onOpenChange={setModalOpen}
          data={format(new Date(atualizacaoSelecionada.dataResposta), 'dd/MM/yyyy', { locale: ptBR })}
          respostasDetalhadas={atualizacaoSelecionada.respostasDetalhadas}
        />
      )}
    </Card>
  );
}
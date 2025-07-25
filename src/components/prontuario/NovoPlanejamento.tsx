import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PlanejamentoAlimentar, Refeicao, AlimentoRefeicao, Alimento, Cliente, ConsultaProntuario } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Clock, Apple, Save, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface NovoPlanejamentoProps {
  clienteId: string;
  cliente: Cliente;
  onClose: () => void;
  onSave: (plano: PlanejamentoAlimentar) => void;
}

export function NovoPlanejamento({ clienteId, cliente, onClose, onSave }: NovoPlanejamentoProps) {
  const { user } = useAuth();
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  const [consultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
  });

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([
    { id: '1', nome: 'Café da Manhã', horario: '07:00', alimentos: [] },
    { id: '2', nome: 'Lanche da Manhã', horario: '10:00', alimentos: [] },
    { id: '3', nome: 'Almoço', horario: '12:00', alimentos: [] },
    { id: '4', nome: 'Lanche da Tarde', horario: '15:00', alimentos: [] },
    { id: '5', nome: 'Jantar', horario: '19:00', alimentos: [] },
    { id: '6', nome: 'Ceia', horario: '22:00', alimentos: [] },
  ]);

  const [refeicaoAtual, setRefeicaoAtual] = useState<string>('1');
  const [novoAlimento, setNovoAlimento] = useState({
    alimentoId: '',
    quantidade: '',
    unidade: 'g'
  });

  const alimentoSelecionado = alimentos.find(a => a.id === novoAlimento.alimentoId);

  // Calcular valores nutricionais do alimento selecionado baseado na quantidade
  const valoresNutricionais = alimentoSelecionado && novoAlimento.quantidade ? (() => {
    const quantidade = parseFloat(novoAlimento.quantidade) || 0;
    const fator = quantidade / alimentoSelecionado.porcaoReferencia;
    return {
      kcal: alimentoSelecionado.informacaoNutricional.kcal * fator,
      proteina: alimentoSelecionado.informacaoNutricional.proteina * fator,
      carboidratos: alimentoSelecionado.informacaoNutricional.carboidratos * fator,
      lipideos: alimentoSelecionado.informacaoNutricional.lipideos * fator,
    };
  })() : null;

  // Estados para cálculos energéticos
  const [formulaTMB, setFormulaTMB] = useState<'harris-benedict' | 'mifflin-st-jeor' | 'katch-mcardle'>('mifflin-st-jeor');
  const [fatorAtividade, setFatorAtividade] = useState<number>(1.55);
  const [peso, setPeso] = useState<number>(0);
  const [altura, setAltura] = useState<number>(0);
  const [idade, setIdade] = useState<number>(0);
  const [sexo, setSexo] = useState<'masculino' | 'feminino'>('masculino');

  // Calcular idade baseado na data de nascimento
  React.useEffect(() => {
    if (cliente.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(cliente.dataNascimento);
      let idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
      const mesAtual = hoje.getMonth();
      const mesNascimento = nascimento.getMonth();
      
      if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        idadeCalculada--;
      }
      
      setIdade(idadeCalculada);
    }
  }, [cliente.dataNascimento]);

  // Buscar peso e altura da última consulta
  React.useEffect(() => {
    const consultasDoCliente = consultas
      .filter(c => c.clienteId === clienteId)
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    
    if (consultasDoCliente.length > 0) {
      const ultimaConsulta = consultasDoCliente[0];
      if (ultimaConsulta.medidas.peso > 0) {
        setPeso(ultimaConsulta.medidas.peso);
      }
      if (ultimaConsulta.medidas.altura > 0) {
        setAltura(ultimaConsulta.medidas.altura);
      }
    }
  }, [consultas, clienteId]);

  // Calcular TMB (Taxa Metabólica Basal)
  const calcularTMB = () => {
    if (!peso || !altura || !idade) return 0;

    switch (formulaTMB) {
      case 'harris-benedict':
        return sexo === 'masculino' 
          ? 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade)
          : 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
      
      case 'mifflin-st-jeor':
        return sexo === 'masculino'
          ? (10 * peso) + (6.25 * altura) - (5 * idade) + 5
          : (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
      
      case 'katch-mcardle':
        // Usando estimativa de 15% de gordura corporal se não fornecido
        const massaMagra = peso * 0.85;
        return 370 + (21.6 * massaMagra);
      
      default:
        return 0;
    }
  };

  const tmb = calcularTMB();
  const gastoTotal = tmb * fatorAtividade;

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }

    const plano: PlanejamentoAlimentar = {
      id: Date.now().toString(),
      clienteId,
      nome: formData.nome,
      descricao: formData.descricao,
      refeicoes: refeicoes.filter(r => r.alimentos.length > 0),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || undefined,
      ativo: true,
      criadoEm: new Date().toISOString(),
      criadoPor: user?.id || 'unknown'
    };

    onSave(plano);
    toast.success('Plano alimentar criado com sucesso');
    onClose();
  };

  const adicionarRefeicao = () => {
    const novaRefeicao: Refeicao = {
      id: Date.now().toString(),
      nome: 'Nova Refeição',
      horario: '12:00',
      alimentos: []
    };
    setRefeicoes([...refeicoes, novaRefeicao]);
  };

  const removerRefeicao = (id: string) => {
    setRefeicoes(refeicoes.filter(r => r.id !== id));
    if (refeicaoAtual === id) {
      setRefeicaoAtual(refeicoes[0]?.id || '');
    }
  };

  const editarRefeicao = (id: string, campo: 'nome' | 'horario', valor: string) => {
    setRefeicoes(refeicoes.map(r => 
      r.id === id ? { ...r, [campo]: valor } : r
    ));
  };

  const handleAlimentoChange = (alimentoId: string) => {
    const alimento = alimentos.find(a => a.id === alimentoId);
    setNovoAlimento({
      alimentoId,
      quantidade: alimento ? alimento.porcaoReferencia.toString() : '',
      unidade: alimento ? alimento.unidadeMedida : 'g'
    });
  };

  const adicionarAlimento = () => {
    if (!novoAlimento.alimentoId || !novoAlimento.quantidade) {
      toast.error('Selecione um alimento e informe a quantidade');
      return;
    }

    const alimento = alimentos.find(a => a.id === novoAlimento.alimentoId);
    if (!alimento) return;

    const alimentoRefeicao: AlimentoRefeicao = {
      alimentoId: alimento.id,
      alimentoNome: alimento.nome,
      quantidade: parseFloat(novoAlimento.quantidade),
      unidade: novoAlimento.unidade
    };

    setRefeicoes(refeicoes.map(r => 
      r.id === refeicaoAtual 
        ? { ...r, alimentos: [...r.alimentos, alimentoRefeicao] }
        : r
    ));

    setNovoAlimento({ alimentoId: '', quantidade: '', unidade: 'g' });
    toast.success('Alimento adicionado à refeição');
  };

  const removerAlimento = (refeicaoId: string, index: number) => {
    setRefeicoes(refeicoes.map(r =>
      r.id === refeicaoId
        ? { ...r, alimentos: r.alimentos.filter((_, i) => i !== index) }
        : r
    ));
  };

  const calcularTotaisRefeicao = (refeicao: Refeicao) => {
    return refeicao.alimentos.reduce((total, alimentoRef) => {
      const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
      if (!alimento) return total;

      const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
      return {
        kcal: total.kcal + (alimento.informacaoNutricional.kcal * fator),
        proteina: total.proteina + (alimento.informacaoNutricional.proteina * fator),
        carboidratos: total.carboidratos + (alimento.informacaoNutricional.carboidratos * fator),
        lipideos: total.lipideos + (alimento.informacaoNutricional.lipideos * fator),
      };
    }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });
  };

  const calcularTotaisDia = () => {
    return refeicoes.reduce((total, refeicao) => {
      const totaisRefeicao = calcularTotaisRefeicao(refeicao);
      return {
        kcal: total.kcal + totaisRefeicao.kcal,
        proteina: total.proteina + totaisRefeicao.proteina,
        carboidratos: total.carboidratos + totaisRefeicao.carboidratos,
        lipideos: total.lipideos + totaisRefeicao.lipideos,
      };
    }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });
  };

  const totaisDia = calcularTotaisDia();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-primary" />
            Novo Planejamento Alimentar
          </DialogTitle>
          <DialogDescription>
            Crie um plano alimentar personalizado para o paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome-plano">Nome do Plano</Label>
                  <Input
                    id="nome-plano"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Plano para Emagrecimento"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data-inicio">Data de Início</Label>
                  <Input
                    id="data-inicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="data-fim">Data de Fim (opcional)</Label>
                  <Input
                    id="data-fim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Objetivo do plano, observações especiais..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Cálculos Energéticos */}
          <Card>
            <CardHeader>
              <CardTitle>Cálculos Energéticos</CardTitle>
              <CardDescription>
                Configure os parâmetros para calcular as necessidades energéticas do paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={peso || ''}
                    onChange={(e) => setPeso(parseFloat(e.target.value) || 0)}
                    placeholder="70.0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    value={altura || ''}
                    onChange={(e) => setAltura(parseFloat(e.target.value) || 0)}
                    placeholder="170"
                  />
                </div>
                
                <div>
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={idade || ''}
                    onChange={(e) => setIdade(parseInt(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>
                
                <div>
                  <Label>Sexo</Label>
                  <Select value={sexo} onValueChange={(value: any) => setSexo(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Fórmula para TMB</Label>
                  <Select value={formulaTMB} onValueChange={(value: any) => setFormulaTMB(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mifflin-st-jeor">Mifflin-St Jeor (Recomendada)</SelectItem>
                      <SelectItem value="harris-benedict">Harris-Benedict</SelectItem>
                      <SelectItem value="katch-mcardle">Katch-McArdle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Nível de Atividade Física</Label>
                  <Select value={fatorAtividade.toString()} onValueChange={(value) => setFatorAtividade(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.2">Sedentário (1.2)</SelectItem>
                      <SelectItem value="1.375">Levemente ativo (1.375)</SelectItem>
                      <SelectItem value="1.55">Moderadamente ativo (1.55)</SelectItem>
                      <SelectItem value="1.725">Muito ativo (1.725)</SelectItem>
                      <SelectItem value="1.9">Extremamente ativo (1.9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resultados dos Cálculos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{tmb.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Gasto Energético Basal (kcal)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formulaTMB === 'mifflin-st-jeor' ? 'Mifflin-St Jeor' : 
                     formulaTMB === 'harris-benedict' ? 'Harris-Benedict' : 'Katch-McArdle'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{gastoTotal.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Gasto Energético Total (kcal)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    TMB × {fatorAtividade}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{totaisDia.kcal.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Oferta do Plano (kcal)</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {gastoTotal > 0 ? 
                      `${((totaisDia.kcal / gastoTotal) * 100).toFixed(0)}% do GET` : 
                      'Configure os parâmetros'
                    }
                  </div>
                </div>
              </div>

              {gastoTotal > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <strong>Interpretação:</strong>
                    {totaisDia.kcal < gastoTotal * 0.8 && (
                      <span className="text-red-600 ml-2">⚠️ Plano hipocalórico - pode promover perda de peso</span>
                    )}
                    {totaisDia.kcal >= gastoTotal * 0.8 && totaisDia.kcal <= gastoTotal * 1.2 && (
                      <span className="text-green-600 ml-2">✅ Plano balanceado - manutenção de peso</span>
                    )}
                    {totaisDia.kcal > gastoTotal * 1.2 && (
                      <span className="text-orange-600 ml-2">⚠️ Plano hipercalórico - pode promover ganho de peso</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo Nutricional do Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Nutricional Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{totaisDia.kcal.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">Calorias</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totaisDia.proteina.toFixed(1)}g</div>
                  <div className="text-sm text-muted-foreground">Proteína</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{totaisDia.carboidratos.toFixed(1)}g</div>
                  <div className="text-sm text-muted-foreground">Carboidratos</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{totaisDia.lipideos.toFixed(1)}g</div>
                  <div className="text-sm text-muted-foreground">Lipídeos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refeições */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Refeições</CardTitle>
                <Button variant="outline" size="sm" onClick={adicionarRefeicao}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Refeição
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={refeicaoAtual} onValueChange={setRefeicaoAtual}>
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                  {refeicoes.map((refeicao) => (
                    <TabsTrigger key={refeicao.id} value={refeicao.id} className="text-xs">
                      {refeicao.nome}
                      {refeicao.alimentos.length > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {refeicao.alimentos.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {refeicoes.map((refeicao) => {
                  const totais = calcularTotaisRefeicao(refeicao);
                  
                  return (
                    <TabsContent key={refeicao.id} value={refeicao.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Input
                              value={refeicao.nome}
                              onChange={(e) => editarRefeicao(refeicao.id, 'nome', e.target.value)}
                              className="font-medium w-40"
                            />
                            <Input
                              type="time"
                              value={refeicao.horario}
                              onChange={(e) => editarRefeicao(refeicao.id, 'horario', e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {totais.kcal.toFixed(0)} kcal | {totais.proteina.toFixed(1)}g P | {totais.carboidratos.toFixed(1)}g C | {totais.lipideos.toFixed(1)}g L
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerRefeicao(refeicao.id)}
                            disabled={refeicoes.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Adicionar Alimento */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Alimento</Label>
                          <Select value={novoAlimento.alimentoId} onValueChange={handleAlimentoChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um alimento" />
                            </SelectTrigger>
                            <SelectContent>
                              {alimentos.filter(a => a.ativo).map((alimento) => (
                                <SelectItem key={alimento.id} value={alimento.id}>
                                  {alimento.nome} ({alimento.categoria})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={novoAlimento.quantidade}
                            onChange={(e) => setNovoAlimento({ ...novoAlimento, quantidade: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                        
                        <div>
                          <Label>Unidade</Label>
                          <Select value={novoAlimento.unidade} onValueChange={(value) => setNovoAlimento({ ...novoAlimento, unidade: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="unidade">unidade</SelectItem>
                              <SelectItem value="colher de sopa">colher de sopa</SelectItem>
                              <SelectItem value="colher de chá">colher de chá</SelectItem>
                              <SelectItem value="xícara">xícara</SelectItem>
                              <SelectItem value="copo">copo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>&nbsp;</Label>
                          <Button onClick={adicionarAlimento} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </div>

                      {/* Resumo Nutricional do Alimento Selecionado */}
                      {valoresNutricionais && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-2">Resumo Nutricional:</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-green-600">{valoresNutricionais.kcal.toFixed(0)}</div>
                              <div className="text-muted-foreground">kcal</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-600">{valoresNutricionais.proteina.toFixed(1)}g</div>
                              <div className="text-muted-foreground">Proteína</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-yellow-600">{valoresNutricionais.carboidratos.toFixed(1)}g</div>
                              <div className="text-muted-foreground">Carboidratos</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-purple-600">{valoresNutricionais.lipideos.toFixed(1)}g</div>
                              <div className="text-muted-foreground">Lipídeos</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lista de Alimentos */}
                      {refeicao.alimentos.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Alimento</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Calorias</TableHead>
                              <TableHead>Proteína</TableHead>
                              <TableHead>Carboidratos</TableHead>
                              <TableHead>Lipídeos</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {refeicao.alimentos.map((alimentoRef, index) => {
                              const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
                              if (!alimento) return null;
                              
                              const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
                              
                              return (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{alimentoRef.alimentoNome}</TableCell>
                                  <TableCell>{alimentoRef.quantidade} {alimentoRef.unidade}</TableCell>
                                  <TableCell>{(alimento.informacaoNutricional.kcal * fator).toFixed(0)} kcal</TableCell>
                                  <TableCell>{(alimento.informacaoNutricional.proteina * fator).toFixed(1)}g</TableCell>
                                  <TableCell>{(alimento.informacaoNutricional.carboidratos * fator).toFixed(1)}g</TableCell>
                                  <TableCell>{(alimento.informacaoNutricional.lipideos * fator).toFixed(1)}g</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removerAlimento(refeicao.id, index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhum alimento adicionado a esta refeição
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Planejamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
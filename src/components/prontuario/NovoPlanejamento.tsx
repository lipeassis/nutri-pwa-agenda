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
  planejamentoParaEditar?: PlanejamentoAlimentar;
  onClose: () => void;
  onSave: (plano: PlanejamentoAlimentar) => void;
}

export function NovoPlanejamento({ clienteId, cliente, planejamentoParaEditar, onClose, onSave }: NovoPlanejamentoProps) {
  const { user } = useAuth();
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  const [consultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  
  const [formData, setFormData] = useState({
    nome: planejamentoParaEditar?.nome || '',
    descricao: planejamentoParaEditar?.descricao || '',
    dataInicio: planejamentoParaEditar?.dataInicio || new Date().toISOString().split('T')[0],
    dataFim: planejamentoParaEditar?.dataFim || '',
  });

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>(
    planejamentoParaEditar?.refeicoes || [
      { id: '1', nome: 'Café da Manhã', horario: '07:00', alimentos: [] },
      { id: '2', nome: 'Lanche da Manhã', horario: '10:00', alimentos: [] },
      { id: '3', nome: 'Almoço', horario: '12:00', alimentos: [] },
      { id: '4', nome: 'Lanche da Tarde', horario: '15:00', alimentos: [] },
      { id: '5', nome: 'Jantar', horario: '19:00', alimentos: [] },
      { id: '6', nome: 'Ceia', horario: '22:00', alimentos: [] },
    ]
  );

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
  const [formulaTMB, setFormulaTMB] = useState<'harris-benedict' | 'mifflin-st-jeor' | 'katch-mcardle' | 'cunningham' | 'tinsley' | 'bolso'>('mifflin-st-jeor');
  const [fatorAtividade, setFatorAtividade] = useState<number>(1.55);
  const [caloriasExtras, setCaloriasExtras] = useState<number>(0);
  const [tipoObjetivo, setTipoObjetivo] = useState<'deficit' | 'superavit' | 'manutencao'>('deficit');
  const [valorDeficitSuperavit, setValorDeficitSuperavit] = useState<number>(500);
  const [metaKcal, setMetaKcal] = useState<number>(0);
  const [metaProteina, setMetaProteina] = useState<number>(0);
  const [metaCarboidratos, setMetaCarboidratos] = useState<number>(0);
  const [metaLipideos, setMetaLipideos] = useState<number>(0);
  const [tipoMetaProteina, setTipoMetaProteina] = useState<'absoluto' | 'por-kg' | 'kcal-absoluto'>('por-kg');
  const [tipoMetaCarboidratos, setTipoMetaCarboidratos] = useState<'absoluto' | 'por-kg' | 'kcal-absoluto'>('absoluto');
  const [tipoMetaLipideos, setTipoMetaLipideos] = useState<'absoluto' | 'por-kg' | 'kcal-absoluto'>('absoluto');
  const [peso, setPeso] = useState<number>(0);
  const [altura, setAltura] = useState<number>(0);
  const [idade, setIdade] = useState<number>(0);
  const [sexo, setSexo] = useState<'masculino' | 'feminino'>('masculino');
  const [percentualGordura, setPercentualGordura] = useState<number>(0);
  const [kcalPorKg, setKcalPorKg] = useState<number>(25);

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

  // Buscar peso, altura e composição corporal da última consulta
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
      if (ultimaConsulta.medidas.percentualGordura > 0) {
        setPercentualGordura(ultimaConsulta.medidas.percentualGordura);
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
        const massaMagraKM = percentualGordura > 0 ? peso * (1 - percentualGordura / 100) : peso * 0.85;
        return 370 + (21.6 * massaMagraKM);
      
      case 'cunningham':
        // Cunningham: TMB = 500 + (22 × massa magra em kg)
        const massaMagraCunningham = percentualGordura > 0 ? peso * (1 - percentualGordura / 100) : peso * 0.85;
        return 500 + (22 * massaMagraCunningham);
      
      case 'tinsley':
        // Tinsley: TMB = 25.9 × massa magra + 284 (para pessoas treinadas)
        const massaMagraTinsley = percentualGordura > 0 ? peso * (1 - percentualGordura / 100) : peso * 0.85;
        return 25.9 * massaMagraTinsley + 284;
      
      case 'bolso':
        // Fórmula de Bolso: TMB = peso × kcal/kg
        return peso * kcalPorKg;
      
      default:
        return 0;
    }
  };

  const tmb = calcularTMB();
  const gastoTotal = tmb * fatorAtividade + caloriasExtras;

  // Calcular previsão de peso baseado no déficit/superávit
  const calcularPrevisaoPeso = () => {
    if (!formData.dataInicio || !formData.dataFim) return null;
    
    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    const diasTotal = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasTotal <= 0) return null;
    
    let deficitSuperavitTotal = 0;
    
    if (tipoObjetivo === 'deficit') {
      deficitSuperavitTotal = valorDeficitSuperavit * diasTotal;
    } else if (tipoObjetivo === 'superavit') {
      deficitSuperavitTotal = -valorDeficitSuperavit * diasTotal;
    }
    
    // 9900 kcal = 1 kg de gordura
    const previsaoKg = deficitSuperavitTotal / 9900;
    
    return {
      dias: diasTotal,
      previsaoKg: Math.abs(previsaoKg),
      tipo: tipoObjetivo,
      pesoFinal: peso + (tipoObjetivo === 'superavit' ? Math.abs(previsaoKg) : -Math.abs(previsaoKg))
    };
  };

  const previsaoPeso = calcularPrevisaoPeso();

  // Calcular automaticamente a meta de kcal baseada no objetivo
  React.useEffect(() => {
    if (gastoTotal > 0) {
      let metaCalculada = gastoTotal;
      
      if (tipoObjetivo === 'deficit') {
        metaCalculada = gastoTotal - valorDeficitSuperavit;
      } else if (tipoObjetivo === 'superavit') {
        metaCalculada = gastoTotal + valorDeficitSuperavit;
      }
      
      setMetaKcal(Math.round(metaCalculada));
    }
  }, [gastoTotal, tipoObjetivo, valorDeficitSuperavit]);

  const handleSave = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do plano é obrigatório');
      return;
    }

    const plano: PlanejamentoAlimentar = {
      id: planejamentoParaEditar?.id || Date.now().toString(),
      clienteId,
      nome: formData.nome,
      descricao: formData.descricao,
      refeicoes: refeicoes.filter(r => r.alimentos.length > 0),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || undefined,
      fechado: planejamentoParaEditar?.fechado || false,
      ativo: true,
      criadoEm: planejamentoParaEditar?.criadoEm || new Date().toISOString(),
      criadoPor: planejamentoParaEditar?.criadoPor || user?.id || 'unknown'
    };

    onSave(plano);
    toast.success(planejamentoParaEditar ? 'Plano alimentar atualizado com sucesso' : 'Plano alimentar criado com sucesso');
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
            {planejamentoParaEditar ? 'Editar Planejamento Alimentar' : 'Novo Planejamento Alimentar'}
          </DialogTitle>
          <DialogDescription>
            {planejamentoParaEditar ? 'Edite o plano alimentar do paciente' : 'Crie um plano alimentar personalizado para o paciente'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="calculos">Cálculos Energéticos</TabsTrigger>
            <TabsTrigger value="metas">Metas Nutricionais</TabsTrigger>
            <TabsTrigger value="refeicoes">Refeições</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="col-span-4">
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
          </TabsContent>

          <TabsContent value="calculos" className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fórmula para TMB</Label>
                    <Select value={formulaTMB} onValueChange={(value: any) => setFormulaTMB(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mifflin-st-jeor">Mifflin-St Jeor</SelectItem>
                        <SelectItem value="harris-benedict">Harris-Benedict</SelectItem>
                        <SelectItem value="katch-mcardle">Katch-McArdle</SelectItem>
                        <SelectItem value="cunningham">Cunningham</SelectItem>
                        <SelectItem value="tinsley">Tinsley</SelectItem>
                        <SelectItem value="bolso">Fórmula de Bolso</SelectItem>
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
                  
                  <div>
                    <Label htmlFor="calorias-extras">Calorias Extras (AF,Treino)</Label>
                    <Input
                      id="calorias-extras"
                      type="number"
                      value={caloriasExtras || ''}
                      onChange={(e) => setCaloriasExtras(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {formulaTMB === 'bolso' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="kcal-por-kg">Kcal por Kg</Label>
                      <Input
                        id="kcal-por-kg"
                        type="number"
                        value={kcalPorKg || ''}
                        onChange={(e) => setKcalPorKg(parseFloat(e.target.value) || 25)}
                        placeholder="25"
                      />
                    </div>
                  </div>
                )}
                
                {(formulaTMB === 'katch-mcardle' || formulaTMB === 'cunningham' || formulaTMB === 'tinsley') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="percentual-gordura">% de Gordura Corporal</Label>
                      <Input
                        id="percentual-gordura"
                        type="number"
                        step="0.1"
                        value={percentualGordura || ''}
                        onChange={(e) => setPercentualGordura(parseFloat(e.target.value) || 0)}
                        placeholder="15.0"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Objetivo</Label>
                    <Select value={tipoObjetivo} onValueChange={(value: any) => setTipoObjetivo(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deficit">Déficit Calórico</SelectItem>
                        <SelectItem value="superavit">Superávit Calórico</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {tipoObjetivo !== 'manutencao' && (
                    <div>
                      <Label htmlFor="valor-deficit-superavit">
                        {tipoObjetivo === 'deficit' ? 'Déficit (kcal)' : 'Superávit (kcal)'}
                      </Label>
                      <Input
                        id="valor-deficit-superavit"
                        type="number"
                        value={valorDeficitSuperavit || ''}
                        onChange={(e) => setValorDeficitSuperavit(parseFloat(e.target.value) || 0)}
                        placeholder="500"
                      />
                    </div>
                  )}
                </div>

                {/* Resultados */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{tmb.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">TMB (kcal)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{gastoTotal.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Gasto Total (kcal)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{metaKcal.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Meta Calórica</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{((metaKcal / peso) || 0).toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Kcal/kg</div>
                  </div>
                </div>

                {/* Previsão de peso */}
                {previsaoPeso && previsaoPeso.dias > 0 && tipoObjetivo !== 'manutencao' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-center text-blue-900 mb-2">Previsão de Peso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{previsaoPeso.dias}</div>
                        <div className="text-muted-foreground">dias</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{peso.toFixed(1)}kg</div>
                        <div className="text-muted-foreground">peso atual</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${tipoObjetivo === 'deficit' ? 'text-green-600' : 'text-orange-600'}`}>
                          {(previsaoPeso.previsaoKg * 1.2).toFixed(1)}~{(previsaoPeso.previsaoKg - (previsaoPeso.previsaoKg * 0.2)).toFixed(1)}kg
                        </div>
                        <div className="text-muted-foreground">
                          {tipoObjetivo === 'deficit' ? 'perda prevista' : 'ganho previsto'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{(peso - (previsaoPeso.previsaoKg * 1.2)).toFixed(1)}~{(peso- (previsaoPeso.previsaoKg - (previsaoPeso.previsaoKg * 0.2))).toFixed(1)}kg</div>
                        <div className="text-muted-foreground">peso estimado</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas Nutricionais</CardTitle>
                <CardDescription>
                  Configure as metas nutricionais diárias do plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta-kcal">Meta de KCAL do Plano (automático)</Label>
                    <Input
                      id="meta-kcal"
                      type="number"
                      value={metaKcal || ''}
                      onChange={(e) => setMetaKcal(parseFloat(e.target.value) || 0)}
                      placeholder="Calculado automaticamente"
                      className="bg-muted"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Calculado automaticamente: Gasto Total {tipoObjetivo === 'deficit' ? '- Déficit' : tipoObjetivo === 'superavit' ? '+ Superávit' : '(Manutenção)'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="meta-proteina">Meta de Proteína</Label>
                    <div className="flex gap-2">
                      <Input
                        id="meta-proteina"
                        type="number"
                        step="0.1"
                        value={metaProteina || ''}
                        onChange={(e) => setMetaProteina(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 2.0"
                      />
                      <Select value={tipoMetaProteina} onValueChange={(value: any) => setTipoMetaProteina(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="por-kg">g/kg</SelectItem>
                          <SelectItem value="absoluto">g</SelectItem>
                          <SelectItem value="kcal-absoluto">kcal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-carboidratos">Meta de Carboidratos</Label>
                    <div className="flex gap-2">
                      <Input
                        id="meta-carboidratos"
                        type="number"
                        step="0.1"
                        value={metaCarboidratos || ''}
                        onChange={(e) => setMetaCarboidratos(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 250"
                      />
                      <Select value={tipoMetaCarboidratos} onValueChange={(value: any) => setTipoMetaCarboidratos(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="absoluto">g</SelectItem>
                          <SelectItem value="por-kg">g/kg</SelectItem>
                          <SelectItem value="kcal-absoluto">kcal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-lipideos">Meta de Lipídeos</Label>
                    <div className="flex gap-2">
                      <Input
                        id="meta-lipideos"
                        type="number"
                        step="0.1"
                        value={metaLipideos || ''}
                        onChange={(e) => setMetaLipideos(parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 80"
                      />
                      <Select value={tipoMetaLipideos} onValueChange={(value: any) => setTipoMetaLipideos(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="absoluto">g</SelectItem>
                          <SelectItem value="por-kg">g/kg</SelectItem>
                          <SelectItem value="kcal-absoluto">kcal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
          </TabsContent>

          <TabsContent value="refeicoes" className="space-y-6">
            {/* Resumo dos Totais */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Nutricional Diário</CardTitle>
                <CardDescription>
                  Totais calculados com base nas refeições configuradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{totaisDia.kcal.toFixed(0)}/{metaKcal}Kcal</div>
                    <div className="text-sm text-green-700">Calorias</div>
                    {metaKcal > 0 && (
                      <div className="text-xs mt-1">
                        <span className="text-muted-foreground">Meta: </span>
                        <span className={
                          (() => {
                            const percentual = (totaisDia.kcal / metaKcal) * 100;
                            return percentual >= 90 && percentual <= 110 ? 'text-green-600' : 'text-orange-600';
                          })()
                        }>
                          {((totaisDia.kcal / metaKcal) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{totaisDia.proteina.toFixed(1)}g/{metaProteina * peso}g</div>
                    <div className="text-sm text-blue-700">Proteína</div>
                    {metaProteina > 0 && (
                      <div className="text-xs mt-1">
                        <span className="text-muted-foreground">Meta: </span>
                        <span className={
                          (() => {
                            const metaAbsoluta = tipoMetaProteina === 'por-kg' 
                              ? metaProteina * peso
                              : tipoMetaProteina === 'kcal-absoluto'
                                ? metaProteina / 4
                                : metaProteina;
                            const percentual = metaAbsoluta > 0 ? (totaisDia.proteina / metaAbsoluta) * 100 : 0;
                            return percentual >= 90 && percentual <= 110 ? 'text-green-600' : 'text-orange-600';
                          })()
                        }>
                          {(() => {
                            const metaAbsoluta = tipoMetaProteina === 'por-kg' 
                              ? metaProteina * peso
                              : tipoMetaProteina === 'kcal-absoluto'
                                ? metaProteina / 4
                                : metaProteina;
                            return `${(metaAbsoluta > 0 ? (totaisDia.proteina / metaAbsoluta) * 100 : 0).toFixed(0)}%`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{totaisDia.carboidratos.toFixed(1)}g/{(() => {
                      const totalProteina = metaProteina * peso * 4
                      const totalLipideos = metaLipideos * peso * 9
                      return (metaKcal- (totalProteina + totalLipideos)) / 4
                    })()}g</div>
                    <div className="text-sm text-yellow-700">Carboidratos</div>
                    {metaCarboidratos > 0 && (
                      <div className="text-xs mt-1">
                        <span className="text-muted-foreground">Meta: </span>
                        <span className={
                          (() => {
                            const metaAbsoluta = tipoMetaCarboidratos === 'por-kg' 
                              ? metaCarboidratos * peso
                              : tipoMetaCarboidratos === 'kcal-absoluto'
                                ? metaCarboidratos / 4
                                : metaCarboidratos;
                            const percentual = metaAbsoluta > 0 ? (totaisDia.carboidratos / metaAbsoluta) * 100 : 0;
                            return percentual >= 90 && percentual <= 110 ? 'text-green-600' : 'text-orange-600';
                          })()
                        }>
                          {(() => {
                            const metaAbsoluta = tipoMetaCarboidratos === 'por-kg' 
                              ? metaCarboidratos * peso
                              : tipoMetaCarboidratos === 'kcal-absoluto'
                                ? metaCarboidratos / 4
                                : metaCarboidratos;
                            return `${(metaAbsoluta > 0 ? (totaisDia.carboidratos / metaAbsoluta) * 100 : 0).toFixed(0)}%`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{totaisDia.lipideos.toFixed(1)}g/{metaLipideos * peso}g</div>
                    <div className="text-sm text-purple-700">Lipídeos</div>
                    {metaLipideos > 0 && (
                      <div className="text-xs mt-1">
                        <span className="text-muted-foreground">Meta: </span>
                        <span className={
                          (() => {
                            const metaAbsoluta = tipoMetaLipideos === 'por-kg' 
                              ? metaLipideos * peso
                              : tipoMetaLipideos === 'kcal-absoluto'
                                ? metaLipideos / 9
                                : metaLipideos;
                            const percentual = metaAbsoluta > 0 ? (totaisDia.lipideos / metaAbsoluta) * 100 : 0;
                            return percentual >= 90 && percentual <= 110 ? 'text-green-600' : 'text-orange-600';
                          })()
                        }>
                          {(() => {
                            const metaAbsoluta = tipoMetaLipideos === 'por-kg' 
                              ? metaLipideos * peso
                              : tipoMetaLipideos === 'kcal-absoluto'
                                ? metaLipideos / 9
                                : metaLipideos;
                            return `${(metaAbsoluta > 0 ? (totaisDia.lipideos / metaAbsoluta) * 100 : 0).toFixed(0)}%`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                          <Badge variant="secondary" className="ml-1 bg-green-200 text-xs">
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
                                    <TableCell>{alimentoRef.quantidade} {alimento.unidadeMedida}</TableCell>
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
          </TabsContent>

          {/* Ações */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Planejamento
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PlanejamentoAlimentar, Alimento } from "@/types";
import { Calculator, TrendingUp, TrendingDown, Percent, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReajustarPlanoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteNome: string;
  planejamentosCliente: PlanejamentoAlimentar[];
}

export function ReajustarPlanoModal({ 
  open, 
  onOpenChange, 
  clienteId,
  clienteNome,
  planejamentosCliente 
}: ReajustarPlanoModalProps) {
  const { toast } = useToast();
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  const [planejamentos, setPlanejamentos] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanejamentoAlimentar | null>(null);
  const [tipoAjuste, setTipoAjuste] = useState<'percentual' | 'absoluto'>('percentual');
  const [valorAjuste, setValorAjuste] = useState<string>('');
  const [operacao, setOperacao] = useState<'aumentar' | 'diminuir'>('aumentar');
  const [nomeNovoPlano, setNomeNovoPlano] = useState<string>('');
  const [processando, setProcessando] = useState(false);

  const calcularTotaisPlano = (plano: PlanejamentoAlimentar) => {
    return plano.refeicoes.reduce((totalPlano, refeicao) => {
      const totalRefeicao = refeicao.alimentos.reduce((totalRef, alimentoRef) => {
        const alimento = alimentos.find(a => a.id === alimentoRef.alimentoId);
        if (!alimento) return totalRef;

        const fator = alimentoRef.quantidade / alimento.porcaoReferencia;
        return {
          kcal: totalRef.kcal + (alimento.informacaoNutricional.kcal * fator),
          proteina: totalRef.proteina + (alimento.informacaoNutricional.proteina * fator),
          carboidratos: totalRef.carboidratos + (alimento.informacaoNutricional.carboidratos * fator),
          lipideos: totalRef.lipideos + (alimento.informacaoNutricional.lipideos * fator),
        };
      }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });

      return {
        kcal: totalPlano.kcal + totalRefeicao.kcal,
        proteina: totalPlano.proteina + totalRefeicao.proteina,
        carboidratos: totalPlano.carboidratos + totalRefeicao.carboidratos,
        lipideos: totalPlano.lipideos + totalRefeicao.lipideos,
      };
    }, { kcal: 0, proteina: 0, carboidratos: 0, lipideos: 0 });
  };

  const aplicarReajuste = () => {
    if (!planoSelecionado || !valorAjuste || !nomeNovoPlano.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const valor = parseFloat(valorAjuste);
    if (isNaN(valor) || valor <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor numérico positivo.",
        variant: "destructive",
      });
      return;
    }

    setProcessando(true);

    try {
      const totaisOriginais = calcularTotaisPlano(planoSelecionado);
      
      // Calcular fator de ajuste
      let fatorAjuste: number;
      if (tipoAjuste === 'percentual') {
        fatorAjuste = operacao === 'aumentar' 
          ? 1 + (valor / 100) 
          : 1 - (valor / 100);
      } else {
        // Ajuste absoluto
        const novoTotalKcal = operacao === 'aumentar' 
          ? totaisOriginais.kcal + valor 
          : totaisOriginais.kcal - valor;
        fatorAjuste = novoTotalKcal / totaisOriginais.kcal;
      }

      if (fatorAjuste <= 0) {
        toast({
          title: "Ajuste inválido",
          description: "O ajuste resultaria em valores negativos ou zero.",
          variant: "destructive",
        });
        return;
      }

      // Criar novo plano com quantidades ajustadas
      const novoPlano: PlanejamentoAlimentar = {
        ...planoSelecionado,
        id: Date.now().toString(),
        nome: nomeNovoPlano.trim(),
        descricao: `${planoSelecionado.descricao} - Reajustado (${operacao === 'aumentar' ? '+' : '-'}${valor}${tipoAjuste === 'percentual' ? '%' : ' kcal'})`,
        criadoEm: new Date().toISOString(),
        criadoPor: 'user',
        refeicoes: planoSelecionado.refeicoes.map(refeicao => ({
          ...refeicao,
          alimentos: refeicao.alimentos.map(alimentoRef => ({
            ...alimentoRef,
            quantidade: Math.round(alimentoRef.quantidade * fatorAjuste * 100) / 100 // Arredondar para 2 casas decimais
          }))
        }))
      };

      // Adicionar o novo plano
      setPlanejamentos([...planejamentos, novoPlano]);

      const totaisNovos = calcularTotaisPlano(novoPlano);

      toast({
        title: "Plano reajustado com sucesso!",
        description: `${nomeNovoPlano} criado com ${totaisNovos.kcal.toFixed(0)} kcal (${operacao === 'aumentar' ? '+' : '-'}${Math.abs(totaisNovos.kcal - totaisOriginais.kcal).toFixed(0)} kcal).`,
      });

      // Reset
      setPlanoSelecionado(null);
      setValorAjuste('');
      setNomeNovoPlano('');
      onOpenChange(false);

    } catch (error) {
      toast({
        title: "Erro ao reajustar plano",
        description: "Ocorreu um erro ao processar o reajuste. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  const totaisPlanoSelecionado = planoSelecionado ? calcularTotaisPlano(planoSelecionado) : null;
  
  // Calcular preview dos novos valores
  const previewTotais = (() => {
    if (!planoSelecionado || !valorAjuste || !totaisPlanoSelecionado) return null;
    
    const valor = parseFloat(valorAjuste);
    if (isNaN(valor) || valor <= 0) return null;

    let novoTotalKcal: number;
    if (tipoAjuste === 'percentual') {
      novoTotalKcal = operacao === 'aumentar'
        ? totaisPlanoSelecionado.kcal * (1 + valor / 100)
        : totaisPlanoSelecionado.kcal * (1 - valor / 100);
    } else {
      novoTotalKcal = operacao === 'aumentar'
        ? totaisPlanoSelecionado.kcal + valor
        : totaisPlanoSelecionado.kcal - valor;
    }

    const diferenca = novoTotalKcal - totaisPlanoSelecionado.kcal;
    return { novoTotal: novoTotalKcal, diferenca };
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Reajustar Planejamento Alimentar
          </DialogTitle>
          <DialogDescription>
            Ajuste as calorias de um plano alimentar criando uma nova versão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do Plano */}
          <div>
            <Label className="text-base font-medium">Selecione o plano a ser reajustado:</Label>
            <div className="mt-2 space-y-2">
              {planejamentosCliente.map((plano) => {
                const totais = calcularTotaisPlano(plano);
                const isSelected = planoSelecionado?.id === plano.id;
                
                return (
                  <Card
                    key={plano.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setPlanoSelecionado(plano)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plano.nome}</CardTitle>
                      <CardDescription>{plano.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{totais.kcal.toFixed(0)} kcal</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{totais.proteina.toFixed(1)}g Proteína</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{totais.carboidratos.toFixed(1)}g Carboidratos</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{totais.lipideos.toFixed(1)}g Lipídeos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {planoSelecionado && (
            <>
              {/* Tipo de Operação */}
              <div>
                <Label className="text-base font-medium">Operação:</Label>
                <RadioGroup value={operacao} onValueChange={(value: 'aumentar' | 'diminuir') => setOperacao(value)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aumentar" id="aumentar" />
                    <Label htmlFor="aumentar" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Aumentar calorias
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="diminuir" id="diminuir" />
                    <Label htmlFor="diminuir" className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      Diminuir calorias
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tipo de Ajuste */}
              <div>
                <Label className="text-base font-medium">Tipo de ajuste:</Label>
                <RadioGroup value={tipoAjuste} onValueChange={(value: 'percentual' | 'absoluto') => setTipoAjuste(value)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentual" id="percentual" />
                    <Label htmlFor="percentual" className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Percentual (%)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absoluto" id="absoluto" />
                    <Label htmlFor="absoluto" className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Valor absoluto (kcal)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Valor do Ajuste */}
              <div>
                <Label className="text-base font-medium">
                  Valor do ajuste {tipoAjuste === 'percentual' ? '(%)' : '(kcal)'}:
                </Label>
                <Input
                  type="number"
                  min="0"
                  step={tipoAjuste === 'percentual' ? '1' : '10'}
                  value={valorAjuste}
                  onChange={(e) => setValorAjuste(e.target.value)}
                  placeholder={tipoAjuste === 'percentual' ? 'Ex: 10' : 'Ex: 200'}
                  className="mt-2"
                />
              </div>

              {/* Preview */}
              {previewTotais && (
                <Card className="bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Preview do Ajuste</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Atual:</span>
                        <span className="ml-2 font-medium">{totaisPlanoSelecionado!.kcal.toFixed(0)} kcal</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Novo:</span>
                        <span className="ml-2 font-medium">{previewTotais.novoTotal.toFixed(0)} kcal</span>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${previewTotais.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Diferença: {previewTotais.diferenca >= 0 ? '+' : ''}{previewTotais.diferenca.toFixed(0)} kcal
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nome do Novo Plano */}
              <div>
                <Label className="text-base font-medium">Nome do novo plano:</Label>
                <Input
                  value={nomeNovoPlano}
                  onChange={(e) => setNomeNovoPlano(e.target.value)}
                  placeholder="Ex: Plano Reajustado +10%"
                  className="mt-2"
                />
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPlanoSelecionado(null);
                setValorAjuste('');
                setNomeNovoPlano('');
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={aplicarReajuste}
              disabled={!planoSelecionado || !valorAjuste || !nomeNovoPlano.trim() || processando}
            >
              {processando ? 'Processando...' : 'Criar Plano Reajustado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
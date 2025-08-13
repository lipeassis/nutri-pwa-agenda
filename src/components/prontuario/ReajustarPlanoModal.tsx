import { useState, useEffect } from "react";
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
  planejamentoSelecionado: PlanejamentoAlimentar | null;
}

export function ReajustarPlanoModal({ 
  open, 
  onOpenChange, 
  clienteId,
  clienteNome,
  planejamentosCliente,
  planejamentoSelecionado 
}: ReajustarPlanoModalProps) {
  const { toast } = useToast();
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos_cadastrados', []);
  const [planejamentos, setPlanejamentos] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  
  const [tipoAjuste, setTipoAjuste] = useState<'percentual' | 'absoluto'>('percentual');
  const [valorAjuste, setValorAjuste] = useState<string>('');
  const [operacao, setOperacao] = useState<'aumentar' | 'diminuir'>('aumentar');
  const [tipoReajuste, setTipoReajuste] = useState<'novo' | 'existente'>('novo');
  const [nomeNovoPlano, setNomeNovoPlano] = useState<string>('');
  const [processando, setProcessando] = useState(false);

  // Reset form when modal opens/closes or plan changes
  useEffect(() => {
    if (!open) {
      setValorAjuste('');
      setNomeNovoPlano('');
      setProcessando(false);
    }
  }, [open]);

  useEffect(() => {
    if (planejamentoSelecionado) {
      setNomeNovoPlano(`${planejamentoSelecionado.nome} - Reajustado`);
    }
  }, [planejamentoSelecionado]);

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

  const handleReajustarPlano = async () => {
    if (!planejamentoSelecionado) {
      toast({
        title: "Nenhum plano selecionado",
        description: "Selecione um plano alimentar para reajustar.",
        variant: "destructive",
      });
      return;
    }

    if (!valorAjuste || (tipoReajuste === 'novo' && !nomeNovoPlano.trim())) {
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
      const totaisOriginais = calcularTotaisPlano(planejamentoSelecionado);
      
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

      if (tipoReajuste === 'novo') {
        // Criar novo plano com quantidades ajustadas
        const novoPlano: PlanejamentoAlimentar = {
          ...planejamentoSelecionado,
          id: Date.now().toString(),
          nome: nomeNovoPlano.trim(),
          descricao: `${planejamentoSelecionado.descricao} - Reajustado (${operacao === 'aumentar' ? '+' : '-'}${valor}${tipoAjuste === 'percentual' ? '%' : ' kcal'})`,
          criadoEm: new Date().toISOString(),
          criadoPor: 'user',
          // Aplicar ajuste em todas as refeições
          refeicoes: planejamentoSelecionado.refeicoes.map(refeicao => ({
            ...refeicao,
            alimentos: refeicao.alimentos.map(alimentoRef => ({
              ...alimentoRef,
              quantidade: Math.round(alimentoRef.quantidade * fatorAjuste * 100) / 100
            }))
          }))
        };

        // Adicionar o novo plano
        setPlanejamentos([...planejamentos, novoPlano]);

        toast({
          title: "Novo plano criado com sucesso!",
          description: `O plano "${nomeNovoPlano}" foi criado com base no plano "${planejamentoSelecionado.nome}".`,
        });
      } else {
        // Reajustar plano existente
        const planejamentosAtualizados = planejamentos.map(plano => {
          if (plano.id === planejamentoSelecionado.id) {
            return {
              ...plano,
              descricao: `${plano.descricao} - Reajustado (${operacao === 'aumentar' ? '+' : '-'}${valor}${tipoAjuste === 'percentual' ? '%' : ' kcal'})`,
              refeicoes: plano.refeicoes.map(refeicao => ({
                ...refeicao,
                alimentos: refeicao.alimentos.map(alimentoRef => ({
                  ...alimentoRef,
                  quantidade: Math.round(alimentoRef.quantidade * fatorAjuste * 100) / 100
                }))
              }))
            };
          }
          return plano;
        });

        setPlanejamentos(planejamentosAtualizados);

        toast({
          title: "Plano reajustado com sucesso!",
          description: `O plano "${planejamentoSelecionado.nome}" foi reajustado.`,
        });
      }

      // Reset form
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

  const totaisPlanoSelecionado = planejamentoSelecionado ? calcularTotaisPlano(planejamentoSelecionado) : null;
  
  // Calcular preview dos novos valores
  const previewTotais = (() => {
    if (!planejamentoSelecionado || !valorAjuste || !totaisPlanoSelecionado) return null;
    
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
          {/* Mostrar Plano Selecionado */}
          {planejamentoSelecionado && (
            <div>
              <Label className="text-base font-medium">Plano a ser reajustado:</Label>
              <div className="mt-2">
                <Card className="border-primary bg-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{planejamentoSelecionado.nome}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {planejamentoSelecionado.descricao}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        {totaisPlanoSelecionado && (
                          <>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calculator className="w-4 h-4 text-primary" />
                              {totaisPlanoSelecionado.kcal.toFixed(0)} kcal
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                              <div>{totaisPlanoSelecionado.proteina.toFixed(1)}g Proteína</div>
                              <div>{totaisPlanoSelecionado.carboidratos.toFixed(1)}g Carboidratos</div>
                              <div>{totaisPlanoSelecionado.lipideos.toFixed(1)}g Lipídeos</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Configuração do Reajuste */}
          {planejamentoSelecionado && (
            <>
              {/* Tipo de Reajuste */}
              <div>
                <Label className="text-base font-medium">Como deseja reajustar?</Label>
                <RadioGroup value={tipoReajuste} onValueChange={(value: 'novo' | 'existente') => setTipoReajuste(value)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="novo" id="novo" />
                    <Label htmlFor="novo">
                      Criar novo plano (mantém o original)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existente" id="existente" />
                    <Label htmlFor="existente">
                      Reajustar plano existente (substitui o original)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

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

              {/* Nome do Novo Plano - só mostra se for criar novo */}
              {tipoReajuste === 'novo' && (
                <div>
                  <Label className="text-base font-medium">Nome do novo plano:</Label>
                  <Input
                    value={nomeNovoPlano}
                    onChange={(e) => setNomeNovoPlano(e.target.value)}
                    placeholder={`${planejamentoSelecionado.nome} - Reajustado`}
                    className="mt-2"
                  />
                </div>
              )}
            </>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setValorAjuste('');
                setNomeNovoPlano('');
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReajustarPlano}
              disabled={!planejamentoSelecionado || !valorAjuste || (tipoReajuste === 'novo' && !nomeNovoPlano.trim()) || processando}
              className="w-full"
            >
              {processando ? 'Processando...' : (tipoReajuste === 'novo' ? 'Criar Novo Plano' : 'Reajustar Plano')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, ConsultaProntuario, ExameBioquimico, ResultadoExame } from "@/types";
import { Save, TestTube, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdicionarExameProps {
  cliente: Cliente;
  onClose: () => void;
}

export function AdicionarExame({ cliente, onClose }: AdicionarExameProps) {
  const { toast } = useToast();
  const [consultas, setConsultas] = useLocalStorage<ConsultaProntuario[]>('nutriapp-consultas', []);
  const [exames] = useLocalStorage<ExameBioquimico[]>('exames_bioquimicos', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
  });

  const [resultadosExames, setResultadosExames] = useState<ResultadoExame[]>([]);
  const [novoExame, setNovoExame] = useState({
    exameId: '',
    valor: '',
    unidade: ''
  });

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const adicionarExame = () => {
    if (!novoExame.exameId || !novoExame.valor) {
      toast({
        title: "Erro",
        description: "Selecione um exame e digite o valor.",
        variant: "destructive",
      });
      return;
    }

    const exame = exames.find(e => e.id === novoExame.exameId);
    if (!exame) return;

    // Determinar o gênero baseado no cliente (assumindo que temos essa informação)
    const idade = calcularIdade(cliente.dataNascimento);
    
    // Encontrar o valor de referência apropriado
    const valorReferencia = exame.valoresReferencia.find(vr => 
      (vr.genero === 'ambos' || vr.genero === 'masculino') && // Assumindo masculino por padrão
      idade >= vr.idadeMinima && 
      idade <= vr.idadeMaxima
    );

    const valorNumerico = parseFloat(novoExame.valor);
    let status: 'abaixo' | 'normal' | 'acima' = 'normal';
    
    if (valorReferencia) {
      if (valorNumerico < valorReferencia.minimo) {
        status = 'abaixo';
      } else if (valorNumerico > valorReferencia.maximo) {
        status = 'acima';
      }
    }

    const resultado: ResultadoExame = {
      exameId: exame.id,
      exameNome: exame.nome,
      valor: valorNumerico,
      unidade: novoExame.unidade || valorReferencia?.unidade || '',
      status
    };

    setResultadosExames([...resultadosExames, resultado]);
    setNovoExame({ exameId: '', valor: '', unidade: '' });
    
    toast({
      title: "Exame adicionado",
      description: `Resultado ${status === 'normal' ? 'dentro da normalidade' : status === 'abaixo' ? 'abaixo do normal' : 'acima do normal'}`,
    });
  };

  const removerExame = (index: number) => {
    setResultadosExames(resultadosExames.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resultadosExames.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um exame.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar uma nova consulta apenas com os exames
      const novaConsulta: ConsultaProntuario = {
        id: Date.now().toString(),
        clienteId: cliente.id,
        data: formData.data,
        medidas: {
          peso: 0,
          altura: 0,
          circunferenciaBraco: 0,
          circunferenciaAbdomen: 0,
          circunferenciaQuadril: 0,
          circunferenciaPescoco: 0,
          percentualGordura: 0,
          massaMuscular: 0,
        },
        dobrasCutaneas: {
          tricipital: 0,
          bicipital: 0,
          subescapular: 0,
          suprailiaca: 0,
          abdominal: 0,
          coxa: 0,
          panturrilha: 0,
        },
        resultadosExames: resultadosExames,
        anamnese: {
          funcaoIntestinal: '' as const,
          padraoAlimentar: '',
          horariosIrregulares: false,
          compulsoes: false,
          consumoAgua: 0,
          sintomasAtuais: [],
          outros: '',
          habitosAjustar: '',
          manutencaoPlano: '',
          suplementacao: '',
          alimentosPriorizados: '',
          alimentosEvitados: '',
          reforcoComportamental: '',
          estrategiasComplementares: '',
        },
        relatoPaciente: '',
        observacoesNutricionista: `Exames adicionados em ${new Date(formData.data).toLocaleDateString('pt-BR')}`,
        criadoEm: new Date().toISOString()
      };

      setConsultas(prev => [...prev, novaConsulta]);

      toast({
        title: "Exames registrados",
        description: "Os exames foram registrados no prontuário do paciente.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar os exames.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            Adicionar Exames - {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Registre novos resultados de exames bioquímicos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data dos Exames */}
          <div className="space-y-2">
            <Label htmlFor="data">Data dos Exames</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>

          {/* Adicionar novo exame */}
          <div className="space-y-4">
            <h3 className="font-medium">Adicionar Exame</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Exame</Label>
                <Select value={novoExame.exameId} onValueChange={(value) => setNovoExame({ ...novoExame, exameId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um exame" />
                  </SelectTrigger>
                  <SelectContent>
                    {exames.filter(e => e.ativo).map((exame) => (
                      <SelectItem key={exame.id} value={exame.id}>
                        {exame.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novoExame.valor}
                  onChange={(e) => setNovoExame({ ...novoExame, valor: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  value={novoExame.unidade}
                  onChange={(e) => setNovoExame({ ...novoExame, unidade: e.target.value })}
                  placeholder="mg/dL"
                />
              </div>
              
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button type="button" onClick={adicionarExame} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de exames adicionados */}
          {resultadosExames.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Exames a serem Registrados:</h4>
              {resultadosExames.map((resultado, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{resultado.exameNome}</span>
                    <span>{resultado.valor} {resultado.unidade}</span>
                    <Badge 
                      variant={
                        resultado.status === 'normal' ? 'default' : 
                        resultado.status === 'abaixo' ? 'destructive' : 
                        'destructive'
                      }
                    >
                      {resultado.status === 'normal' ? 'Normal' : 
                       resultado.status === 'abaixo' ? 'Abaixo' : 'Acima'}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerExame(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>💡 Dicas para registro de exames:</strong>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Valores são comparados automaticamente com referências por idade</li>
              <li>• Sempre confira a unidade de medida do exame</li>
              <li>• Resultados fora da normalidade são destacados</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting || resultadosExames.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Exames"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
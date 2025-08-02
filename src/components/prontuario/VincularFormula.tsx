import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Eye, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FormulaMagistral, FormulaVinculada } from "@/types";

interface VincularFormulaProps {
  clienteId: string;
  clienteNome: string;
}

export function VincularFormula({ clienteId, clienteNome }: VincularFormulaProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados usando localStorage
  const [formulas] = useLocalStorage<FormulaMagistral[]>('formulas-magistrais', []);
  const [formulasVinculadas, setFormulasVinculadas] = useLocalStorage<FormulaVinculada[]>('formulas-vinculadas', []);
  
  // Estados do componente
  const [dialogAberto, setDialogAberto] = useState(false);
  const [visualizandoFormula, setVisualizandoFormula] = useState<FormulaMagistral | null>(null);
  
  // Estados do formulário
  const [formulaSelecionada, setFormulaSelecionada] = useState('');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [observacoes, setObservacoes] = useState('');

  // Filtrar fórmulas vinculadas para o cliente atual
  const formulasDoCliente = formulasVinculadas.filter(fv => fv.clienteId === clienteId && fv.ativo);

  const resetFormulario = () => {
    setFormulaSelecionada('');
    setDataInicio(undefined);
    setDataFim(undefined);
    setObservacoes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formulaSelecionada || !dataInicio) {
      toast({
        title: "Erro",
        description: "Selecione uma fórmula e a data de início.",
        variant: "destructive",
      });
      return;
    }

    const formula = formulas.find(f => f.id === formulaSelecionada);
    if (!formula) return;

    const novaVinculacao: FormulaVinculada = {
      id: Date.now().toString(),
      clienteId,
      formulaId: formula.id,
      formulaNome: formula.nome,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim?.toISOString(),
      observacoes,
      ativo: true,
      criadoEm: new Date().toISOString(),
      criadoPor: user?.id || ''
    };

    setFormulasVinculadas([...formulasVinculadas, novaVinculacao]);
    
    toast({
      title: "Sucesso",
      description: "Fórmula vinculada ao paciente com sucesso!",
    });

    resetFormulario();
    setDialogAberto(false);
  };

  const removerVinculo = (id: string) => {
    setFormulasVinculadas(formulasVinculadas.map(fv => 
      fv.id === id ? { ...fv, ativo: false } : fv
    ));
    
    toast({
      title: "Sucesso",
      description: "Vínculo da fórmula removido com sucesso!",
    });
  };

  const visualizarFormula = (formulaId: string) => {
    const formula = formulas.find(f => f.id === formulaId);
    if (formula) {
      setVisualizandoFormula(formula);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fórmulas Magistrais</h3>
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Vincular Fórmula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vincular Fórmula Magistral</DialogTitle>
              <DialogDescription>
                Vincule uma fórmula magistral ao prontuário de {clienteNome}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="formula">Fórmula Magistral *</Label>
                <Select value={formulaSelecionada} onValueChange={setFormulaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma fórmula" />
                  </SelectTrigger>
                  <SelectContent>
                    {formulas.filter(f => f.ativo).map((formula) => (
                      <SelectItem key={formula.id} value={formula.id}>
                        {formula.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataInicio}
                        onSelect={setDataInicio}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Data de Fim (Opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataFim && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataFim ? format(dataFim, "PPP", { locale: ptBR }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dataFim}
                        onSelect={setDataFim}
                        initialFocus
                        disabled={(date) => dataInicio ? date < dataInicio : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações específicas para este paciente"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Vincular Fórmula
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para visualizar fórmula */}
      <Dialog open={!!visualizandoFormula} onOpenChange={() => setVisualizandoFormula(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fórmula</DialogTitle>
          </DialogHeader>
          {visualizandoFormula && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Nome:</Label>
                <p>{visualizandoFormula.nome}</p>
              </div>
              <div>
                <Label className="font-semibold">Componentes:</Label>
                <div className="space-y-2 mt-2">
                  {visualizandoFormula.componentes.map((componente) => (
                    <div key={componente.id} className="flex items-center space-x-2">
                      <Badge variant="outline">{componente.nome}</Badge>
                      <span className="text-sm">
                        {componente.dosagem} {componente.unidade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Posologia:</Label>
                <p className="whitespace-pre-wrap">{visualizandoFormula.posologia}</p>
              </div>
              {visualizandoFormula.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <p className="whitespace-pre-wrap">{visualizandoFormula.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de fórmulas vinculadas */}
      {formulasDoCliente.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma fórmula magistral vinculada a este paciente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fórmulas Vinculadas</CardTitle>
            <CardDescription>
              Fórmulas magistrais ativas para este paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fórmula</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Fim</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formulasDoCliente.map((formulaVinculada) => (
                  <TableRow key={formulaVinculada.id}>
                    <TableCell className="font-medium">
                      {formulaVinculada.formulaNome}
                    </TableCell>
                    <TableCell>
                      {new Date(formulaVinculada.dataInicio).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {formulaVinculada.dataFim 
                        ? new Date(formulaVinculada.dataFim).toLocaleDateString('pt-BR')
                        : 'Em uso'
                      }
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {formulaVinculada.observacoes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => visualizarFormula(formulaVinculada.formulaId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerVinculo(formulaVinculada.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
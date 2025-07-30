import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Cliente, ProgramaNutricional, ClientePrograma } from "@/types";
import { Save, Star } from "lucide-react";
import { addWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VincularProgramaProps {
  cliente: Cliente;
  onClose: () => void;
}

export function VincularPrograma({ cliente, onClose }: VincularProgramaProps) {
  const { toast } = useToast();
  const [programas] = useLocalStorage<ProgramaNutricional[]>('nutriapp-programas', []);
  const [clienteProgramas, setClienteProgramas] = useLocalStorage<ClientePrograma[]>('nutriapp-cliente-programas', []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    programaId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    observacoes: '',
  });

  const programasAtivos = programas.filter(p => p.ativo);
  const programaEscolhido = programas.find(p => p.id === formData.programaId);

  const calcularDataFim = (dataInicio: string, duracao: number) => {
    const inicio = new Date(dataInicio);
    const fim = addWeeks(inicio, duracao);
    return fim.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.programaId || !formData.dataInicio) {
      toast({
        title: "Erro",
        description: "Selecione um programa e a data de início.",
        variant: "destructive",
      });
      return;
    }

    const programa = programas.find(p => p.id === formData.programaId);
    if (!programa) {
      toast({
        title: "Erro",
        description: "Programa não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o cliente já está vinculado a este programa
    const jaVinculado = clienteProgramas.some(cp => 
      cp.clienteId === cliente.id && 
      cp.programaId === formData.programaId && 
      cp.ativo
    );

    if (jaVinculado) {
      toast({
        title: "Erro",
        description: "Cliente já está vinculado a este programa.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataFim = calcularDataFim(formData.dataInicio, programa.duracao);

      const novoClientePrograma: ClientePrograma = {
        id: Date.now().toString(),
        clienteId: cliente.id,
        programaId: programa.id,
        programaNome: programa.nome,
        dataInicio: formData.dataInicio,
        dataFim: dataFim,
        preco: programa.preco,
        ativo: true,
        observacoes: formData.observacoes.trim() || undefined,
        criadoEm: new Date().toISOString()
      };

      setClienteProgramas(prev => [...prev, novoClientePrograma]);

      toast({
        title: "Programa vinculado",
        description: `Cliente vinculado ao programa "${programa.nome}" com sucesso.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao vincular o programa.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Vincular Programa - {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Vincule o cliente a um programa nutricional
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programa">Programa Nutricional *</Label>
            <Select 
              value={formData.programaId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, programaId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um programa" />
              </SelectTrigger>
              <SelectContent>
                {programasAtivos.map((programa) => (
                  <SelectItem key={programa.id} value={programa.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{programa.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {programa.duracao} semanas - R$ {programa.preco.toFixed(2)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início *</Label>
            <Input
              id="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
              required
            />
          </div>

          {programaEscolhido && formData.dataInicio && (
            <div className="bg-muted p-3 rounded-md space-y-2">
              <h4 className="font-medium text-sm">Resumo do Programa:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Programa:</strong> {programaEscolhido.nome}</div>
                <div><strong>Duração:</strong> {programaEscolhido.duracao} semanas</div>
                <div><strong>Início:</strong> {format(new Date(formData.dataInicio), "dd/MM/yyyy", { locale: ptBR })}</div>
                <div><strong>Fim previsto:</strong> {format(new Date(calcularDataFim(formData.dataInicio, programaEscolhido.duracao)), "dd/MM/yyyy", { locale: ptBR })}</div>
                <div><strong>Valor:</strong> R$ {programaEscolhido.preco.toFixed(2)}</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre a participação no programa..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || !formData.programaId}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Vinculando..." : "Vincular Programa"}
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
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReceitaMedica } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pill, FileText, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NovaReceitaProps {
  clienteId: string;
  receitaParaEditar?: ReceitaMedica;
  onClose: () => void;
  onSave: (receita: ReceitaMedica) => void;
}

export function NovaReceita({ clienteId, receitaParaEditar, onClose, onSave }: NovaReceitaProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    tipo: receitaParaEditar?.tipo || 'medicamento' as 'medicamento' | 'suplemento',
    nome: receitaParaEditar?.nome || '',
    dosagem: receitaParaEditar?.dosagem || '',
    frequencia: receitaParaEditar?.frequencia || '',
    duracao: receitaParaEditar?.duracao || '',
    instrucoes: receitaParaEditar?.instrucoes || '',
    observacoes: receitaParaEditar?.observacoes || '',
    medico: receitaParaEditar?.medico || '',
    dataEmissao: receitaParaEditar?.dataEmissao || new Date().toISOString().split('T')[0],
    dataInicio: receitaParaEditar?.dataInicio || new Date().toISOString().split('T')[0],
    dataFim: receitaParaEditar?.dataFim || '',
  });

  const handleSave = () => {
    if (!formData.nome.trim() || !formData.dosagem.trim() || !formData.frequencia.trim()) {
      toast.error('Nome, dosagem e frequência são obrigatórios');
      return;
    }

    const receita: ReceitaMedica = {
      id: receitaParaEditar?.id || Date.now().toString(),
      clienteId,
      tipo: formData.tipo,
      nome: formData.nome,
      dosagem: formData.dosagem,
      frequencia: formData.frequencia,
      duracao: formData.duracao,
      instrucoes: formData.instrucoes,
      observacoes: formData.observacoes,
      medico: formData.medico,
      dataEmissao: formData.dataEmissao,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || undefined,
      ativo: true,
      criadoEm: receitaParaEditar?.criadoEm || new Date().toISOString(),
      criadoPor: receitaParaEditar?.criadoPor || user?.id || 'unknown'
    };

    onSave(receita);
    toast.success(receitaParaEditar ? 'Receita atualizada com sucesso' : 'Receita cadastrada com sucesso');
    onClose();
  };

  const frequenciasSugeridas = [
    '1x ao dia',
    '2x ao dia',
    '3x ao dia',
    'De 8 em 8 horas',
    'De 12 em 12 horas',
    'A cada 6 horas',
    'Conforme necessário',
    'Em jejum',
    'Após as refeições',
    'Antes das refeições'
  ];

  const duracoesSugeridas = [
    '7 dias',
    '14 dias',
    '21 dias',
    '30 dias',
    '60 dias',
    '90 dias',
    'Contínuo',
    'Por tempo indeterminado'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            {receitaParaEditar ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
          <DialogDescription>
            {receitaParaEditar ? 'Edite as informações da receita' : 'Cadastre medicamentos ou suplementos prescritos para o paciente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: 'medicamento' | 'suplemento') => 
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicamento">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          Medicamento
                        </div>
                      </SelectItem>
                      <SelectItem value="suplemento">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Suplemento
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="nome">Nome do {formData.tipo}</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder={`Ex: ${formData.tipo === 'medicamento' ? 'Metformina 850mg' : 'Whey Protein'}`}
                  />
                </div>

                <div>
                  <Label htmlFor="dosagem">Dosagem</Label>
                  <Input
                    id="dosagem"
                    value={formData.dosagem}
                    onChange={(e) => setFormData({ ...formData, dosagem: e.target.value })}
                    placeholder="Ex: 1 comprimido, 30g, 5ml"
                  />
                </div>

                <div>
                  <Label htmlFor="frequencia">Frequência</Label>
                  <div className="space-y-2">
                    <Input
                      id="frequencia"
                      value={formData.frequencia}
                      onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
                      placeholder="Ex: 2x ao dia"
                    />
                    <div className="flex flex-wrap gap-1">
                      {frequenciasSugeridas.map((freq) => (
                        <Badge
                          key={freq}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => setFormData({ ...formData, frequencia: freq })}
                        >
                          {freq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="duracao">Duração do Tratamento</Label>
                  <div className="space-y-2">
                    <Input
                      id="duracao"
                      value={formData.duracao}
                      onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                      placeholder="Ex: 30 dias"
                    />
                    <div className="flex flex-wrap gap-1">
                      {duracoesSugeridas.map((dur) => (
                        <Badge
                          key={dur}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                          onClick={() => setFormData({ ...formData, duracao: dur })}
                        >
                          {dur}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="medico">Médico Prescritor</Label>
                  <Input
                    id="medico"
                    value={formData.medico}
                    onChange={(e) => setFormData({ ...formData, medico: e.target.value })}
                    placeholder="Dr. Nome do Médico - CRM"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Período de Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dataEmissao">Data de Emissão</Label>
                  <Input
                    id="dataEmissao"
                    type="date"
                    value={formData.dataEmissao}
                    onChange={(e) => setFormData({ ...formData, dataEmissao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dataFim">Data de Fim (opcional)</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Instruções e Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instrucoes">Instruções de Uso</Label>
                <Textarea
                  id="instrucoes"
                  value={formData.instrucoes}
                  onChange={(e) => setFormData({ ...formData, instrucoes: e.target.value })}
                  placeholder="Como tomar, horários específicos, interações..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações especiais, efeitos colaterais, cuidados..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {receitaParaEditar ? 'Atualizar' : 'Cadastrar'} Receita
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
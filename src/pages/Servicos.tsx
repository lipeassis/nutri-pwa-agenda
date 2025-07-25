import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Servico, Convenio } from "@/types";
import { Plus, Search, Edit, Trash2, Clock, DollarSign, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Servicos() {
  const { toast } = useToast();
  const [servicos, setServicos] = useLocalStorage<Servico[]>('nutriapp-servicos', []);
  const [convenios] = useLocalStorage<Convenio[]>('nutriapp-convenios', []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovoServico, setShowNovoServico] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tempoMinutos: "",
    valorParticular: "",
    valoresConvenios: {} as { [key: string]: string }
  });

  const conveniosAtivos = convenios.filter(c => c.ativo);
  const servicosAtivos = servicos.filter(s => s.ativo);
  const filteredServicos = servicosAtivos.filter(s => 
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tempoMinutos || !formData.valorParticular) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, tempo e valor particular são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const tempoMinutos = parseInt(formData.tempoMinutos);
    const valorParticular = parseFloat(formData.valorParticular);

    if (tempoMinutos <= 0) {
      toast({
        title: "Tempo inválido",
        description: "O tempo deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    if (valorParticular <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor particular deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    // Converter valores dos convênios para number
    const valoresConvenios: { [key: string]: number } = {};
    Object.entries(formData.valoresConvenios).forEach(([convenioId, valor]) => {
      const valorNum = parseFloat(valor);
      if (!isNaN(valorNum) && valorNum > 0) {
        valoresConvenios[convenioId] = valorNum;
      }
    });

    if (editingServico) {
      setServicos(prev => prev.map(s => 
        s.id === editingServico.id 
          ? {
              ...s,
              nome: formData.nome,
              descricao: formData.descricao,
              tempoMinutos,
              valorParticular,
              valoresConvenios
            }
          : s
      ));
      setEditingServico(null);
      toast({ title: "Serviço atualizado com sucesso!" });
    } else {
      const novoServico: Servico = {
        id: Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        tempoMinutos,
        valorParticular,
        valoresConvenios,
        ativo: true,
        criadoEm: new Date().toISOString()
      };

      setServicos(prev => [...prev, novoServico]);
      toast({ title: "Serviço cadastrado com sucesso!" });
    }

    resetForm();
    setShowNovoServico(false);
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    
    const valoresConveniosForm: { [key: string]: string } = {};
    conveniosAtivos.forEach(convenio => {
      valoresConveniosForm[convenio.id] = servico.valoresConvenios[convenio.id]?.toString() || "";
    });

    setFormData({
      nome: servico.nome,
      descricao: servico.descricao,
      tempoMinutos: servico.tempoMinutos.toString(),
      valorParticular: servico.valorParticular.toString(),
      valoresConvenios: valoresConveniosForm
    });
    setShowNovoServico(true);
  };

  const handleToggleStatus = (id: string) => {
    setServicos(prev => prev.map(s => 
      s.id === id ? { ...s, ativo: !s.ativo } : s
    ));
    toast({ title: "Status do serviço atualizado!" });
  };

  const handleDelete = (id: string) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ativo: false } : s));
    toast({ title: "Serviço removido com sucesso!" });
  };

  const resetForm = () => {
    const valoresConveniosEmpty: { [key: string]: string } = {};
    conveniosAtivos.forEach(convenio => {
      valoresConveniosEmpty[convenio.id] = "";
    });

    setFormData({
      nome: "",
      descricao: "",
      tempoMinutos: "",
      valorParticular: "",
      valoresConvenios: valoresConveniosEmpty
    });
    setEditingServico(null);
  };

  const formatTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Stethoscope className="w-8 h-8 mr-3 text-primary" />
            Serviços
          </h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{servicosAtivos.length}</p>
                <p className="text-sm text-muted-foreground">Serviços ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-info" />
              <div>
                <p className="text-2xl font-bold">
                  {servicosAtivos.length > 0
                    ? formatTempo(Math.round(servicosAtivos.reduce((acc, s) => acc + s.tempoMinutos, 0) / servicosAtivos.length))
                    : "0min"
                  }
                </p>
                <p className="text-sm text-muted-foreground">Tempo médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {servicosAtivos.length > 0
                    ? `R$ ${(servicosAtivos.reduce((acc, s) => acc + s.valorParticular, 0) / servicosAtivos.length).toFixed(2)}`
                    : "R$ 0,00"
                  }
                </p>
                <p className="text-sm text-muted-foreground">Valor médio particular</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={showNovoServico} onOpenChange={(open) => {
          setShowNovoServico(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingServico ? "Editar" : "Novo"} Serviço</DialogTitle>
              <DialogDescription>
                {editingServico ? "Edite" : "Cadastre"} um serviço no sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nome">Nome do Serviço *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Consulta Nutricional, Avaliação Corporal"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tempoMinutos">Tempo (minutos) *</Label>
                  <Input
                    id="tempoMinutos"
                    type="number"
                    min="1"
                    value={formData.tempoMinutos}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempoMinutos: e.target.value }))}
                    placeholder="60"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do serviço"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="valorParticular">Valor Particular (R$) *</Label>
                <Input
                  id="valorParticular"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorParticular}
                  onChange={(e) => setFormData(prev => ({ ...prev, valorParticular: e.target.value }))}
                  placeholder="150.00"
                  required
                />
              </div>

              {/* Seção de Preços Convênio */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold">Preços Convênio</h3>
                </div>

                {conveniosAtivos.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Preços por Convênio</Label>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Convênio</TableHead>
                            <TableHead className="w-[150px]">Valor Padrão</TableHead>
                            <TableHead>Preço Personalizado (R$)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {conveniosAtivos.map((convenio) => (
                            <TableRow key={convenio.id}>
                              <TableCell className="font-medium">
                                {convenio.nome}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                R$ {convenio.valorConsulta.toFixed(2)}
                                {convenio.percentualDesconto > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    ({convenio.percentualDesconto}% desconto)
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={formData.valoresConvenios[convenio.id] || ""}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    valoresConvenios: {
                                      ...prev.valoresConvenios,
                                      [convenio.id]: e.target.value
                                    }
                                  }))}
                                  placeholder={`${convenio.valorConsulta.toFixed(2)}`}
                                  className="w-full"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                      <p className="font-medium mb-1">💡 Dica:</p>
                      <ul className="space-y-1">
                        <li>• Deixe em branco para usar o valor padrão do convênio</li>
                        <li>• O valor padrão já considera o desconto configurado no convênio</li>
                        <li>• Valores personalizados substituem completamente o valor padrão</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Nenhum convênio cadastrado no sistema.
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Cadastre convênios para definir preços específicos.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingServico ? "Atualizar" : "Cadastrar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowNovoServico(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Serviços Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>Gerencie todos os serviços cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServicos.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre o primeiro serviço para começar
              </p>
              <Dialog open={showNovoServico} onOpenChange={setShowNovoServico}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Serviço
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Valor Particular</TableHead>
                  <TableHead>Convênios</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">{servico.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {servico.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatTempo(servico.tempoMinutos)}</Badge>
                    </TableCell>
                    <TableCell>R$ {servico.valorParticular.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {conveniosAtivos.filter(c => servico.valoresConvenios[c.id]).map(convenio => (
                          <div key={convenio.id} className="flex justify-between items-center text-xs bg-muted/50 px-2 py-1 rounded">
                            <span className="font-medium">{convenio.nome}:</span>
                            <span>R$ {servico.valoresConvenios[convenio.id].toFixed(2)}</span>
                          </div>
                        ))}
                        {Object.keys(servico.valoresConvenios).length === 0 && (
                          <span className="text-muted-foreground text-xs">Valores padrão dos convênios</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={servico.ativo}
                          onCheckedChange={() => handleToggleStatus(servico.id)}
                        />
                        <Badge variant={servico.ativo ? "default" : "secondary"}>
                          {servico.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(servico)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(servico.id)}
                          disabled={!servico.ativo}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
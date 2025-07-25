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
import { Convenio } from "@/types";
import { Plus, Search, Edit, Trash2, CreditCard, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Convenios() {
  const { toast } = useToast();
  const [convenios, setConvenios] = useLocalStorage<Convenio[]>('nutriapp-convenios', []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovoConvenio, setShowNovoConvenio] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    percentualDesconto: "",
    valorConsulta: ""
  });

  const filteredConvenios = convenios.filter(c => 
    c.ativo && c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.valorConsulta) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e valor da consulta são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const percentualDesconto = parseFloat(formData.percentualDesconto) || 0;
    const valorConsulta = parseFloat(formData.valorConsulta);

    if (percentualDesconto < 0 || percentualDesconto > 100) {
      toast({
        title: "Percentual inválido",
        description: "O percentual de desconto deve estar entre 0 e 100.",
        variant: "destructive"
      });
      return;
    }

    if (valorConsulta <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da consulta deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    if (editingConvenio) {
      setConvenios(prev => prev.map(c => 
        c.id === editingConvenio.id 
          ? {
              ...c,
              nome: formData.nome,
              descricao: formData.descricao,
              percentualDesconto,
              valorConsulta
            }
          : c
      ));
      setEditingConvenio(null);
      toast({ title: "Convênio atualizado com sucesso!" });
    } else {
      const novoConvenio: Convenio = {
        id: Date.now().toString(),
        nome: formData.nome,
        descricao: formData.descricao,
        percentualDesconto,
        valorConsulta,
        ativo: true,
        criadoEm: new Date().toISOString()
      };

      setConvenios(prev => [...prev, novoConvenio]);
      toast({ title: "Convênio cadastrado com sucesso!" });
    }

    setFormData({ nome: "", descricao: "", percentualDesconto: "", valorConsulta: "" });
    setShowNovoConvenio(false);
  };

  const handleEdit = (convenio: Convenio) => {
    setEditingConvenio(convenio);
    setFormData({
      nome: convenio.nome,
      descricao: convenio.descricao,
      percentualDesconto: convenio.percentualDesconto.toString(),
      valorConsulta: convenio.valorConsulta.toString()
    });
    setShowNovoConvenio(true);
  };

  const handleToggleStatus = (id: string) => {
    setConvenios(prev => prev.map(c => 
      c.id === id ? { ...c, ativo: !c.ativo } : c
    ));
    toast({ title: "Status do convênio atualizado!" });
  };

  const handleDelete = (id: string) => {
    setConvenios(prev => prev.map(c => c.id === id ? { ...c, ativo: false } : c));
    toast({ title: "Convênio removido com sucesso!" });
  };

  const resetForm = () => {
    setFormData({ nome: "", descricao: "", percentualDesconto: "", valorConsulta: "" });
    setEditingConvenio(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-primary" />
            Convênios
          </h1>
          <p className="text-muted-foreground">Gerencie os convênios médicos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{convenios.filter(c => c.ativo).length}</p>
                <p className="text-sm text-muted-foreground">Convênios ativos</p>
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
                  {convenios.filter(c => c.ativo).length > 0
                    ? `R$ ${(convenios.filter(c => c.ativo).reduce((acc, c) => acc + c.valorConsulta, 0) / convenios.filter(c => c.ativo).length).toFixed(2)}`
                    : "R$ 0,00"
                  }
                </p>
                <p className="text-sm text-muted-foreground">Valor médio consulta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-info" />
              <div>
                <p className="text-2xl font-bold">
                  {convenios.filter(c => c.ativo).length > 0
                    ? `${(convenios.filter(c => c.ativo).reduce((acc, c) => acc + c.percentualDesconto, 0) / convenios.filter(c => c.ativo).length).toFixed(1)}%`
                    : "0%"
                  }
                </p>
                <p className="text-sm text-muted-foreground">Desconto médio</p>
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
            placeholder="Pesquisar convênios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={showNovoConvenio} onOpenChange={(open) => {
          setShowNovoConvenio(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Convênio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingConvenio ? "Editar" : "Novo"} Convênio</DialogTitle>
              <DialogDescription>
                {editingConvenio ? "Edite" : "Cadastre"} um convênio no sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Convênio *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Unimed, Bradesco Saúde"
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do convênio"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="valorConsulta">Valor da Consulta (R$) *</Label>
                <Input
                  id="valorConsulta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorConsulta}
                  onChange={(e) => setFormData(prev => ({ ...prev, valorConsulta: e.target.value }))}
                  placeholder="150.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="percentualDesconto">Percentual de Desconto (%)</Label>
                <Input
                  id="percentualDesconto"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.percentualDesconto}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentualDesconto: e.target.value }))}
                  placeholder="10.0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">{editingConvenio ? "Atualizar" : "Cadastrar"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowNovoConvenio(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Convênios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Convênios</CardTitle>
          <CardDescription>Gerencie todos os convênios cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConvenios.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum convênio cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Cadastre o primeiro convênio para começar
              </p>
              <Dialog open={showNovoConvenio} onOpenChange={setShowNovoConvenio}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Convênio
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
                  <TableHead>Valor Consulta</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConvenios.map((convenio) => (
                  <TableRow key={convenio.id}>
                    <TableCell className="font-medium">{convenio.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {convenio.descricao || "-"}
                    </TableCell>
                    <TableCell>R$ {convenio.valorConsulta.toFixed(2)}</TableCell>
                    <TableCell>
                      {convenio.percentualDesconto > 0 ? (
                        <Badge variant="secondary">{convenio.percentualDesconto}%</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={convenio.ativo}
                          onCheckedChange={() => handleToggleStatus(convenio.id)}
                        />
                        <Badge variant={convenio.ativo ? "default" : "secondary"}>
                          {convenio.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(convenio.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(convenio)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDelete(convenio.id)}
                          disabled={!convenio.ativo}
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
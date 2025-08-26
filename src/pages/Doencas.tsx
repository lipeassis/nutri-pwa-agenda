import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataSource } from "@/lib/apiMigration";
import { Doenca, Alergia } from "@/types";
import { Plus, Search, Edit, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Doencas() {
  const { toast } = useToast();
  const { data: doencas, setData: setDoencas } = useDataSource<Doenca[]>('nutriapp-doencas', []);
  const { data: alergias, setData: setAlergias } = useDataSource<Alergia[]>('nutriapp-alergias', []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovaDoenca, setShowNovaDoenca] = useState(false);
  const [showNovaAlergia, setShowNovaAlergia] = useState(false);
  const [editingDoenca, setEditingDoenca] = useState<Doenca | null>(null);
  const [editingAlergia, setEditingAlergia] = useState<Alergia | null>(null);

  const [formDataDoenca, setFormDataDoenca] = useState({
    nome: "",
    resumo: "",
    protocoloNutricional: "",
    referencia: "",
    linksUteis: ""
  });

  const [formDataAlergia, setFormDataAlergia] = useState<{
    nome: string;
    descricao: string;
    severidade: 'leve' | 'moderada' | 'grave';
  }>({
    nome: "",
    descricao: "",
    severidade: "leve"
  });

  const filteredDoencas = doencas.filter(d => 
    d.ativo && d.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlergias = alergias.filter(a => 
    a.ativo && a.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitDoenca = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formDataDoenca.nome || !formDataDoenca.resumo) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e resumo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const linksArray = formDataDoenca.linksUteis 
      ? formDataDoenca.linksUteis.split('\n').filter(link => link.trim())
      : [];

    if (editingDoenca) {
      setDoencas(prev => prev.map(d => 
        d.id === editingDoenca.id 
          ? {
              ...d,
              nome: formDataDoenca.nome,
              resumo: formDataDoenca.resumo,
              protocoloNutricional: formDataDoenca.protocoloNutricional,
              referencia: formDataDoenca.referencia,
              linksUteis: linksArray
            }
          : d
      ));
      setEditingDoenca(null);
      toast({ title: "Doença atualizada com sucesso!" });
    } else {
      const novaDoenca: Doenca = {
        id: Date.now().toString(),
        nome: formDataDoenca.nome,
        resumo: formDataDoenca.resumo,
        protocoloNutricional: formDataDoenca.protocoloNutricional,
        referencia: formDataDoenca.referencia,
        linksUteis: linksArray,
        ativo: true,
        criadoEm: new Date().toISOString()
      };

      setDoencas(prev => [...prev, novaDoenca]);
      toast({ title: "Doença cadastrada com sucesso!" });
    }

    setFormDataDoenca({ nome: "", resumo: "", protocoloNutricional: "", referencia: "", linksUteis: "" });
    setShowNovaDoenca(false);
  };

  const handleSubmitAlergia = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formDataAlergia.nome || !formDataAlergia.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e descrição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingAlergia) {
      setAlergias(prev => prev.map(a => 
        a.id === editingAlergia.id 
          ? {
              ...a,
              nome: formDataAlergia.nome,
              descricao: formDataAlergia.descricao,
              severidade: formDataAlergia.severidade
            }
          : a
      ));
      setEditingAlergia(null);
      toast({ title: "Alergia atualizada com sucesso!" });
    } else {
      const novaAlergia: Alergia = {
        id: Date.now().toString(),
        nome: formDataAlergia.nome,
        descricao: formDataAlergia.descricao,
        severidade: formDataAlergia.severidade,
        ativo: true,
        criadoEm: new Date().toISOString()
      };

      setAlergias(prev => [...prev, novaAlergia]);
      toast({ title: "Alergia cadastrada com sucesso!" });
    }

    setFormDataAlergia({ nome: "", descricao: "", severidade: "leve" });
    setShowNovaAlergia(false);
  };

  const handleEditDoenca = (doenca: Doenca) => {
    setEditingDoenca(doenca);
    setFormDataDoenca({
      nome: doenca.nome,
      resumo: doenca.resumo,
      protocoloNutricional: doenca.protocoloNutricional,
      referencia: doenca.referencia,
      linksUteis: doenca.linksUteis.join('\n')
    });
    setShowNovaDoenca(true);
  };

  const handleEditAlergia = (alergia: Alergia) => {
    setEditingAlergia(alergia);
    setFormDataAlergia({
      nome: alergia.nome,
      descricao: alergia.descricao,
      severidade: alergia.severidade
    });
    setShowNovaAlergia(true);
  };

  const handleDeleteDoenca = (id: string) => {
    setDoencas(prev => prev.map(d => d.id === id ? { ...d, ativo: false } : d));
    toast({ title: "Doença removida com sucesso!" });
  };

  const handleDeleteAlergia = (id: string) => {
    setAlergias(prev => prev.map(a => a.id === id ? { ...a, ativo: false } : a));
    toast({ title: "Alergia removida com sucesso!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary" />
            Doenças e Alergias
          </h1>
          <p className="text-muted-foreground">Gerencie o catálogo de doenças e alergias</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Doenças */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Doenças</CardTitle>
              <CardDescription>Catálogo de doenças com protocolos nutricionais</CardDescription>
            </div>
            <Dialog open={showNovaDoenca} onOpenChange={setShowNovaDoenca}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Doença
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingDoenca ? "Editar" : "Nova"} Doença</DialogTitle>
                  <DialogDescription>
                    {editingDoenca ? "Edite" : "Cadastre"} uma doença no sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitDoenca} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome da Doença *</Label>
                    <Input
                      id="nome"
                      value={formDataDoenca.nome}
                      onChange={(e) => setFormDataDoenca(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Diabetes Mellitus Tipo 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resumo">Resumo *</Label>
                    <Textarea
                      id="resumo"
                      value={formDataDoenca.resumo}
                      onChange={(e) => setFormDataDoenca(prev => ({ ...prev, resumo: e.target.value }))}
                      placeholder="Breve descrição da doença"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protocolo">Protocolo Nutricional</Label>
                    <Textarea
                      id="protocolo"
                      value={formDataDoenca.protocoloNutricional}
                      onChange={(e) => setFormDataDoenca(prev => ({ ...prev, protocoloNutricional: e.target.value }))}
                      placeholder="Diretrizes nutricionais para a doença"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referencia">Referência</Label>
                    <Input
                      id="referencia"
                      value={formDataDoenca.referencia}
                      onChange={(e) => setFormDataDoenca(prev => ({ ...prev, referencia: e.target.value }))}
                      placeholder="Fonte ou referência bibliográfica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="links">Links Úteis</Label>
                    <Textarea
                      id="links"
                      value={formDataDoenca.linksUteis}
                      onChange={(e) => setFormDataDoenca(prev => ({ ...prev, linksUteis: e.target.value }))}
                      placeholder="Um link por linha"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">{editingDoenca ? "Atualizar" : "Cadastrar"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNovaDoenca(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Resumo</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Links</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoencas.map((doenca) => (
                <TableRow key={doenca.id}>
                  <TableCell className="font-medium">{doenca.nome}</TableCell>
                  <TableCell className="max-w-xs truncate">{doenca.resumo}</TableCell>
                  <TableCell className="max-w-xs truncate">{doenca.protocoloNutricional || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{doenca.referencia || "-"}</TableCell>
                  <TableCell>
                    {doenca.linksUteis.length > 0 ? (
                      <Badge variant="secondary">{doenca.linksUteis.length} links</Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditDoenca(doenca)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteDoenca(doenca.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alergias */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Alergias</CardTitle>
              <CardDescription>Catálogo de alergias e intolerâncias</CardDescription>
            </div>
            <Dialog open={showNovaAlergia} onOpenChange={setShowNovaAlergia}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Alergia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAlergia ? "Editar" : "Nova"} Alergia</DialogTitle>
                  <DialogDescription>
                    {editingAlergia ? "Edite" : "Cadastre"} uma alergia no sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitAlergia} className="space-y-4">
                  <div>
                    <Label htmlFor="nomeAlergia">Nome da Alergia *</Label>
                    <Input
                      id="nomeAlergia"
                      value={formDataAlergia.nome}
                      onChange={(e) => setFormDataAlergia(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Alergia a Lactose"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descricaoAlergia">Descrição *</Label>
                    <Textarea
                      id="descricaoAlergia"
                      value={formDataAlergia.descricao}
                      onChange={(e) => setFormDataAlergia(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição da alergia"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="severidade">Severidade</Label>
                    <select
                      id="severidade"
                      value={formDataAlergia.severidade}
                      onChange={(e) => setFormDataAlergia(prev => ({ ...prev, severidade: e.target.value as 'leve' | 'moderada' | 'grave' }))}
                      className="w-full p-2 border border-input rounded-md"
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="grave">Grave</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit">{editingAlergia ? "Atualizar" : "Cadastrar"}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowNovaAlergia(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlergias.map((alergia) => (
                <TableRow key={alergia.id}>
                  <TableCell className="font-medium">{alergia.nome}</TableCell>
                  <TableCell className="max-w-xs truncate">{alergia.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={
                      alergia.severidade === 'grave' ? 'destructive' :
                      alergia.severidade === 'moderada' ? 'default' : 'secondary'
                    }>
                      {alergia.severidade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditAlergia(alergia)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAlergia(alergia.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
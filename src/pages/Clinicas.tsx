import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDataSource } from "@/lib/apiMigration";
import { ClinicaService } from "@/services/clinicaService";
import { Building2, Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { Clinica } from "@/types";

export function Clinicas() {
  //const { data: clinicas, setData: setClinicas } = useDataSource<Clinica[]>('nutriapp-clinicas', []);
  //const clinicas = ClinicaService.getClinicas(); // Placeholder to avoid error, replace with actual data fetching logic
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinica, setEditingClinica] = useState<Clinica | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch clinicas from API or localStorage 
    async function fetchClinicas() {
      try {
        const response = await ClinicaService.getClinicas();
        setClinicas(response.data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as clínicas",
          variant: "destructive"
        });
      }
    }
    fetchClinicas();
  }, []);

  const [formData, setFormData] = useState<Omit<Clinica, 'id' | 'criadoEm'>>({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    responsavel: '',
    observacoes: '',
    ativo: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da clínica é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingClinica) {
        // Atualizar clínica existente
        /*const updatedClinicas = clinicas.map(c => 
          c.id === editingClinica.id 
            ? { ...c, ...formData }
            : c
        );
        setClinicas(updatedClinicas);*/
        await ClinicaService.updateClinica(editingClinica.id, formData); // Call API to update;
        toast({
          title: "Sucesso",
          description: "Clínica atualizada com sucesso"
        });
      } else {
        // Criar nova clínica
        const novaClinica: Clinica = {
          id: crypto.randomUUID(),
          ...formData,
          criadoEm: new Date().toISOString()
        };
        //setClinicas([...clinicas, novaClinica]);
        await ClinicaService.createClinica(novaClinica); // Call API to create
        toast({
          title: "Sucesso",
          description: "Clínica cadastrada com sucesso"
        });
      }

      // Reset form
      setFormData({
        nome: '',
        cnpj: '',
        endereco: '',
        telefone: '',
        email: '',
        responsavel: '',
        observacoes: '',
        ativo: true
      });
      setEditingClinica(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar clínica",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (clinica: Clinica) => {
    setEditingClinica(clinica);
    setFormData({
      nome: clinica.nome,
      cnpj: clinica.cnpj,
      endereco: clinica.endereco,
      telefone: clinica.telefone,
      email: clinica.email,
      responsavel: clinica.responsavel,
      observacoes: clinica.observacoes,
      ativo: clinica.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta clínica?")) {
      try {
        //const updatedClinicas = clinicas.filter(c => c.id !== id);
        //setClinicas(updatedClinicas);
        await ClinicaService.deleteClinica(id); // Call API to delete
        toast({
          title: "Sucesso",
          description: "Clínica excluída com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a clínica",
          variant: "destructive"
        });
        return;
      }

    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClinica(null);
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      email: '',
      responsavel: '',
      observacoes: '',
      ativo: true
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Clínicas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as clínicas do sistema
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Clínica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClinica ? 'Editar Clínica' : 'Nova Clínica'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Clínica *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome da clínica"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereço completo da clínica"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@clinica.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ativo">Clínica ativa</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingClinica ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clínicas Cadastradas</CardTitle>
          <CardDescription>
            {clinicas.length} clínica{clinicas.length !== 1 ? 's' : ''} cadastrada{clinicas.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinicas.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma clínica cadastrada</p>
              <p className="text-sm text-muted-foreground">
                Clique em "Nova Clínica" para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicas.map((clinica) => (
                  <TableRow key={clinica.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{clinica.nome}</div>
                        {clinica.endereco && (
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {clinica.endereco}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{clinica.cnpj || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {clinica.telefone && (
                          <div className="text-sm flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {clinica.telefone}
                          </div>
                        )}
                        {clinica.email && (
                          <div className="text-sm flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {clinica.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{clinica.responsavel || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={clinica.ativo ? "default" : "secondary"}>
                        {clinica.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(clinica)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(clinica.id)}
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
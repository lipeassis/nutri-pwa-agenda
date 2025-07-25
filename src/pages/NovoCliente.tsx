import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Cliente, Doenca, Alergia } from "@/types";
import { ArrowLeft, Save, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function NovoCliente() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [doencas] = useLocalStorage<Doenca[]>('nutriapp-doencas', []);
  const [alergias] = useLocalStorage<Alergia[]>('nutriapp-alergias', []);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    peso: "",
    altura: "",
    objetivos: "",
    observacoes: ""
  });

  const [selectedDoencas, setSelectedDoencas] = useState<string[]>([]);
  const [selectedAlergias, setSelectedAlergias] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.telefone || !formData.peso || !formData.altura) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novoCliente: Cliente = {
      id: Date.now().toString(),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      dataNascimento: formData.dataNascimento,
      peso: parseFloat(formData.peso),
      altura: parseFloat(formData.altura),
      objetivos: formData.objetivos,
      observacoes: formData.observacoes,
      doencasIds: selectedDoencas,
      alergiasIds: selectedAlergias,
      criadoEm: new Date().toISOString()
    };

    setClientes(prev => [...prev, novoCliente]);
    
    toast({
      title: "Cliente cadastrado!",
      description: `${formData.nome} foi cadastrado com sucesso.`,
    });

    navigate("/clientes");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/clientes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Novo Cliente</h1>
          <p className="text-muted-foreground">
            Cadastre um novo cliente em sua base
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informações do Cliente
            </CardTitle>
            <CardDescription>
              Preencha as informações básicas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Pessoais */}
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Dados Físicos */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Dados Físicos</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={handleInputChange}
                    placeholder="70.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm) *</Label>
                  <Input
                    id="altura"
                    name="altura"
                    type="number"
                    value={formData.altura}
                    onChange={handleInputChange}
                    placeholder="170"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Doenças e Alergias */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Doenças e Alergias</h3>
              
              {doencas.filter(d => d.ativo).length > 0 && (
                <div className="space-y-3">
                  <Label>Doenças</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-md p-3">
                    {doencas.filter(d => d.ativo).map((doenca) => (
                      <div key={doenca.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`doenca-${doenca.id}`}
                          checked={selectedDoencas.includes(doenca.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDoencas(prev => [...prev, doenca.id]);
                            } else {
                              setSelectedDoencas(prev => prev.filter(id => id !== doenca.id));
                            }
                          }}
                        />
                        <Label htmlFor={`doenca-${doenca.id}`} className="text-sm">
                          {doenca.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {alergias.filter(a => a.ativo).length > 0 && (
                <div className="space-y-3">
                  <Label>Alergias</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-md p-3">
                    {alergias.filter(a => a.ativo).map((alergia) => (
                      <div key={alergia.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`alergia-${alergia.id}`}
                          checked={selectedAlergias.includes(alergia.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAlergias(prev => [...prev, alergia.id]);
                            } else {
                              setSelectedAlergias(prev => prev.filter(id => id !== alergia.id));
                            }
                          }}
                        />
                        <Label htmlFor={`alergia-${alergia.id}`} className="text-sm">
                          {alergia.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Objetivos e Observações */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Objetivos e Observações</h3>
              
              <div className="space-y-2">
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea
                  id="objetivos"
                  name="objetivos"
                  value={formData.objetivos}
                  onChange={handleInputChange}
                  placeholder="Descreva os objetivos do cliente (ex: perda de peso, ganho de massa muscular, etc.)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Restrições alimentares, medicamentos, etc."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Cadastrar Cliente
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/clientes">Cancelar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
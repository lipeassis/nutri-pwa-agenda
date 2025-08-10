import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Familia, Cliente, ClienteFamilia, PlanejamentoAlimentar } from "@/types";
import { Search, Plus, Users, UserPlus, Copy, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function Familias() {
  const [familias, setFamilias] = useLocalStorage<Familia[]>('nutriapp-familias', []);
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [clienteFamilias, setClienteFamilias] = useLocalStorage<ClienteFamilia[]>('nutriapp-cliente-familias', []);
  const [planosAlimentares] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  const [busca, setBusca] = useState("");
  
  // Estados dos modais
  const [showNovaFamilia, setShowNovaFamilia] = useState(false);
  const [showAdicionarMembro, setShowAdicionarMembro] = useState(false);
  const [showCopiarPlano, setShowCopiarPlano] = useState(false);
  const [familiaSelecionada, setFamiliaSelecionada] = useState<Familia | null>(null);

  // Estados dos formulários
  const [novaFamilia, setNovaFamilia] = useState({
    nome: '',
    descricao: '',
    corTag: '#3b82f6'
  });
  const [novoMembro, setNovoMembro] = useState({
    clienteId: '',
    parentesco: ''
  });
  const [copiaPlano, setCopiaPlano] = useState({
    clienteOrigemId: '',
    clienteDestinoId: '',
    observacoes: ''
  });

  const familiasFiltradas = familias.filter(familia =>
    familia.ativo && familia.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const getMembros = (familiaId: string) => {
    const membros = clienteFamilias.filter(cf => cf.familiaId === familiaId && cf.ativo);
    return membros.map(cf => {
      const cliente = clientes.find(c => c.id === cf.clienteId);
      return { ...cf, cliente };
    }).filter(m => m.cliente);
  };

  const getClientesDisponiveis = () => {
    if (!familiaSelecionada) return [];
    const membroIds = getMembros(familiaSelecionada.id).map(m => m.clienteId);
    return clientes.filter(c => !membroIds.includes(c.id));
  };

  const getPlanosCliente = (clienteId: string) => {
    return planosAlimentares.filter(p => p.clienteId === clienteId && p.ativo);
  };

  const criarFamilia = () => {
    if (!novaFamilia.nome.trim()) {
      toast.error("Nome da família é obrigatório");
      return;
    }

    const familia: Familia = {
      id: Date.now().toString(),
      nome: novaFamilia.nome,
      descricao: novaFamilia.descricao,
      corTag: novaFamilia.corTag,
      ativo: true,
      criadoEm: new Date().toISOString(),
      criadoPor: 'usuario-atual'
    };

    setFamilias([...familias, familia]);
    setNovaFamilia({ nome: '', descricao: '', corTag: '#3b82f6' });
    setShowNovaFamilia(false);
    toast.success("Família criada com sucesso!");
  };

  const adicionarMembro = () => {
    if (!novoMembro.clienteId || !familiaSelecionada) {
      toast.error("Selecione um cliente");
      return;
    }

    const clienteFamilia: ClienteFamilia = {
      id: Date.now().toString(),
      clienteId: novoMembro.clienteId,
      familiaId: familiaSelecionada.id,
      parentesco: novoMembro.parentesco,
      ativo: true,
      criadoEm: new Date().toISOString()
    };

    setClienteFamilias([...clienteFamilias, clienteFamilia]);
    setNovoMembro({ clienteId: '', parentesco: '' });
    setShowAdicionarMembro(false);
    toast.success("Membro adicionado à família!");
  };

  const removerMembro = (clienteFamiliaId: string) => {
    setClienteFamilias(clienteFamilias.map(cf => 
      cf.id === clienteFamiliaId ? { ...cf, ativo: false } : cf
    ));
    toast.success("Membro removido da família");
  };

  const copiarPlanoAlimentar = () => {
    if (!copiaPlano.clienteOrigemId || !copiaPlano.clienteDestinoId || !familiaSelecionada) {
      toast.error("Selecione cliente origem e destino");
      return;
    }

    const planosOrigem = getPlanosCliente(copiaPlano.clienteOrigemId);
    if (planosOrigem.length === 0) {
      toast.error("Cliente origem não possui planos alimentares");
      return;
    }

    const planoOriginal = planosOrigem[0]; // Pega o primeiro plano ativo
    const clienteDestino = clientes.find(c => c.id === copiaPlano.clienteDestinoId);

    const novoPlano: PlanejamentoAlimentar = {
      ...planoOriginal,
      id: Date.now().toString(),
      clienteId: copiaPlano.clienteDestinoId,
      nome: `${planoOriginal.nome} - Cópia para ${clienteDestino?.nome}`,
      dataInicio: new Date().toISOString(),
      dataFim: undefined,
      criadoEm: new Date().toISOString(),
      criadoPor: 'usuario-atual'
    };

    const planosAtualizados = [...planosAlimentares, novoPlano];
    localStorage.setItem('nutriapp-planejamentos', JSON.stringify(planosAtualizados));

    setCopiaPlano({ clienteOrigemId: '', clienteDestinoId: '', observacoes: '' });
    setShowCopiarPlano(false);
    toast.success("Plano alimentar copiado com sucesso!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Famílias</h1>
          <p className="text-muted-foreground">
            Gerencie famílias e copie planos alimentares entre membros
          </p>
        </div>
        <Button onClick={() => setShowNovaFamilia(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Família
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar famílias..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Famílias List */}
      {familiasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {familias.length === 0 ? "Nenhuma família cadastrada" : "Nenhuma família encontrada"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {familias.length === 0 
                ? "Comece criando sua primeira família"
                : "Tente ajustar os termos da busca"
              }
            </p>
            {familias.length === 0 && (
              <Button onClick={() => setShowNovaFamilia(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Família
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {familiasFiltradas.map((familia) => {
            const membros = getMembros(familia.id);
            
            return (
              <Card key={familia.id} className="hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: familia.corTag }}
                        />
                        {familia.nome}
                      </CardTitle>
                      <CardDescription>{familia.descricao}</CardDescription>
                    </div>
                    <Badge variant="secondary">{membros.length} membros</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Membros da família */}
                  <div>
                    <h4 className="font-medium mb-3">Membros da família</h4>
                    {membros.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum membro adicionado</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {membros.map((membro) => (
                          <div key={membro.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{membro.cliente?.nome}</p>
                              {membro.parentesco && (
                                <p className="text-sm text-muted-foreground">{membro.parentesco}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removerMembro(membro.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFamiliaSelecionada(familia);
                        setShowAdicionarMembro(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Adicionar Membro
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setFamiliaSelecionada(familia);
                        setShowCopiarPlano(true);
                      }}
                      disabled={membros.length < 2}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar Plano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Nova Família */}
      <Dialog open={showNovaFamilia} onOpenChange={setShowNovaFamilia}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Família</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome da Família</Label>
              <Input
                id="nome"
                value={novaFamilia.nome}
                onChange={(e) => setNovaFamilia({...novaFamilia, nome: e.target.value})}
                placeholder="Ex: Família Silva"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={novaFamilia.descricao}
                onChange={(e) => setNovaFamilia({...novaFamilia, descricao: e.target.value})}
                placeholder="Descrição da família..."
              />
            </div>
            <div>
              <Label htmlFor="cor">Cor da Tag</Label>
              <Input
                id="cor"
                type="color"
                value={novaFamilia.corTag}
                onChange={(e) => setNovaFamilia({...novaFamilia, corTag: e.target.value})}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={criarFamilia} className="flex-1">Criar Família</Button>
              <Button variant="outline" onClick={() => setShowNovaFamilia(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Membro */}
      <Dialog open={showAdicionarMembro} onOpenChange={setShowAdicionarMembro}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro à {familiaSelecionada?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={novoMembro.clienteId} onValueChange={(value) => setNovoMembro({...novoMembro, clienteId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {getClientesDisponiveis().map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parentesco">Parentesco (opcional)</Label>
              <Input
                id="parentesco"
                value={novoMembro.parentesco}
                onChange={(e) => setNovoMembro({...novoMembro, parentesco: e.target.value})}
                placeholder="Ex: Pai, Mãe, Filho..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={adicionarMembro} className="flex-1">Adicionar</Button>
              <Button variant="outline" onClick={() => setShowAdicionarMembro(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Copiar Plano */}
      <Dialog open={showCopiarPlano} onOpenChange={setShowCopiarPlano}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copiar Plano Alimentar - {familiaSelecionada?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="origem">Cliente Origem</Label>
              <Select value={copiaPlano.clienteOrigemId} onValueChange={(value) => setCopiaPlano({...copiaPlano, clienteOrigemId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione cliente origem" />
                </SelectTrigger>
                <SelectContent>
                  {getMembros(familiaSelecionada?.id || '').map((membro) => {
                    const planosCount = getPlanosCliente(membro.clienteId).length;
                    return (
                      <SelectItem key={membro.clienteId} value={membro.clienteId} disabled={planosCount === 0}>
                        {membro.cliente?.nome} ({planosCount} planos)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destino">Cliente Destino</Label>
              <Select value={copiaPlano.clienteDestinoId} onValueChange={(value) => setCopiaPlano({...copiaPlano, clienteDestinoId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione cliente destino" />
                </SelectTrigger>
                <SelectContent>
                  {getMembros(familiaSelecionada?.id || '').filter(m => m.clienteId !== copiaPlano.clienteOrigemId).map((membro) => (
                    <SelectItem key={membro.clienteId} value={membro.clienteId}>
                      {membro.cliente?.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={copiaPlano.observacoes}
                onChange={(e) => setCopiaPlano({...copiaPlano, observacoes: e.target.value})}
                placeholder="Observações sobre a cópia..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={copiarPlanoAlimentar} className="flex-1">Copiar Plano</Button>
              <Button variant="outline" onClick={() => setShowCopiarPlano(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
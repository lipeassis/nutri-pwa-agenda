import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Familia, Cliente, ClienteFamilia, PlanejamentoAlimentar } from "@/types";
import { Plus, Users, UserPlus, Copy, Trash2, UserMinus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface GerenciamentoFamiliaProps {
  cliente: Cliente;
}

export function GerenciamentoFamilia({ cliente }: GerenciamentoFamiliaProps) {
  const [familias, setFamilias] = useLocalStorage<Familia[]>('nutriapp-familias', []);
  const [clientes] = useLocalStorage<Cliente[]>('nutriapp-clientes', []);
  const [clienteFamilias, setClienteFamilias] = useLocalStorage<ClienteFamilia[]>('nutriapp-cliente-familias', []);
  const [planosAlimentares] = useLocalStorage<PlanejamentoAlimentar[]>('nutriapp-planejamentos', []);
  
  // Estados dos modais
  const [showNovaFamilia, setShowNovaFamilia] = useState(false);
  const [showAdicionarMembro, setShowAdicionarMembro] = useState(false);
  const [showCopiarPlano, setShowCopiarPlano] = useState(false);
  const [familiaSelecionada, setFamiliaSelecionada] = useState<Familia | null>(null);

  // Estados dos formulários
  const [novaFamilia, setNovaFamilia] = useState({
    nome: '',
    descricao: '',
    corTag: '#3b82f6',
    membrosIds: [cliente.id] // Já inclui o cliente atual por padrão
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

  // Buscar famílias do cliente atual
  const familiasDoCliente = clienteFamilias
    .filter(cf => cf.clienteId === cliente.id && cf.ativo)
    .map(cf => {
      const familia = familias.find(f => f.id === cf.familiaId && f.ativo);
      return familia ? { ...cf, familia } : null;
    })
    .filter(Boolean);

  const getMembros = (familiaId: string) => {
    const membros = clienteFamilias.filter(cf => cf.familiaId === familiaId && cf.ativo);
    return membros.map(cf => {
      const clienteMembro = clientes.find(c => c.id === cf.clienteId);
      return { ...cf, cliente: clienteMembro };
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

  const getClientesDisponiveisParaFamilia = () => {
    return clientes.filter(c => !novaFamilia.membrosIds.includes(c.id));
  };

  const handleToggleMembro = (clienteId: string, checked: boolean) => {
    if (checked) {
      setNovaFamilia(prev => ({
        ...prev,
        membrosIds: [...prev.membrosIds, clienteId]
      }));
    } else {
      // Não permite remover o cliente atual
      if (clienteId === cliente.id) {
        toast.error("Não é possível remover o cliente atual da família");
        return;
      }
      setNovaFamilia(prev => ({
        ...prev,
        membrosIds: prev.membrosIds.filter(id => id !== clienteId)
      }));
    }
  };

  const criarFamilia = () => {
    if (!novaFamilia.nome.trim()) {
      toast.error("Nome da família é obrigatório");
      return;
    }

    if (novaFamilia.membrosIds.length === 0) {
      toast.error("Selecione pelo menos um membro para a família");
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

    // Adicionar todos os membros selecionados à família
    const novasVinculacoes = novaFamilia.membrosIds.map((clienteId, index) => ({
      id: (Date.now() + index).toString(),
      clienteId,
      familiaId: familia.id,
      parentesco: '', // Pode ser editado depois
      ativo: true,
      criadoEm: new Date().toISOString()
    }));

    setClienteFamilias([...clienteFamilias, ...novasVinculacoes]);
    
    setNovaFamilia({ 
      nome: '', 
      descricao: '', 
      corTag: '#3b82f6',
      membrosIds: [cliente.id] 
    });
    setShowNovaFamilia(false);
    toast.success(`Família criada com ${novaFamilia.membrosIds.length} membros!`);
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

  const sairDaFamilia = (familiaId: string) => {
    setClienteFamilias(clienteFamilias.map(cf => 
      cf.clienteId === cliente.id && cf.familiaId === familiaId ? { ...cf, ativo: false } : cf
    ));
    toast.success("Cliente removido da família");
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

    const planoOriginal = planosOrigem[0];
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Famílias
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as famílias deste cliente e copie planos entre membros
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNovaFamilia(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Família
        </Button>
      </div>

      {familiasDoCliente.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium mb-2">Nenhuma família</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Este cliente ainda não pertence a nenhuma família
            </p>
            <Button size="sm" onClick={() => setShowNovaFamilia(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Família
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {familiasDoCliente.map((item: any) => {
            const membros = getMembros(item.familia.id);
            
            return (
              <Card key={item.id} className="hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.familia.corTag }}
                        />
                        {item.familia.nome}
                      </CardTitle>
                      <CardDescription>{item.familia.descricao}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{membros.length} membros</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => sairDaFamilia(item.familia.id)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2 text-sm">Membros da família</h5>
                    {membros.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum membro</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {membros.map((membro) => (
                          <div key={membro.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <div>
                              <p className="text-sm font-medium">{membro.cliente?.nome}</p>
                              {membro.parentesco && (
                                <p className="text-xs text-muted-foreground">{membro.parentesco}</p>
                              )}
                            </div>
                            {membro.clienteId !== cliente.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removerMembro(membro.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFamiliaSelecionada(item.familia);
                        setShowAdicionarMembro(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Adicionar Membro
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setFamiliaSelecionada(item.familia);
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
            <div>
              <Label>Membros da Família</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione os clientes que farão parte desta família:
                </p>
                <div className="space-y-2">
                  {clientes.map((clienteOp) => (
                    <div key={clienteOp.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`membro-${clienteOp.id}`}
                        checked={novaFamilia.membrosIds.includes(clienteOp.id)}
                        onCheckedChange={(checked) => 
                          handleToggleMembro(clienteOp.id, checked as boolean)
                        }
                        disabled={clienteOp.id === cliente.id} // Cliente atual sempre selecionado
                      />
                      <Label 
                        htmlFor={`membro-${clienteOp.id}`} 
                        className={`text-sm flex-1 ${clienteOp.id === cliente.id ? 'font-medium' : ''}`}
                      >
                        {clienteOp.nome}
                        {clienteOp.id === cliente.id && (
                          <span className="text-primary text-xs ml-2">(Cliente atual)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {novaFamilia.membrosIds.length} membro(s) selecionado(s)
                  </p>
                </div>
              </div>
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
                  {getClientesDisponiveis().map((clienteOp) => (
                    <SelectItem key={clienteOp.id} value={clienteOp.id}>
                      {clienteOp.nome}
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
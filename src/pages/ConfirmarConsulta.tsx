import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Agendamento } from "@/types";
import { Calendar, Clock, User, MapPin, Phone, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export function ConfirmarConsulta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useLocalStorage<Agendamento[]>('nutriapp-agendamentos', []);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  const agendamentoId = searchParams.get('id');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!agendamentoId || !token) {
      setLoading(false);
      return;
    }

    // Buscar o agendamento pelo ID
    const agendamentoEncontrado = agendamentos.find(ag => ag.id === agendamentoId);
    
    if (agendamentoEncontrado) {
      setAgendamento(agendamentoEncontrado);
    }
    
    setLoading(false);
  }, [agendamentoId, token, agendamentos]);

  const handleConfirmar = async () => {
    if (!agendamento) return;

    setProcessando(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você faria a chamada para a API para confirmar
      // Por enquanto, vamos apenas atualizar o localStorage
      const agendamentosAtualizados = agendamentos.map(ag => 
        ag.id === agendamento.id 
          ? { ...ag, status: 'agendado' as const, observacoes: `${ag.observacoes || ''} - Confirmado pelo cliente`.trim() }
          : ag
      );
      
      setAgendamentos(agendamentosAtualizados);
      
      toast({
        title: "Consulta confirmada!",
        description: "Sua consulta foi confirmada com sucesso. Você receberá um lembrete 1 dia antes.",
      });

      // Redirecionar para uma página de sucesso
      setTimeout(() => {
        navigate('/confirmacao-sucesso?tipo=confirmada');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível confirmar sua consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleCancelar = async () => {
    if (!agendamento) return;

    setProcessando(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você faria a chamada para a API para cancelar
      const agendamentosAtualizados = agendamentos.map(ag => 
        ag.id === agendamento.id 
          ? { ...ag, status: 'cancelado' as const, observacoes: `${ag.observacoes || ''} - Cancelado pelo cliente`.trim() }
          : ag
      );
      
      setAgendamentos(agendamentosAtualizados);
      
      toast({
        title: "Consulta cancelada",
        description: "Sua consulta foi cancelada. Entre em contato conosco para reagendar.",
      });

      // Redirecionar para uma página de sucesso
      setTimeout(() => {
        navigate('/confirmacao-sucesso?tipo=cancelada');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar sua consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  const formatarDataHora = (data: string, hora: string) => {
    const dataObj = new Date(`${data}T${hora}`);
    return {
      data: format(dataObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      hora: format(dataObj, "HH:mm", { locale: ptBR })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground mt-4">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agendamentoId || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Link inválido</CardTitle>
            <CardDescription>
              O link de confirmação não é válido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Entre em contato conosco se precisar confirmar ou cancelar sua consulta.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warning/5 to-warning/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
            <CardTitle className="text-warning">Consulta não encontrada</CardTitle>
            <CardDescription>
              Não foi possível encontrar a consulta solicitada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Verifique se o link está correto ou entre em contato conosco.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agendamento.status === 'cancelado') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Consulta cancelada</CardTitle>
            <CardDescription>
              Esta consulta já foi cancelada anteriormente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (agendamento.status === 'realizado') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
            <CardTitle className="text-success">Consulta realizada</CardTitle>
            <CardDescription>
              Esta consulta já foi realizada.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: dataFormatada, hora: horaFormatada } = formatarDataHora(agendamento.data, agendamento.hora);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Confirme sua consulta</CardTitle>
          <CardDescription>
            Confirme os detalhes da sua consulta agendada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações da consulta */}
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{agendamento.clienteNome}</p>
                <p className="text-sm text-muted-foreground">Paciente</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold capitalize">{dataFormatada}</p>
                <p className="text-sm text-muted-foreground">Data da consulta</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{horaFormatada}</p>
                <p className="text-sm text-muted-foreground">Horário</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{agendamento.servicosNomes.join(', ')}</p>
                <p className="text-sm text-muted-foreground">Tipo de consulta</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{agendamento.profissionalNome}</p>
                <p className="text-sm text-muted-foreground">Profissional</p>
              </div>
            </div>

            {agendamento.convenioNome && (
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{agendamento.convenioNome}</Badge>
              </div>
            )}

            {agendamento.observacoes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-1">Observações:</p>
                  <p className="text-sm text-muted-foreground">{agendamento.observacoes}</p>
                </div>
              </>
            )}
          </div>

          {/* Informações importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Informações importantes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Chegue com 15 minutos de antecedência</li>
              <li>• Traga um documento com foto</li>
              <li>• Em caso de cancelamento, avise com pelo menos 24h de antecedência</li>
              <li>• Para reagendamento, entre em contato conosco</li>
            </ul>
          </div>

          {/* Contato */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Precisa de ajuda?
            </h4>
            <p className="text-sm text-green-800">
              WhatsApp: (11) 99999-9999 | Email: contato@clinica.com.br
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button 
              onClick={handleConfirmar}
              className="flex-1"
              disabled={processando}
            >
              {processando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar consulta
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCancelar}
              className="flex-1"
              disabled={processando}
            >
              {processando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar consulta
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
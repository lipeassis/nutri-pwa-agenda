import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Phone, MessageCircle } from "lucide-react";

export function ConfirmacaoSucesso() {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo'); // 'confirmada' ou 'cancelada'

  const isConfirmada = tipo === 'confirmada';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isConfirmada ? 'from-success/5 to-success/10' : 'from-orange-50 to-orange-100'} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isConfirmada ? (
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          )}
          
          <CardTitle className={`text-2xl ${isConfirmada ? 'text-success' : 'text-orange-600'}`}>
            {isConfirmada ? 'Consulta confirmada!' : 'Consulta cancelada'}
          </CardTitle>
          
          <CardDescription className="text-base">
            {isConfirmada 
              ? 'Sua consulta foi confirmada com sucesso. Você receberá um lembrete 1 dia antes do agendamento.'
              : 'Sua consulta foi cancelada. Se precisar reagendar, entre em contato conosco.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isConfirmada ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Próximos passos:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Você receberá um lembrete via WhatsApp</li>
                <li>• Chegue com 15 minutos de antecedência</li>
                <li>• Traga um documento com foto</li>
                <li>• Prepare suas dúvidas para a consulta</li>
              </ul>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Precisa reagendar?</h4>
              <p className="text-sm text-orange-800">
                Entre em contato conosco pelos canais abaixo para agendar uma nova consulta.
              </p>
            </div>
          )}

          {/* Informações de contato */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp: (11) 99999-9999
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('tel:+5511999999999', '_blank')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Telefone: (11) 99999-9999
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Este link de confirmação não pode mais ser usado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
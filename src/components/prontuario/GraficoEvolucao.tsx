import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultaProntuario, ObjetivosCliente } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GraficoEvolucaoProps {
  consultas: ConsultaProntuario[];
  objetivos?: ObjetivosCliente;
}

export function GraficoEvolucao({ consultas, objetivos }: GraficoEvolucaoProps) {
  // Ordenar consultas por data (mais antigas primeiro)
  const consultasOrdenadas = [...consultas].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  // Preparar dados para o gráfico
  const dadosGrafico = consultasOrdenadas.map((consulta) => ({
    data: format(new Date(consulta.data), "dd/MM", { locale: ptBR }),
    dataCompleta: consulta.data,
    peso: consulta.medidas.peso,
    percentualGordura: consulta.medidas.percentualGordura,
    massaMuscular: consulta.medidas.massaMuscular,
    circunferenciaAbdomen: consulta.medidas.circunferenciaAbdomen,
    circunferenciaQuadril: consulta.medidas.circunferenciaQuadril,
    imc: (consulta.medidas.peso / Math.pow(consulta.medidas.altura / 100, 2)).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* Gráfico de Peso */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Peso</CardTitle>
          <CardDescription>Acompanhe a evolução do peso ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="data" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="peso" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Peso (kg)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              {objetivos && objetivos.pesoMeta && (
                <ReferenceLine 
                  y={objetivos.pesoMeta} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="5 5"
                  label={`Meta: ${objetivos.pesoMeta}kg`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Composição Corporal */}
      <Card>
        <CardHeader>
          <CardTitle>Composição Corporal</CardTitle>
          <CardDescription>Percentual de gordura e massa muscular</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="data" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="percentualGordura" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="% Gordura"
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="massaMuscular" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Massa Muscular (kg)"
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Medidas */}
      <Card>
        <CardHeader>
          <CardTitle>Medidas Corporais</CardTitle>
          <CardDescription>Circunferências abdômen e quadril</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="data" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="circunferenciaAbdomen" 
                stroke="hsl(var(--info))" 
                strokeWidth={2}
                name="C. Abdômen (cm)"
                dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="circunferenciaQuadril" 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                name="C. Quadril (cm)"
                dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico IMC */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do IMC</CardTitle>
          <CardDescription>Índice de Massa Corporal ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="data" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                domain={[15, 35]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="imc" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="IMC"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              {/* Linhas de referência IMC */}
              <ReferenceLine y={18.5} stroke="#94a3b8" strokeDasharray="2 2" />
              <ReferenceLine y={25} stroke="#94a3b8" strokeDasharray="2 2" />
              <ReferenceLine y={30} stroke="#94a3b8" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { NovoCliente } from "./pages/NovoCliente";
import { Agenda } from "./pages/Agenda";
import { NovoAgendamento } from "./pages/NovoAgendamento";
import { Prontuario } from "./pages/Prontuario";
import { Login } from "./pages/Login";
import { Usuarios } from "./pages/Usuarios";
import { TiposProfissionais } from "./pages/TiposProfissionais";
import { Doencas } from "./pages/Doencas";
import { Convenios } from "./pages/Convenios";
import { Servicos } from "./pages/Servicos";
import ExamesBioquimicos from "./pages/ExamesBioquimicos";
import FinanceiroRelatorios from "./pages/FinanceiroRelatorios";
import CadastroAlimentos from "./pages/CadastroAlimentos";
import { EditarPerfil } from "./pages/EditarPerfil";
import { TrocarSenha } from "./pages/TrocarSenha";
import { Programas } from "./pages/Programas";
import { FormulasMagistrais } from "./pages/FormulasMagistrais";
import { LocaisAtendimento } from "./pages/LocaisAtendimento";
import { ConfirmarConsulta } from "./pages/ConfirmarConsulta";
import { ConfirmacaoSucesso } from "./pages/ConfirmacaoSucesso";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Rotas públicas para confirmação de consultas */}
            <Route path="/confirmar-consulta" element={<ConfirmarConsulta />} />
            <Route path="/confirmacao-sucesso" element={<ConfirmacaoSucesso />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes" element={
                    <ProtectedRoute>
                      <Clientes />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/novo" element={
                    <ProtectedRoute>
                      <NovoCliente />
                    </ProtectedRoute>
                  } />
                  <Route path="/clientes/:clienteId" element={
                    <ProtectedRoute requiredRole={['profissional', 'administrador']}>
                      <Prontuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/agenda" element={
                    <ProtectedRoute>
                      <Agenda />
                    </ProtectedRoute>
                  } />
                  <Route path="/agenda/novo" element={
                    <ProtectedRoute>
                      <NovoAgendamento />
                    </ProtectedRoute>
                  } />
                  <Route path="/usuarios" element={
                    <ProtectedRoute requiredRole="administrador">
                      <Usuarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/tipos-profissionais" element={
                    <ProtectedRoute requiredRole="administrador">
                      <TiposProfissionais />
                    </ProtectedRoute>
                  } />
                  <Route path="/doencas" element={
                    <ProtectedRoute requiredRole="administrador">
                      <Doencas />
                    </ProtectedRoute>
                  } />
                  <Route path="/convenios" element={
                    <ProtectedRoute requiredRole="administrador">
                      <Convenios />
                    </ProtectedRoute>
                  } />
                   <Route path="/servicos" element={
                     <ProtectedRoute requiredRole="administrador">
                       <Servicos />
                     </ProtectedRoute>
                   } />
                   <Route path="/locais-atendimento" element={
                     <ProtectedRoute requiredRole="administrador">
                       <LocaisAtendimento />
                     </ProtectedRoute>
                   } />
                   <Route path="/exames-bioquimicos" element={
                    <ProtectedRoute requiredRole="administrador">
                      <ExamesBioquimicos />
                    </ProtectedRoute>
                  } />
                  <Route path="/financeiro" element={
                    <ProtectedRoute requiredRole={['administrador', 'profissional']}>
                      <FinanceiroRelatorios />
                    </ProtectedRoute>
                  } />
                  <Route path="/alimentos" element={
                    <ProtectedRoute requiredRole="administrador">
                      <CadastroAlimentos />
                    </ProtectedRoute>
                   } />
                   <Route path="/programas" element={
                     <ProtectedRoute requiredRole="administrador">
                       <Programas />
                     </ProtectedRoute>
                   } />
                   <Route path="/formulas-magistrais" element={
                     <ProtectedRoute requiredRole={['administrador', 'profissional']}>
                       <FormulasMagistrais />
                     </ProtectedRoute>
                   } />
                   <Route path="/perfil" element={
                    <ProtectedRoute>
                      <EditarPerfil />
                    </ProtectedRoute>
                  } />
                  <Route path="/trocar-senha" element={
                    <ProtectedRoute>
                      <TrocarSenha />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

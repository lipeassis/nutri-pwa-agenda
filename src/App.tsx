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

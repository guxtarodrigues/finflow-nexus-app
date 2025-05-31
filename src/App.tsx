import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Movimentacoes from "./pages/Movimentacoes";
import Pagamentos from "./pages/Pagamentos";
import Categorias from "./pages/Categorias";
import Clientes from "./pages/Clientes";
import Investimentos from "./pages/Investimentos";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import DRE from "./pages/DRE";
import Produtos from "@/pages/Produtos";

// New page imports
import Analises from "./pages/Analises";
import Relatorios from "./pages/Relatorios";
import Previsoes from "./pages/Previsoes";
import Metas from "./pages/Metas";
import Alertas from "./pages/Alertas";
import Configuracoes from "./pages/Configuracoes";
import Recebimentos from "./pages/Recebimentos";
import { useState } from "react";

// Create the App component as a function component
const App = () => {
  // Create the queryClient inside the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout><Outlet /></MainLayout>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/movimentacoes" element={<Movimentacoes />} />
                  <Route path="/pagamentos" element={<Pagamentos />} />
                  <Route path="/categorias" element={<Categorias />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/investimentos" element={<Investimentos />} />
                  <Route path="/recebimentos" element={<Recebimentos />} />
                  <Route path="/dre" element={<DRE />} />
                  
                  {/* New routes */}
                  <Route path="/analises" element={<Analises />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/previsoes" element={<Previsoes />} />
                  <Route path="/metas" element={<Metas />} />
                  <Route path="/alertas" element={<Alertas />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  
                  <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

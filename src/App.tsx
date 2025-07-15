
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Proposals from "./pages/Proposals";
import ProposalView from "./pages/ProposalView";
import ProposalApproval from "./pages/ProposalApproval";
import ProposalComments from "./pages/ProposalComments";
import CompanySettings from "./pages/CompanySettings";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aprovacao/:token" element={<ProposalApproval />} />
            <Route path="/observacoes/:token" element={<ProposalComments />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />

            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />

            <Route path="/produtos" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />

            <Route path="/propostas" element={
              <ProtectedRoute>
                <Proposals />
              </ProtectedRoute>
            } />

            <Route path="/propostas/ver/:id" element={
              <ProtectedRoute>
                <ProposalView />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="/configuracoes" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

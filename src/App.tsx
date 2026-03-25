import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Cases from "./pages/Cases";
import CreateCase from "./pages/CreateCase";
import CaseDetail from "./pages/CaseDetail";
import CourtCalendar from "./pages/CourtCalendar";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotificationsHub from "./pages/NotificationsHub";
import AIAssistant from "./pages/AIAssistant";
import CourtTracker from "./pages/CourtTracker";
import ContractManager from "./pages/ContractManager";
import FirmManagement from "./pages/FirmManagement";
import SecurityCenter from "./pages/SecurityCenter";
import IntegrationHub from "./pages/IntegrationHub";
import Reports from "./pages/Reports";
import SupabaseSetup from "./pages/SupabaseSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  
  console.log("ProtectedRoute: State", { isLoading, hasSession: !!session });

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-bold text-accent">Loading Case Compass...</div>;
  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
            <Route path="/cases/new" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
            <Route path="/cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CourtCalendar /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsHub /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/court-tracker" element={<ProtectedRoute><CourtTracker /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><ContractManager /></ProtectedRoute>} />
            <Route path="/firm" element={<ProtectedRoute><FirmManagement /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><IntegrationHub /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/setup" element={<SupabaseSetup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

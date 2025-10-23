// src/App.tsx
import { useState } from "react";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { UniversalHeader } from "@/components/UniversalHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { swrConfig } from "@/lib/swrConfig";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inbox from "./pages/Inbox";
import OPD from "./pages/OPD";
import NotFound from "./pages/NotFound";
import DoctorsListPage from "@/pages/masters/DoctorsListPage";
import SpecialtiesListPage from "./pages/masters/SpecialtyListPage";
import PatientsListPage from "./pages/masters/Patientslistpage";
import AppointmentsListPage from "./pages/masters/AppointmentsListPage";

const queryClient = new QueryClient();

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-white text-black">
      {/* Universal Sidebar */}
      {!isMobile && (
        <UniversalSidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      )}
      {isMobile && (
        <UniversalSidebar
          collapsed={false}
          onCollapse={() => {}}
          mobileOpen={sidebarMobileOpen}
          setMobileOpen={setSidebarMobileOpen}
        />
      )}

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Universal Header */}
        <UniversalHeader />
        
        {/* Page Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/opd" element={<OPD />} />
            
            {/* Masters Routes */}
            <Route path="/masters/doctors" element={<DoctorsListPage />} />
            <Route path="/masters/specialties" element={<SpecialtiesListPage />} />
            <Route path="/masters/patients" element={<PatientsListPage />} />
            <Route path="/masters/appointments" element={<AppointmentsListPage/>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <SWRConfig value={swrConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SWRConfig>
  );
};

export default App;
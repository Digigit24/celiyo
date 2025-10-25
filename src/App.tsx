// src/App.tsx
import { useState } from "react";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { UniversalSidebar } from "@/components/UniversalSidebar";
import { UniversalHeader } from "@/components/UniversalHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { swrConfig } from "@/lib/swrConfig";
import { cn } from "@/lib/utils";
import { publicRoutes, protectedRoutes, notFoundRoute, flattenRoutes } from "@/routes";

const queryClient = new QueryClient();

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Universal Sidebar - Fixed Position */}
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

      {/* Main Content Area - Offset by sidebar width */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          "lg:ml-64",
          !isMobile && sidebarCollapsed && "lg:ml-16"
        )}
      >
        {/* Universal Header - Fixed Position */}
        <UniversalHeader
          {...({ onMobileMenuClick: () => setSidebarMobileOpen(true), sidebarCollapsed } as any)}
        />

        {/* Page Content - Scrollable with top padding for fixed header */}
        <main className="flex-1 overflow-auto pt-16">
          <Routes>
            {/* Render all protected routes */}
            {flattenRoutes(protectedRoutes).map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            
            {/* 404 Route */}
            <Route path={notFoundRoute.path} element={notFoundRoute.element} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="hms-ui-theme">
      <SWRConfig value={swrConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  {publicRoutes.map((route, index) => (
                    <Route key={index} path={route.path} element={route.element} />
                  ))}

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
    </ThemeProvider>
  );
};

export default App;
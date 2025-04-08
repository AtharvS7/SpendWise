
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button"; 
import { LogOut } from "lucide-react";
import Index from "./pages/Index";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Recurring from "./pages/Recurring";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Auth from "./pages/Auth";
import InterestCalculator from "./pages/InterestCalculator";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Initialize a new Query Client for React Query
const queryClient = new QueryClient();

const AppContent = () => {
  // State management for theme and layout preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const location = useLocation();
  const { open: isSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();

  // Determine if route is public (landing or auth page)
  const isPublicRoute = location.pathname === "/" || location.pathname === "/auth";
  
  // Show logout button on non-public routes except expenses page
  const showLogoutButton = !isPublicRoute && location.pathname !== "/expenses";

  return (
    <div className={`min-h-screen flex w-full ${isDarkMode ? 'dark' : ''} ${isCompactMode ? 'compact' : ''}`}>
      {!isPublicRoute && <AppSidebar />}
      <main 
        className={`flex-1 transition-all duration-300 ${
          !isPublicRoute && !isMobile ? (isSidebarOpen ? 'ml-72' : 'ml-20') : ''
        } ${!isPublicRoute && isCompactMode ? 'p-2' : isMobile ? 'p-2' : 'p-4'}`}
      >
        {showLogoutButton && <LogoutButton />}
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/expenses" replace />} />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/income"
            element={
              <PrivateRoute>
                <Income />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <PrivateRoute>
                <Budgets />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <PrivateRoute>
                <Recurring />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/interest-calculator"
            element={
              <PrivateRoute>
                <InterestCalculator />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  isCompactMode={isCompactMode}
                  setIsCompactMode={setIsCompactMode}
                />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const LogoutButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      queryClient.clear(); // Clear all queries on logout
      navigate("/auth");
      toast.success("Logged out successfully");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className={`fixed ${isMobile ? 'top-2 right-3 z-50' : 'top-4 right-6 z-40'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-slate-700`}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {!isMobile && "Logout"}
    </Button>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      if (!session && location.pathname !== '/auth') {
        navigate("/auth", { replace: true });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuthenticated = !!session;
      setSession(isAuthenticated);
      if (!isAuthenticated && location.pathname !== '/auth') {
        navigate("/auth", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (session === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return session ? <>{children}</> : null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

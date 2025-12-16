import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SyncService } from "@/services/SyncService";
import { useEffect } from "react";

// Direct imports for instant navigation (no loading screens)
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import Search from "./pages/Search";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component to enable hooks inside BrowserRouter
const AppRoutes = () => {
  useKeyboardShortcuts();

  // Sync with Supabase on load/auth change (Global)
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      setTimeout(() => SyncService.syncGames(), 1000);
    }
  }, [user]);

  return (
    <>
      {/* Ambient light effects - subtle background (hidden on mobile for perf) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
        <div className="ambient-gold top-[-15%] right-[10%] opacity-40" />
        <div className="ambient-indigo bottom-[-10%] left-[-5%] opacity-30" />
      </div>

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add" element={<Index />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;


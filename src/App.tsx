import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SyncService } from "@/services/SyncService";
import { useEffect } from "react";

// Lazy load pages for performance optimization
const Index = lazy(() => import("./pages/Index"));
const Collections = lazy(() => import("./pages/Collections"));
const Search = lazy(() => import("./pages/Search"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Elegant loading state with luxury styling
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
    {/* Ambient lights */}
    <div className="ambient-gold top-[-20%] right-[-10%]" />
    <div className="ambient-indigo bottom-[-20%] left-[-10%]" />

    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="text-3xl sm:text-4xl font-light tracking-[0.15em] text-white">
        GAME<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">VAULT</span>
        <span className="text-amber-500 text-xs align-top ml-0.5">.</span>
      </div>
      <div className="h-[2px] w-20 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-amber-600 to-amber-400 animate-[shimmer_1s_infinite_linear]" />
      </div>
    </div>
  </div>
);

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
      {/* Ambient light effects - subtle background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-gold top-[-15%] right-[10%] opacity-40" />
        <div className="ambient-indigo bottom-[-10%] left-[-5%] opacity-30" />
      </div>

      <div className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/add" element={<Index />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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


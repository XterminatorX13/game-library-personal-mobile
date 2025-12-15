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

// Elegant loading state for route transitions
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="text-4xl font-bold">
        Game<span className="text-primary">Vault</span>
      </div>
      <div className="h-1 w-32 bg-primary/20 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-primary animate-[shimmer_1s_infinite_linear]" />
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
      // Small timeout to allow UI to render first
      setTimeout(() => SyncService.syncGames(), 1000);
    }
  }, [user]);

  return (
    <>
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


import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Lazy load pages for performance optimization
const Index = lazy(() => import("./pages/Index"));
const Collections = lazy(() => import("./pages/Collections"));
const Search = lazy(() => import("./pages/Search"));
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

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add" element={<Index />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/search" element={<Search />} />
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
      <AppRoutes />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;


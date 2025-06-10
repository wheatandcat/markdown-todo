import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // ローディング中は適切なローディング画面を表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 認証済みユーザー用ルート */}
      {isAuthenticated && <Route path="/" component={Home} />}
      
      {/* 未認証ユーザー用ルート（認証状態に関係なく常に利用可能） */}
      {!isAuthenticated && <Route path="/" component={Landing} />}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* 404ページ */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

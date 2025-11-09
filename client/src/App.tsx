import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Code2 } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import ChatPlayground from "@/pages/ChatPlayground";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/chat" component={ChatPlayground} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <TooltipProvider>
          <div className="flex flex-col h-screen w-full">
            <header className="flex items-center justify-between p-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Coding Agent</h1>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto min-h-0">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

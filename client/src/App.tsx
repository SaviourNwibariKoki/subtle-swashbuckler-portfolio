import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/pages/AdminPage";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { applySeoMetadata } from "./lib/seo";
import Home from "./pages/Home";
import "./portfolio.css";

function AdminRoute() {
  return (
    <DashboardLayout>
      <AdminPage />
    </DashboardLayout>
  );
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    applySeoMetadata(window.location.pathname);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminRoute} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

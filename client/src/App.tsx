import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { Redirect } from "@/components/Redirect";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import LicensesPage from "@/pages/LicensesPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import MyLicensesPage from "@/pages/MyLicensesPage";
import ProductsPage from "@/pages/ProductsPage";
import DocsPage from "@/pages/DocsPage";
import BotMonitorPage from "@/pages/BotMonitorPage";
import ViolationsPage from "@/pages/ViolationsPage";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-4 py-3 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ 
  component: Component, 
  requirePermission 
}: { 
  component: React.ComponentType;
  requirePermission: () => boolean;
}) {
  const hasPermission = requirePermission();
  
  if (!hasPermission) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { can } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && location !== "/login" && location !== "/register") {
    return <LoginPage />;
  }

  if (isAuthenticated && (location === "/login" || location === "/register")) {
    return <Redirect to="/" />;
  }

  if (location === "/login") {
    return <LoginPage />;
  }

  if (location === "/register") {
    return <RegisterPage />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/">
          {can.viewLicenses() ? <DashboardPage /> : <MyLicensesPage />}
        </Route>
        <Route path="/licenses">
          <ProtectedRoute component={LicensesPage} requirePermission={can.viewLicenses} />
        </Route>
        <Route path="/bots">
          <ProtectedRoute component={BotMonitorPage} requirePermission={can.viewBots} />
        </Route>
        <Route path="/users">
          <ProtectedRoute component={UsersPage} requirePermission={can.viewUsers} />
        </Route>
        <Route path="/settings">
          <ProtectedRoute component={SettingsPage} requirePermission={can.viewSettings} />
        </Route>
        <Route path="/profile" component={ProfilePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/docs">
          <ProtectedRoute component={DocsPage} requirePermission={can.viewDocs} />
        </Route>
        <Route path="/violations">
          <ProtectedRoute component={ViolationsPage} requirePermission={can.viewViolations} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

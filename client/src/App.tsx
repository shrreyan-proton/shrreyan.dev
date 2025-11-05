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
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
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
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-6 lg:p-8 min-h-full flex flex-col">
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

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  
  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && location !== "/login") {
    return <LoginPage />;
  }

  if (isAuthenticated && location === "/login") {
    return <Redirect to="/" />;
  }

  if (location === "/login") {
    return <LoginPage />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/">
          {user?.isAdmin ? <DashboardPage /> : <MyLicensesPage />}
        </Route>
        <Route path="/licenses">
          <AdminRoute component={LicensesPage} />
        </Route>
        <Route path="/bots">
          <AdminRoute component={BotMonitorPage} />
        </Route>
        <Route path="/users">
          <AdminRoute component={UsersPage} />
        </Route>
        <Route path="/settings">
          <AdminRoute component={SettingsPage} />
        </Route>
        <Route path="/profile" component={ProfilePage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/docs">
          <AdminRoute component={DocsPage} />
        </Route>
        <Route path="/violations">
          <AdminRoute component={ViolationsPage} />
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

import { Home, Key, Users, Settings, LogOut, User, UserCircle, Package, Shield, UserCog, ShoppingBag, BookOpen, Activity, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/logo_1762262685070.png";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    testId: "link-dashboard",
  },
  {
    title: "Licenses",
    url: "/licenses",
    icon: Key,
    testId: "link-licenses",
  },
  {
    title: "Bot Monitor",
    url: "/bots",
    icon: Activity,
    testId: "link-bots",
  },
  {
    title: "Violations",
    url: "/violations",
    icon: AlertTriangle,
    testId: "link-violations",
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    testId: "link-users",
  },
  {
    title: "Bot Integration",
    url: "/docs",
    icon: BookOpen,
    testId: "link-docs",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

const userMenuItems = [
  {
    title: "My Licenses",
    url: "/",
    icon: Key,
    testId: "link-my-licenses",
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    testId: "link-products",
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  const effectiveRole: string = user?.role ?? (user?.isAdmin ? "admin" : "customer");
  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (username?: string) => {
    if (!username) return "AD";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="h-10 w-10" />
          <div>
            <h2 className="text-lg font-semibold">Crimson Studios</h2>
            <p className="text-xs text-muted-foreground">Discord Bot Admin</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-md hover-elevate active-elevate-2 p-3"
              data-testid="button-profile-menu"
            >
              <Avatar className="h-9 w-9">
                {user?.profilePicture && (
                  <AvatarImage src={user.profilePicture} alt={user.username || "Profile"} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getUserInitials(user.username) : "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm overflow-hidden">
                <span className="font-medium truncate w-full">
                  {user?.username || user?.email || "Admin"}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {effectiveRole === "founder" && <Shield className="h-3 w-3" />}
                  {effectiveRole === "admin" && <Shield className="h-3 w-3" />}
                  {effectiveRole === "staff" && <UserCog className="h-3 w-3" />}
                  {effectiveRole === "customer" && <ShoppingBag className="h-3 w-3" />}
                  {effectiveRole === "user" && <UserCircle className="h-3 w-3" />}
                  {effectiveRole === "founder" && "Founder"}
                  {effectiveRole === "admin" && "Admin"}
                  {effectiveRole === "staff" && "Staff"}
                  {effectiveRole === "customer" && "Customer"}
                  {effectiveRole === "user" && "User"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" data-testid="menu-profile-dropdown">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLocation("/profile")}
              data-testid="menu-item-profile"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {user?.isAdmin && (
              <DropdownMenuItem
                onClick={() => setLocation("/settings")}
                data-testid="menu-item-settings"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              data-testid="menu-item-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

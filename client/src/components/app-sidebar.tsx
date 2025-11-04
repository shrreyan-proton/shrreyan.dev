import { Home, Key, Users, Settings } from "lucide-react";
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
import logoImage from "@assets/logo_1762262685070.png";

const menuItems = [
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
    title: "Users",
    url: "/users",
    icon: Users,
    testId: "link-users",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="h-10 w-10" />
          <div>
            <h2 className="text-lg font-semibold">License Manager</h2>
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
        <div className="text-xs text-muted-foreground">
          Admin: shrreyangO@gmail.com
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

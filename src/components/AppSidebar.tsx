import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  BookOpen,
  CheckSquare,
  Scale,
  Bell,
  Bot,
  Building2,
  ShieldCheck,
  Plug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Court Calendar", url: "/calendar", icon: Calendar },
  { title: "Clients", url: "/clients", icon: Users },
];

const managementNav = [
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Billing", url: "/billing", icon: DollarSign },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Contracts", url: "/contracts", icon: FileText },
  { title: "Firm Management", url: "/firm", icon: Building2 },
  { title: "Security Center", url: "/security", icon: ShieldCheck },
  { title: "Integration Hub", url: "/integrations", icon: Plug },
];

const insightsNav = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
  { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
  { title: "Court Tracker", url: "/court-tracker", icon: Scale },
  { title: "Reporting", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderItems = (items: typeof mainNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <Scale className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold text-sidebar-accent-foreground font-display tracking-wide">
                LegalDesk
              </h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
                Legal Management
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest">
            Core
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(managementNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(insightsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
              AK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                Adv. Kumar
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                Senior Partner
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

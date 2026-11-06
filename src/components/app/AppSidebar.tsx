import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, HeartPulse, LayoutDashboard, Pill, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMed } from "@/lib/med-store";

export function AppSidebar() {
  const { state: sidebarState, setOpenMobile } = useSidebar();
  const collapsed = sidebarState === "collapsed";
  const { state, ready } = useMed();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const pending = state.medications.filter((m) => m.status === "pending").length;

  const items = [
    { title: "Today's Schedule", url: "/", icon: LayoutDashboard, badge: ready ? pending : undefined },
    { title: "Residents", url: "/residents", icon: Users },
    { title: "Prescriptions", url: "/medications", icon: Pill },
    { title: "Audit Log", url: "/history", icon: ClipboardList },
  ] as const;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpenMobile(false)}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <HeartPulse className="size-5" />
          </span>
          {!collapsed && (
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold text-sidebar-accent-foreground">
                CareNest
              </span>
              <span className="block text-xs text-sidebar-foreground/70">Medication Manager</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      size="lg"
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon className="size-5" />
                        <span className="text-[0.95rem]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge !== undefined && item.badge > 0 && (
                      <SidebarMenuBadge className="rounded-full bg-warning px-2 text-warning-foreground peer-data-[active=true]/menu-button:text-warning-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-3">
          <div className="rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground/80">
            <p className="font-medium text-sidebar-accent-foreground">Sunrise Elder Care Home</p>
            <p className="mt-0.5">Always double-check allergies before giving any dose.</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

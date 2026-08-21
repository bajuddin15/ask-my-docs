import { NavLink, Outlet } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MessageSquare,
  FileText,
  LayoutGrid,
  Settings,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Ask", icon: MessageSquare, end: true },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/overview", label: "Overview", icon: LayoutGrid },
];

export default function AppShell() {
  const user = useAuthStore((s) => s.user);
  const { data: workspaces, activeWorkspace } = useWorkspaces();
  const setActiveWorkspaceId = useWorkspaceStore((s) => s.setActiveWorkspaceId);

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : "..";

  return (
    <div className="flex min-h-screen">
      <aside className="w-[232px] shrink-0 bg-bg-soft border-r border-border-soft flex flex-col p-4">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <div className="h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-accent to-signal flex items-center justify-center shadow-[0_0_18px_rgba(124,108,255,0.45)]" />
          <span className="font-display font-bold text-[15px] text-text-1">
            Ask My Docs
          </span>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 bg-surface-2 border border-border-soft rounded-[10px] px-2.5 py-2 mb-4 text-left">
              <div className="h-[22px] w-[22px] rounded-md bg-gradient-to-br from-amber to-danger shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-bold text-text-1 truncate">
                  {activeWorkspace?.name ?? "Loading…"}
                </div>
                <div className="text-[9.5px] text-text-3 capitalize">
                  {activeWorkspace?.plan ?? ""}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-text-3 shrink-0" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-64 rounded-[14px] border border-border-bright bg-surface-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-2 z-50"
              sideOffset={6}
              align="start"
            >
              <div className="text-[10.5px] font-bold text-text-4 uppercase tracking-wide px-2.5 py-1.5">
                Your workspaces
              </div>
              {workspaces?.map((ws) => (
                <DropdownMenu.Item
                  key={ws.id}
                  onSelect={() => setActiveWorkspaceId(ws.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] cursor-pointer outline-none",
                    ws.id === activeWorkspace?.id && "bg-surface-3",
                  )}
                >
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-text-1 truncate">
                      {ws.name}
                    </div>
                    <div className="text-[10px] text-text-3 capitalize">
                      {ws.plan}
                    </div>
                  </div>
                  {ws.id === activeWorkspace?.id && (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  )}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="h-px bg-border-soft my-1.5" />
              <DropdownMenu.Item className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] cursor-pointer outline-none text-accent text-xs font-semibold">
                <Plus className="h-4 w-4" />
                Create new workspace
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="text-[10.5px] font-bold text-text-4 uppercase tracking-wide px-2.5 pb-2">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13.3px] font-medium",
                  isActive
                    ? "bg-accent/10 text-text-1 ring-1 ring-accent/35"
                    : "text-text-2 hover:bg-surface-2",
                )
              }
            >
              <Icon className="h-[17px] w-[17px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="text-[10.5px] font-bold text-text-4 uppercase tracking-wide px-2.5 pb-2 pt-4">
          Account
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13.3px] font-medium",
              isActive
                ? "bg-accent/10 text-text-1 ring-1 ring-accent/35"
                : "text-text-2 hover:bg-surface-2",
            )
          }
        >
          <Settings className="h-[17px] w-[17px]" />
          Settings
        </NavLink>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5 p-2 rounded-[10px] border border-border-soft bg-surface-2">
          <Avatar>
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-1 truncate">
              {user ? `${user.first_name} ${user.last_name}` : "…"}
            </div>
            <div className="text-[10.5px] text-text-3 capitalize">
              {activeWorkspace?.role ?? ""}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

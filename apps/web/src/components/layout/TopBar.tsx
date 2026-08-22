import { Search } from "lucide-react";
import { NotificationsPopover } from "@/components/NotificationsPopover";

export function TopBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="h-[68px] shrink-0 border-b border-border-soft flex items-center justify-between px-7">
      <div>
        <h1 className="font-display text-lg font-bold text-text-1">{title}</h1>
        {subtitle && <p className="text-xs text-text-3 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {actions}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-3" />
          <input
            placeholder="Search documents, chats…"
            className="w-64 h-9 bg-surface-2 border border-border-soft rounded-lg pl-9 pr-3 text-xs text-text-1 placeholder:text-text-3 outline-none focus:border-accent"
          />
        </div>
        <NotificationsPopover />
      </div>
    </header>
  );
}

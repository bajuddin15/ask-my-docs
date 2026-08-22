import * as Popover from "@radix-ui/react-popover";
import { Bell, AlertTriangle, Upload, FileX } from "lucide-react";
import { useNotifications } from "@/hooks/useOverview";
import type { ActivityItem } from "@/hooks/useOverview";

const ICONS: Record<ActivityItem["kind"], typeof Bell> = {
  query_answered: Bell,
  query_unverified: AlertTriangle,
  document_indexed: Upload,
  document_failed: FileX,
};

const COLORS: Record<ActivityItem["kind"], string> = {
  query_answered: "text-text-2",
  query_unverified: "text-amber",
  document_indexed: "text-accent",
  document_failed: "text-red-400",
};

export function NotificationsPopover() {
  const { data: notifications } = useNotifications();
  const count = notifications?.length ?? 0;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="relative h-[34px] w-[34px] rounded-[9px] bg-surface-2 border border-border-soft flex items-center justify-center cursor-pointer">
          <Bell className="h-4 w-4 text-text-2" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_6px_var(--color-signal)]" />
          )}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-[340px] rounded-[14px] border border-border-bright bg-surface-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] z-50"
          sideOffset={8}
          align="end"
        >
          <div className="px-4 py-3 border-b border-border-soft">
            <div className="text-[13px] font-bold text-text-1">
              Notifications
            </div>
          </div>
          {!notifications || notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-text-3">
              You're all caught up.
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.map((n, i) => {
                const Icon = ICONS[n.kind];
                return (
                  <div
                    key={i}
                    className="flex gap-2.5 px-4 py-3 border-b border-border-soft last:border-0"
                  >
                    <div className="h-7 w-7 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                      <Icon className={`h-3.5 w-3.5 ${COLORS[n.kind]}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-text-1">
                        {n.title}
                      </div>
                      <div className="text-[10.5px] text-text-3 mt-0.5 leading-relaxed">
                        {n.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

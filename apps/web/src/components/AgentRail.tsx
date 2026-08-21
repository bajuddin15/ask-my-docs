import {
  Check,
  Route,
  FileSearch,
  Sparkles,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentNode {
  key: string;
  label: string;
  meta?: string;
  status: "done" | "live" | "warn" | "idle";
}

const iconFor: Record<string, LucideIcon> = {
  router: Route,
  retriever: FileSearch,
  answer: Sparkles,
  critic: Shield,
};

function NodeDot({ status }: { status: AgentNode["status"] }) {
  const base =
    "absolute -left-[26px] top-0.5 h-5 w-5 rounded-full flex items-center justify-center border-2";
  if (status === "done")
    return (
      <div
        className={cn(
          base,
          "border-success bg-surface-3 shadow-[0_0_0_4px_var(--color-bg-soft),0_0_12px_rgba(62,207,142,0.5)]",
        )}
      >
        <Check className="h-2.5 w-2.5 text-success" />
      </div>
    );
  if (status === "live")
    return (
      <div
        className={cn(
          base,
          "border-signal bg-surface-3 shadow-[0_0_0_4px_var(--color-bg-soft),0_0_14px_rgba(47,226,196,0.7)] animate-pulse",
        )}
      />
    );
  if (status === "warn")
    return (
      <div
        className={cn(
          base,
          "border-amber bg-surface-3 shadow-[0_0_0_4px_var(--color-bg-soft),0_0_12px_rgba(245,169,62,0.5)]",
        )}
      >
        <span className="text-[9px] font-bold text-amber">!</span>
      </div>
    );
  return <div className={cn(base, "border-border-bright bg-surface-3")} />;
}

export function AgentRail({
  nodes,
  compact,
}: {
  nodes: AgentNode[];
  compact?: boolean;
}) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-accent via-signal to-border-soft rounded-full" />
      <div className={compact ? "space-y-4" : "space-y-5"}>
        {nodes.map((node) => {
          const Icon = iconFor[node.key];
          return (
            <div key={node.key} className="relative">
              <NodeDot status={node.status} />
              <div className="flex items-center gap-1.5">
                {Icon && <Icon className="h-3 w-3 text-text-3" />}
                <span
                  className={cn(
                    "text-[12.5px] font-bold",
                    node.status === "idle" ? "text-text-3" : "text-text-1",
                  )}
                >
                  {node.label}
                </span>
              </div>
              {node.meta && (
                <div className="text-[10.5px] text-text-3 mt-0.5 font-mono">
                  {node.meta}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

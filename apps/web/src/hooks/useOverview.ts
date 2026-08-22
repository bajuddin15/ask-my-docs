import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface OverviewStats {
  document_count: number;
  query_count_30d: number;
  avg_groundedness_pct: number;
  avg_latency_ms: number | null;
  critic_retry_rate_pct: number;
}

export interface ActivityItem {
  kind:
    | "query_answered"
    | "query_unverified"
    | "document_indexed"
    | "document_failed";
  title: string;
  subtitle: string;
  created_at: string;
}

export function useOverview() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["overview", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<OverviewStats>("/overview");
      return data;
    },
    enabled: !!activeWorkspaceId,
  });
}

export function useActivity() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["activity", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<ActivityItem[]>("/overview/activity");
      return data;
    },
    enabled: !!activeWorkspaceId,
  });
}

export function useNotifications() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["notifications", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<ActivityItem[]>("/notifications");
      return data;
    },
    enabled: !!activeWorkspaceId,
    refetchInterval: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore, type Workspace } from "@/store/workspaceStore";

export function useWorkspaces() {
  const token = useAuthStore((s) => s.token);
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();

  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await api.get<Workspace[]>("/workspaces");
      return data;
    },
    enabled: !!token,
  });

  // if nothing is selected yet (first login), default to the first workspace
  useEffect(() => {
    if (!activeWorkspaceId && query.data && query.data.length > 0) {
      setActiveWorkspaceId(query.data[0].id);
    }
  }, [activeWorkspaceId, query.data, setActiveWorkspaceId]);

  const activeWorkspace =
    query.data?.find((w) => w.id === activeWorkspaceId) ?? null;

  return { ...query, activeWorkspace };
}

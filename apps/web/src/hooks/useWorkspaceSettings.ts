import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface WorkspaceSettings {
  critic_enabled: boolean;
  max_critic_retries: number;
  answer_model: string;
}

export function useWorkspaceSettings() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["workspace-settings", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<WorkspaceSettings>("/workspaces/settings");
      return data;
    },
    enabled: !!activeWorkspaceId,
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useMutation({
    mutationFn: async (payload: Partial<WorkspaceSettings>) => {
      const { data } = await api.patch<WorkspaceSettings>(
        "/workspaces/settings",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-settings", activeWorkspaceId],
      });
    },
  });
}

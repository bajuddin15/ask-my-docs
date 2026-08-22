import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { Workspace } from "@/store/workspaceStore";

interface CreateWorkspacePayload {
  name: string;
  slug?: string;
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setActiveWorkspaceId = useWorkspaceStore((s) => s.setActiveWorkspaceId);

  return useMutation({
    mutationFn: async (payload: CreateWorkspacePayload) => {
      const { data } = await api.post<Workspace>("/workspaces", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setActiveWorkspaceId(data.id);
    },
  });
}

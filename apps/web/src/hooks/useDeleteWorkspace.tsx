import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const clearWorkspace = useWorkspaceStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      await api.delete("/workspaces");
    },
    onSuccess: () => {
      clearWorkspace(); // useWorkspaces() will auto-select another workspace on next load
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

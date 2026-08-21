import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface ChatSummary {
  id: string;
  title: string;
  created_at: string;
}

export function useChatHistory() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: ["chats", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<ChatSummary[]>("/chats");
      return data;
    },
    enabled: !!activeWorkspaceId,
  });
}

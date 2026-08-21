import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface DocumentItem {
  id: string;
  filename: string;
  file_size_bytes: number;
  page_count: number | null;
  status: "processing" | "indexed" | "failed";
  failure_reason: string | null;
  uploaded_at: string;
}

export function useDocuments() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useQuery({
    queryKey: ["documents", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<DocumentItem[]>("/documents");
      return data;
    },
    enabled: !!activeWorkspaceId,
    // documents move processing -> indexed/failed in the background,
    // so keep polling while anything is still processing
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (d) => d.status === "processing",
      );
      return hasProcessing ? 3000 : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<DocumentItem>(
        "/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", activeWorkspaceId],
      });
    },
  });
}

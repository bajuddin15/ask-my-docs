import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ChunkDetail {
  id: string;
  content: string;
  page_number: number | null;
  document_id: string;
  filename: string;
}

export function useChunk(chunkId: string | null) {
  return useQuery({
    queryKey: ["chunk", chunkId],
    queryFn: async () => {
      const { data } = await api.get<ChunkDetail>(`/chunks/${chunkId}`);
      return data;
    },
    enabled: !!chunkId,
  });
}

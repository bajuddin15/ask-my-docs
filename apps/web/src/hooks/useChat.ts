import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface SourceRef {
  index: number;
  document_id: string;
  chunk_id: string;
  filename: string;
  page_number: number | null;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceRef[];
  is_grounded: boolean;
  retry_count: number;
  latency_ms: number | null;
  created_at: string;
}

interface ChatResponse {
  chat_id: string;
  message: ChatMessage;
}

export function useChat() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlChatId = searchParams.get("chat");

  const [chatId, setChatId] = useState<string | null>(urlChatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load history whenever the ?chat= param points at a chat we haven't
  // loaded into local state yet — this is what makes clicking a chat in
  // history actually show its previous messages.
  const historyQuery = useQuery({
    queryKey: ["chat-messages", urlChatId],
    queryFn: async () => {
      const { data } = await api.get<ChatMessage[]>(
        `/chats/${urlChatId}/messages`,
      );
      return data;
    },
    enabled: !!urlChatId,
  });

  useEffect(() => {
    if (urlChatId && historyQuery.data && chatId !== urlChatId) {
      setChatId(urlChatId);
      setMessages(historyQuery.data);
    }
  }, [urlChatId, historyQuery.data, chatId]);

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        sources: [],
        is_grounded: true,
        retry_count: 0,
        latency_ms: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const { data } = await api.post<ChatResponse>("/chat", {
        message,
        chat_id: chatId,
      });
      return data;
    },
    onSuccess: (data) => {
      setChatId(data.chat_id);
      setSearchParams({ chat: data.chat_id }, { replace: true });
      setMessages((prev) => [...prev, data.message]);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["chats", activeWorkspaceId] });
    },
  });

  const startNewChat = () => {
    setChatId(null);
    setMessages([]);
    setSearchParams({}, { replace: true });
  };

  return {
    messages,
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
    isLoadingHistory: !!urlChatId && historyQuery.isLoading,
    error: mutation.error,
    startNewChat,
    workspaceReady: !!activeWorkspaceId,
  };
}

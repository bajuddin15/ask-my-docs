import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

export interface Chat {
  id: string;
  workspace_id: string;
  title: string;
  created_by: string;
}

export function useChat({ chatId = "" }: { chatId: string }) {
  const navigate = useNavigate();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [chat, setChat] = useState<Chat | null>(null);

  // Load history whenever the ?chat= param points at a chat we haven't
  // loaded into local state yet — this is what makes clicking a chat in
  // history actually show its previous messages.
  const historyQuery = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      const { data } = await api.get<ChatMessage[]>(
        `/chats/${chatId}/messages`,
      );
      return data;
    },
    enabled: !!chatId,
  });

  const chatQuery = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const { data } = await api.get<Chat>(`/chats/${chatId}`);
      return data;
    },
    enabled: !!chatId,
  });

  useEffect(() => {
    if (chatId && historyQuery.data) {
      setMessages(historyQuery.data);
    }
  }, [chatId, historyQuery.data]);

  useEffect(() => {
    if (chatId && chatQuery.data) {
      setChat(chatQuery.data);
    }
  }, [chatId, chatQuery.data]);

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
        chat_id: chatId || null,
      });
      return data;
    },
    onSuccess: (data) => {
      if (!chatId) {
        navigate(`/chat/${data.chat_id}`);
      }
      setMessages((prev) => [...prev, data.message]);
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["chats", activeWorkspaceId] });
    },
  });

  const startNewChat = () => {
    navigate("/chat");
  };

  return {
    chat,
    messages,
    sendMessage: mutation.mutate,
    isSending: mutation.isPending,
    isLoadingHistory: !!chatId && historyQuery.isLoading,
    error: mutation.error,
    startNewChat,
    workspaceReady: !!activeWorkspaceId,
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspaceStore";

export interface Member {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending";
  joined_at: string | null;
}

export function useMembers() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useQuery({
    queryKey: ["members", activeWorkspaceId],
    queryFn: async () => {
      const { data } = await api.get<Member[]>("/workspaces/members");
      return data;
    },
    enabled: !!activeWorkspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      role: "admin" | "member";
    }) => {
      const { data } = await api.post<Member>("/workspaces/members", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspaceId],
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "admin" | "member";
    }) => {
      const { data } = await api.patch<Member>(
        `/workspaces/members/${memberId}`,
        { role },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspaceId],
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/workspaces/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", activeWorkspaceId],
      });
    },
  });
}

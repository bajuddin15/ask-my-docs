import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.patch("/auth/me", payload);
      return data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

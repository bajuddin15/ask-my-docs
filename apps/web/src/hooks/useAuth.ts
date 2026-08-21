import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  workspace_name: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function useSignup() {
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const { data } = await api.post<TokenResponse>("/auth/signup", payload);
      return data;
    },
    onSuccess: (data) => setToken(data.access_token),
  });
}

export function useLogin() {
  const setToken = useAuthStore((s) => s.setToken);
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<TokenResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: (data) => setToken(data.access_token),
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    },
    enabled: !!token,
    retry: false,
  });
}

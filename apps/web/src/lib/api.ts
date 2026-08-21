import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export const api = axios.create({
  baseURL: "/api/v1",
});

// every outgoing request automatically carries the current auth token and
// active workspace — callers never have to remember to attach these headers
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const workspaceId = useWorkspaceStore.getState().activeWorkspaceId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (workspaceId) {
    config.headers["X-Workspace-Id"] = workspaceId;
  }
  return config;
});

// a 401 means the token is invalid/expired — clear auth state so
// ProtectedRoute redirects to /login instead of retrying forever
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

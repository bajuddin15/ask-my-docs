import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  clear: () => void;
}

// only the ID is persisted — the full workspace list always comes fresh
// from React Query, this store just remembers *which one* was selected
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
      clear: () => set({ activeWorkspaceId: null }),
    }),
    { name: "ask-my-docs-workspace" },
  ),
);

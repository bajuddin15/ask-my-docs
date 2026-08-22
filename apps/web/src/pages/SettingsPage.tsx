import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Cpu, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TopBar } from "@/components/layout/TopBar";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useWorkspaceSettings,
  useUpdateWorkspaceSettings,
} from "@/hooks/useWorkspaceSettings";
import { useDeleteWorkspace } from "@/hooks/useDeleteWorkspace";

const MODEL_OPTIONS = ["gpt-4o-mini", "gpt-4o"];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { activeWorkspace } = useWorkspaces();
  const { data: settings } = useWorkspaceSettings();
  const update = useUpdateWorkspaceSettings();
  const deleteWorkspace = useDeleteWorkspace();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";
  const isOwner = activeWorkspace?.role === "owner";

  return (
    <>
      <Helmet>
        <title>Settings — Ask My Docs</title>
      </Helmet>
      <div className="flex flex-col h-screen">
        <TopBar
          title="Settings"
          subtitle="Workspace, model and account preferences"
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl p-7">
            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              Profile
            </div>
            <Card className="p-5 flex items-center gap-4 mb-7">
              <Avatar className="h-13 w-13">
                <AvatarFallback className="text-base">
                  {user ? `${user.first_name[0]}${user.last_name[0]}` : ".."}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-1">
                  {user ? `${user.first_name} ${user.last_name}` : "…"}
                </div>
                <div className="text-xs text-text-3 mt-0.5">{user?.email}</div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
              >
                Edit profile
              </Button>
            </Card>

            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              Model &amp; agent configuration
            </div>
            <Card className="p-5 mb-7 divide-y divide-border-soft">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface-3 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-text-2" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">
                      Answer model
                    </div>
                    <div className="text-[11px] text-text-3 mt-0.5">
                      Used by the Answer Generator agent
                    </div>
                  </div>
                </div>
                <select
                  className="bg-surface-3 border border-border-bright rounded-lg text-xs font-semibold text-text-1 px-3 py-1.5 outline-none disabled:opacity-50"
                  value={settings?.answer_model ?? "gpt-4o-mini"}
                  disabled={!canEdit}
                  onChange={(e) =>
                    update.mutate({ answer_model: e.target.value })
                  }
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-surface-3 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-text-2" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-text-1">
                      Critic verification
                    </div>
                    <div className="text-[11px] text-text-3 mt-0.5">
                      Re-check answers for groundedness before returning
                    </div>
                  </div>
                </div>
                <button
                  disabled={!canEdit}
                  onClick={() =>
                    update.mutate({ critic_enabled: !settings?.critic_enabled })
                  }
                  className={`w-9 h-[22px] rounded-full relative transition-colors disabled:opacity-50 ${
                    settings?.critic_enabled ? "bg-accent" : "bg-surface-3"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white absolute top-[3px] transition-all ${
                      settings?.critic_enabled ? "right-[3px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-[13px] font-semibold text-text-1">
                    Max critic retries
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    Re-attempts retrieval if groundedness check fails
                  </div>
                </div>
                <select
                  className="bg-surface-3 border border-border-bright rounded-lg text-xs font-semibold text-text-1 px-3 py-1.5 outline-none disabled:opacity-50"
                  value={settings?.max_critic_retries ?? 2}
                  disabled={!canEdit || !settings?.critic_enabled}
                  onChange={(e) =>
                    update.mutate({
                      max_critic_retries: Number(e.target.value),
                    })
                  }
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {!canEdit && (
              <p className="text-[11px] text-text-3 -mt-5 mb-7">
                Only workspace owners and admins can change agent settings.
              </p>
            )}

            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              API &amp; integrations
            </div>
            <Card className="p-5 mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-surface-3 flex items-center justify-center">
                  <Key className="h-4 w-4 text-text-2" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text-1">
                    LangSmith tracing
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5 font-mono">
                    connected · project: ask-my-docs-prod
                  </div>
                </div>
              </div>
              <Badge variant="success" dot>
                Active
              </Badge>
            </Card>

            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wide mb-3">
              Danger zone
            </div>
            <Card className="p-5 border-danger/30 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-text-1">
                  Delete workspace
                </div>
                <div className="text-[11px] text-text-3 mt-0.5">
                  Permanently removes all documents, chats and embeddings
                </div>
              </div>
              {isOwner ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              ) : (
                <span className="text-[11px] text-text-3">
                  Only the owner can do this
                </span>
              )}
            </Card>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${activeWorkspace?.name ?? "this workspace"}"?`}
        description="This permanently removes every document, chat, and embedding in this workspace, for every member. This cannot be undone."
        isDeleting={deleteWorkspace.isPending}
        onConfirm={() =>
          deleteWorkspace.mutate(undefined, {
            onSuccess: () => setDeleteOpen(false),
          })
        }
      />
    </>
  );
}

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  UserPlus,
  MoreVertical,
  UserMinus,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TopBar } from "@/components/layout/TopBar";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import {
  useMembers,
  useUpdateMemberRole,
  useRemoveMember,
  type Member,
} from "@/hooks/useMembers";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

function roleBadge(role: string) {
  if (role === "owner") return <Badge variant="accent">Owner</Badge>;
  if (role === "admin") return <Badge variant="neutral">Admin</Badge>;
  return <Badge variant="neutral">Member</Badge>;
}

export default function MembersPage() {
  const { data: members, isLoading } = useMembers();
  const { activeWorkspace } = useWorkspaces();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const canManage =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";
  const pendingCount =
    members?.filter((m) => m.status === "pending").length ?? 0;

  const subtitle = activeWorkspace
    ? `${activeWorkspace.name} · ${members?.length ?? 0} members${
        pendingCount > 0
          ? `, ${pendingCount} pending invite${pendingCount > 1 ? "s" : ""}`
          : ""
      }`
    : "";

  return (
    <>
      <Helmet>
        <title>Members — Ask My Docs</title>
      </Helmet>
      <div className="flex flex-col h-screen">
        <TopBar
          title="Members"
          subtitle={subtitle}
          actions={
            canManage && (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Invite member
              </Button>
            )
          }
        />

        <div className="flex-1 overflow-y-auto p-7">
          {isLoading && <p className="text-xs text-text-3">Loading…</p>}

          {members && (
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="px-4 py-2.5 text-[10.5px] font-bold text-text-3 uppercase tracking-wide">
                      Member
                    </th>
                    <th className="px-4 py-2.5 text-[10.5px] font-bold text-text-3 uppercase tracking-wide">
                      Role
                    </th>
                    <th className="px-4 py-2.5 text-[10.5px] font-bold text-text-3 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-[10.5px] font-bold text-text-3 uppercase tracking-wide">
                      Joined
                    </th>
                    <th className="px-4 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const isOwner = m.role === "owner";
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-border-soft last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {m.first_name[0]}
                                {m.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-[12.8px] font-bold text-text-1">
                                {m.first_name} {m.last_name}
                              </div>
                              <div className="text-[11px] text-text-3">
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{roleBadge(m.role)}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              m.status === "active" ? "success" : "amber"
                            }
                            dot
                          >
                            {m.status === "active" ? "Active" : "Pending"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[11.5px] text-text-3 font-mono">
                          {m.joined_at ? formatRelativeTime(m.joined_at) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {canManage && !isOwner && (
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="h-8 w-8 rounded-lg hover:bg-surface-3 flex items-center justify-center">
                                  <MoreVertical className="h-4 w-4 text-text-3" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  className="w-52 rounded-[12px] border border-border-bright bg-surface-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-1.5 z-50"
                                  sideOffset={6}
                                  align="end"
                                >
                                  {m.role === "member" ? (
                                    <DropdownMenu.Item
                                      onSelect={() =>
                                        updateRole.mutate({
                                          memberId: m.id,
                                          role: "admin",
                                        })
                                      }
                                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] cursor-pointer outline-none text-xs font-medium text-text-2 hover:bg-surface-3"
                                    >
                                      <ShieldCheck className="h-3.5 w-3.5" />
                                      Make admin
                                    </DropdownMenu.Item>
                                  ) : (
                                    <DropdownMenu.Item
                                      onSelect={() =>
                                        updateRole.mutate({
                                          memberId: m.id,
                                          role: "member",
                                        })
                                      }
                                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] cursor-pointer outline-none text-xs font-medium text-text-2 hover:bg-surface-3"
                                    >
                                      <Shield className="h-3.5 w-3.5" />
                                      Make member
                                    </DropdownMenu.Item>
                                  )}
                                  <DropdownMenu.Separator className="h-px bg-border-soft my-1.5" />
                                  <DropdownMenu.Item
                                    onSelect={() => setRemoveTarget(m)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] cursor-pointer outline-none text-xs font-medium text-red-400 hover:bg-danger/10"
                                  >
                                    <UserMinus className="h-3.5 w-3.5" />
                                    Remove from workspace
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}

          <Card className="p-5 mt-6">
            <div className="text-[13px] font-bold text-text-1 mb-4">
              Role permissions
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Badge variant="accent" className="mb-2">
                  Owner
                </Badge>
                <p className="text-[11.5px] text-text-3 leading-relaxed">
                  Full access, billing, delete workspace
                </p>
              </div>
              <div>
                <Badge variant="neutral" className="mb-2">
                  Admin
                </Badge>
                <p className="text-[11.5px] text-text-3 leading-relaxed">
                  Manage documents, invite &amp; remove members
                </p>
              </div>
              <div>
                <Badge variant="neutral" className="mb-2">
                  Member
                </Badge>
                <p className="text-[11.5px] text-text-3 leading-relaxed">
                  Ask questions, upload documents
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <DeleteConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Remove ${removeTarget?.first_name} ${removeTarget?.last_name}?`}
        description="They'll lose access to this workspace's documents and chats immediately. You can invite them again later."
        isDeleting={removeMember.isPending}
        onConfirm={() => {
          if (removeTarget) {
            removeMember.mutate(removeTarget.id, {
              onSuccess: () => setRemoveTarget(null),
            });
          }
        }}
      />
    </>
  );
}

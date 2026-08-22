import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInviteMember } from "@/hooks/useMembers";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export function InviteMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeWorkspace } = useWorkspaces();
  const invite = useInviteMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    invite.mutate(
      { email, role },
      {
        onSuccess: () => {
          setEmail("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {activeWorkspace?.name}</DialogTitle>
          <DialogDescription>
            Invited members can see all documents in this workspace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "member")}
                className="bg-surface-2 border border-border-soft rounded-[10px] text-xs font-semibold text-text-1 px-3 outline-none"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {invite.isError && (
              <p className="text-xs text-red-400 mt-2.5">
                {(invite.error as { response?: { data?: { detail?: string } } })
                  ?.response?.data?.detail ?? "Couldn't send invite."}
              </p>
            )}

            <div className="bg-surface-3 border border-border-soft rounded-lg p-3 mt-4 text-[11px] text-text-3 leading-relaxed">
              <strong className="text-text-2">Member</strong> can ask questions
              and upload documents.{" "}
              <strong className="text-text-2">Admin</strong> can also manage
              documents and invite others. The invited person needs an existing
              account.
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={invite.isPending}>
              {invite.isPending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWorkspace } from "@/hooks/useCreateWorkspace";
import { useInviteMember } from "@/hooks/useMembers";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseEmails(raw: string): string[] {
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0 && e.includes("@"));
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createWorkspace = useCreateWorkspace();
  const inviteMember = useInviteMember();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [emails, setEmails] = useState("");
  const [inviteErrors, setInviteErrors] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const reset = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setEmails("");
    setInviteErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteErrors([]);

    const workspace = await createWorkspace.mutateAsync({
      name,
      slug: slug || undefined,
    });

    const emailList = parseEmails(emails);
    if (emailList.length > 0) {
      setIsInviting(true);
      const failures: string[] = [];
      // active workspace already switched to the new one by useCreateWorkspace's
      // onSuccess, so these invite calls target the workspace we just created
      for (const email of emailList) {
        try {
          await inviteMember.mutateAsync({ email, role: "member" });
        } catch {
          failures.push(email);
        }
      }
      setIsInviting(false);
      if (failures.length > 0) {
        setInviteErrors(failures);
        return; // keep dialog open so the user sees which invites failed
      }
    }

    reset();
    onOpenChange(false);
    void workspace;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            <div>
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                placeholder="Northlight Legal"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="ws-slug">Workspace URL</Label>
              <div className="flex items-center rounded-[10px] border border-border-soft bg-surface-2 overflow-hidden focus-within:border-accent">
                <span className="pl-3.5 pr-1 text-[13px] text-text-3 select-none">
                  askmydocs.ai/
                </span>
                <input
                  id="ws-slug"
                  className="flex-1 bg-transparent py-2.5 pr-3.5 text-[13px] text-text-1 outline-none min-w-0"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="northlight-legal"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ws-invites">Invite teammates (optional)</Label>
              <Input
                id="ws-invites"
                placeholder="alex@northlight.com, priya@northlight.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />
              <p className="text-[11px] text-text-3 mt-1.5">
                Separate emails with a comma — you can also invite later
              </p>
            </div>

            {inviteErrors.length > 0 && (
              <p className="text-xs text-amber">
                Workspace created, but these emails need an existing account
                first: {inviteErrors.join(", ")}
              </p>
            )}
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
            <Button
              type="submit"
              size="sm"
              disabled={createWorkspace.isPending || isInviting}
            >
              {createWorkspace.isPending
                ? "Creating…"
                : isInviting
                  ? "Sending invites…"
                  : "Create workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

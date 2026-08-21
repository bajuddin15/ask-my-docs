import { FileText, Trash2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DocumentItem } from "@/hooks/useDocuments";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDetailDialog({
  document,
  open,
  onOpenChange,
  onDelete,
}: {
  document: DocumentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}) {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-[38px] w-[38px] rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
              <FileText className="h-[18px] w-[18px] text-[#8F7CFF]" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate">
                {document.filename}
              </DialogTitle>
              <div className="text-[11.5px] text-text-3 mt-0.5">
                {document.page_count ? `${document.page_count} pages · ` : ""}
                {formatBytes(document.file_size_bytes)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border-soft bg-surface-3 p-3.5 text-center">
              <div className="font-display text-lg font-bold text-accent">
                —
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">
                chunks indexed
              </div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-3 p-3.5 text-center">
              <div className="font-display text-lg font-bold text-signal">
                1536
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">
                embedding dims
              </div>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-3 p-3.5 text-center">
              <div className="font-display text-lg font-bold text-amber">
                {document.status}
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">status</div>
            </div>
          </div>

          {document.status === "failed" && document.failure_reason && (
            <div className="mt-4 rounded-lg bg-danger/10 border border-danger/30 px-3 py-2.5 text-[12px] text-red-300">
              {document.failure_reason}
            </div>
          )}

          {document.status === "processing" && (
            <p className="mt-4 text-xs text-text-3">
              This document is still being chunked and embedded — check back in
              a moment.
            </p>
          )}
        </DialogBody>

        <DialogFooter className="justify-between">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete?.(document.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button size="sm" disabled={document.status !== "indexed"}>
            <MessageSquare className="h-4 w-4" />
            Ask about this file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

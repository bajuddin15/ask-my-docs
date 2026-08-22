import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useChunk } from "@/hooks/useChunk";
import type { SourceRef } from "@/hooks/useChat";

export function SourceCitationDialog({
  source,
  open,
  onOpenChange,
}: {
  source: SourceRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: chunk, isLoading } = useChunk(source?.chunk_id ?? null);

  if (!source) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <Badge variant="accent">{source.index}</Badge>
            <div>
              <div className="text-[14.5px] font-bold text-text-1">
                {source.filename}
              </div>
              <div className="text-[11px] text-text-3 mt-0.5">
                {source.page_number ? `Page ${source.page_number} · ` : ""}
                similarity {(source.similarity * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          {isLoading && <p className="text-xs text-text-3">Loading source…</p>}
          {chunk && (
            <div className="rounded-xl border border-border-soft bg-surface-3 p-4 text-[12.8px] text-text-2 leading-[1.8] whitespace-pre-wrap">
              {chunk.content}
            </div>
          )}
          {!isLoading && !chunk && (
            <p className="text-xs text-text-3">
              This source chunk couldn't be loaded.
            </p>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogBody className="text-center pt-7">
          <div className="h-13 w-13 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-[15px] font-bold text-text-1 mb-2">{title}</div>
          <p className="text-[12.5px] text-text-3 leading-relaxed px-2">
            {description}
          </p>
        </DialogBody>
        <DialogFooter className="justify-center pb-6">
          <Button
            variant="secondary"
            size="sm"
            className="w-28 justify-center"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="w-28 justify-center"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

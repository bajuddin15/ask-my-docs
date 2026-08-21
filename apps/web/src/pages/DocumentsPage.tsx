import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FileText, Upload, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import {
  useDocuments,
  useUploadDocument,
  type DocumentItem,
} from "@/hooks/useDocuments";
import { DocumentDetailDialog } from "@/components/DocumentDetailDialog";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusBadge(doc: DocumentItem) {
  if (doc.status === "indexed")
    return (
      <Badge variant="success" dot>
        Indexed
      </Badge>
    );
  if (doc.status === "processing")
    return (
      <Badge variant="amber" dot>
        Processing
      </Badge>
    );
  return (
    <Badge variant="danger" dot>
      Failed
    </Badge>
  );
}

export default function DocumentsPage() {
  const { data: documents, isLoading } = useDocuments();
  const upload = useUploadDocument();
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload.mutate(file, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <>
      <Helmet>
        <title>Documents — Ask My Docs</title>
      </Helmet>
      <div className="flex flex-col h-screen">
        <header className="h-[68px] shrink-0 border-b border-border-soft flex items-center justify-between px-7">
          <div>
            <h1 className="font-display text-lg font-bold text-text-1">
              Documents
            </h1>
            <p className="text-xs text-text-3">
              {documents?.length ?? 0} files
            </p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload document
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-7">
          {!isLoading && documents?.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-surface-2 border border-border-soft flex items-center justify-center mb-4">
                <FileSearch className="h-6 w-6 text-text-3" />
              </div>
              <h2 className="font-display text-base font-bold text-text-1 mb-1.5">
                No documents yet
              </h2>
              <p className="text-xs text-text-3 max-w-xs mb-5">
                Upload a PDF to start asking your agents questions about it.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Upload className="h-4 w-4" />
                Upload your first document
              </Button>
            </div>
          )}

          {documents && documents.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-border-soft bg-surface-2 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                >
                  <div className="h-[38px] w-[38px] rounded-[10px] bg-accent/10 flex items-center justify-center mb-3">
                    <FileText className="h-[18px] w-[18px] text-[#8F7CFF]" />
                  </div>
                  <div className="text-[13.5px] font-bold text-text-1 mb-1 truncate">
                    {doc.filename}
                  </div>
                  <div className="text-[11.3px] text-text-3 mb-3.5">
                    {doc.page_count ? `${doc.page_count} pages · ` : ""}
                    {formatBytes(doc.file_size_bytes)}
                  </div>
                  <div className="flex items-center justify-between">
                    {statusBadge(doc)}
                    <span className="text-[10.5px] text-text-4 font-mono">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  {doc.status === "failed" && doc.failure_reason && (
                    <p className="text-[10.5px] text-red-400 mt-2">
                      {doc.failure_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>PDF only, up to 25MB</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="w-full border-[1.5px] border-dashed border-border-bright bg-accent/10 rounded-2xl py-9 text-center"
            >
              <div className="h-11 w-11 rounded-xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
                <Upload className="h-[19px] w-[19px] text-accent" />
              </div>
              <div className="text-[13px] font-semibold text-text-1">
                {upload.isPending ? "Uploading…" : "Click to choose a file"}
              </div>
              <div className="text-[11px] text-text-3 mt-1">
                or drag and drop
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {upload.isError && (
              <p className="text-xs text-red-400 mt-3">
                {(upload.error as { response?: { data?: { detail?: string } } })
                  ?.response?.data?.detail ?? "Upload failed — try again."}
              </p>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Document detail dialog */}
      <DocumentDetailDialog
        document={selectedDoc}
        open={!!selectedDoc}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      />
    </>
  );
}

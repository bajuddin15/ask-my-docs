import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Upload, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useUploadDocument } from "@/hooks/useDocuments";

function StepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={
            i === active
              ? "h-1.5 w-6 rounded-full bg-accent"
              : "h-1.5 w-1.5 rounded-full bg-border-bright"
          }
        />
      ))}
    </div>
  );
}

export default function OnboardingDocumentsPage() {
  const navigate = useNavigate();
  const { data: documents } = useDocuments();
  const upload = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
  };

  const uploadedCount = documents?.length ?? 0;

  return (
    <>
      <Helmet>
        <title>Connect documents — Ask My Docs</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-9 right-11 text-xs font-semibold text-text-3"
        >
          Skip setup
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Badge variant="accent" className="mx-auto mb-3.5 w-fit">
              STEP 2 OF 3
            </Badge>
            <h1 className="font-display text-xl font-bold text-text-1 mb-2">
              Add your first documents
            </h1>
            <p className="text-sm text-text-3">
              Upload a few files to start — you can add more anytime
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
            className="w-full border-[1.5px] border-dashed border-border-bright bg-accent/10 rounded-2xl py-8 text-center mb-3.5"
          >
            <div className="h-11 w-11 rounded-xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
              <Upload className="h-[19px] w-[19px] text-accent" />
            </div>
            <div className="text-[13px] font-semibold text-text-1">
              {upload.isPending ? "Uploading…" : "Click to choose a file"}
            </div>
            <div className="text-[11px] text-text-3 mt-1">PDF, up to 25MB</div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {documents && documents.length > 0 && (
            <div className="flex items-center justify-between bg-surface-3 border border-border-soft rounded-lg px-3 py-2.5 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-success/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="text-xs font-semibold text-text-1 truncate max-w-[220px]">
                  {documents[0].filename}
                </span>
              </div>
              <Badge variant="success" dot>
                Ready
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">
              {uploadedCount} of 5 files added
            </span>
            <Button onClick={() => navigate("/")}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-12">
          <StepDots active={1} />
        </div>
      </div>
    </>
  );
}

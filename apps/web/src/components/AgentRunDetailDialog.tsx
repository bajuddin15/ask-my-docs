import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgentRail, type AgentNode } from "@/components/AgentRail";
import type { ChatMessage } from "@/hooks/useChat";

export function AgentRunDetailDialog({
  message,
  open,
  onOpenChange,
}: {
  message: ChatMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!message) return null;

  const nodes: AgentNode[] = [
    { key: "router", label: "Router Agent", status: "done" },
    {
      key: "retriever",
      label: "Retriever Agent",
      meta: `${message.sources.length} chunks retrieved`,
      status: "done",
    },
    { key: "answer", label: "Answer Generator", status: "done" },
    {
      key: "critic",
      label: "Critic Agent",
      meta: message.is_grounded
        ? `Passed${message.retry_count > 0 ? ` after ${message.retry_count} retries` : ""}`
        : `Unresolved after ${message.retry_count} retries`,
      status: message.is_grounded ? "done" : "warn",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Run detail</DialogTitle>
          <div className="text-[11px] text-text-3 mt-0.5 font-mono">
            message_id: {message.id.slice(0, 8)}…
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <Card className="p-3 text-center">
              <div className="font-display text-lg font-bold text-text-1">
                {message.latency_ms != null
                  ? `${(message.latency_ms / 1000).toFixed(1)}s`
                  : "—"}
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">
                total latency
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="font-display text-lg font-bold text-text-1">
                {message.retry_count}
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">
                critic retries
              </div>
            </Card>
            <Card
              className={`p-3 text-center ${message.is_grounded ? "" : "border-amber/40 bg-amber/10"}`}
            >
              <div
                className={`font-display text-lg font-bold ${message.is_grounded ? "text-success" : "text-amber"}`}
              >
                {message.is_grounded ? "Grounded" : "Unresolved"}
              </div>
              <div className="text-[10px] text-text-3 mt-0.5">
                critic verdict
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <AgentRail nodes={nodes} />
          </Card>

          <p className="text-[11px] text-text-3 mt-3 leading-relaxed">
            Per-node token and cost breakdowns aren't tracked yet — latency and
            retry count are measured live from this run; token/cost metering is
            a planned addition.
          </p>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" size="sm" asChild>
            <a
              href="https://smith.langchain.com"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Open in LangSmith
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

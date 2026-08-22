import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Send, Sparkles, Plus, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRail, type AgentNode } from "@/components/AgentRail";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { AgentRunDetailDialog } from "@/components/AgentRunDetailDialog";
import { SourceCitationDialog } from "@/components/SourceCitationDialog";
import { useChat, type ChatMessage, type SourceRef } from "@/hooks/useChat";

function traceNodesFor(
  message: ChatMessage | undefined,
  isSending: boolean,
): AgentNode[] {
  if (!message && !isSending) {
    return [
      { key: "router", label: "Router", status: "idle" },
      { key: "retriever", label: "Retriever", status: "idle" },
      { key: "answer", label: "Answer draft", status: "idle" },
      { key: "critic", label: "Critic", status: "idle" },
    ];
  }
  if (isSending) {
    return [
      { key: "router", label: "Router", status: "done" },
      { key: "retriever", label: "Retriever", status: "done" },
      { key: "answer", label: "Answer draft", status: "done" },
      {
        key: "critic",
        label: "Critic",
        meta: "verifying groundedness…",
        status: "live",
      },
    ];
  }
  if (!message) return [];
  const criticMeta = message.is_grounded
    ? message.retry_count > 0
      ? `grounded after ${message.retry_count} ${message.retry_count === 1 ? "retry" : "retries"}`
      : "grounded, 0 retries"
    : `unresolved after ${message.retry_count} retries`;
  return [
    { key: "router", label: "Router", status: "done" },
    {
      key: "retriever",
      label: "Retriever",
      meta: `${message.sources.length} chunks`,
      status: "done",
    },
    { key: "answer", label: "Answer draft", status: "done" },
    {
      key: "critic",
      label: "Critic",
      meta: criticMeta,
      status: message.is_grounded ? "done" : "warn",
    },
  ];
}

export default function ChatPage() {
  const params = useParams();
  const { chatId } = params as { chatId: string };
  const { activeWorkspace } = useWorkspaces();
  const {
    chat,
    messages,
    sendMessage,
    isSending,
    startNewChat,
    workspaceReady,
    isLoadingHistory,
  } = useChat({ chatId });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [citationSource, setCitationSource] = useState<SourceRef | null>(null);
  const [runDetailMessage, setRunDetailMessage] = useState<ChatMessage | null>(
    null,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    sendMessage(trimmed);
    setInput("");
  };

  const suggestions = [
    "Compare termination clauses across all vendor contracts",
    "What's the liability cap in the SaaS agreement?",
    "Summarize the non-compete terms",
  ];

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const traceNodes = traceNodesFor(lastAssistantMessage, isSending);

  return (
    <>
      <Helmet>
        <title>Ask — Ask My Docs</title>
      </Helmet>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col border-r border-border-soft min-w-0">
          <header className="h-[68px] shrink-0 border-b border-border-soft flex items-center justify-between px-7">
            <div>
              <h1 className="font-display text-lg font-bold text-text-1">
                {chat?.title ?? "New conversation"}
              </h1>
              <p className="text-xs text-text-3">
                Querying {activeWorkspace?.name ?? "your workspace"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/chats">
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={startNewChat}>
                <Plus className="h-4 w-4" />
                New chat
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-7 py-6">
            {isLoadingHistory ? (
              <div className="h-full flex items-center justify-center text-xs text-text-3">
                Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-signal flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,108,255,0.35)]">
                  <Sparkles
                    className="h-6 w-6 text-[#0A0D14]"
                    fill="currentColor"
                  />
                </div>
                <h2 className="font-display text-lg font-bold text-text-1 mb-1.5">
                  Ask your documents anything
                </h2>
                <p className="text-sm text-text-3 max-w-sm mb-6">
                  Router, Retriever and Critic agents work together and cite
                  every claim back to a source.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left text-xs text-text-2 bg-surface-2 border border-border-soft hover:border-border-bright rounded-full px-4 py-2.5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((m) => {
                  const isUnverified =
                    m.role === "assistant" &&
                    !m.is_grounded &&
                    m.sources.length > 0;
                  return (
                    <div
                      key={m.id}
                      className={
                        m.role === "user" ? "flex justify-end" : "flex gap-3"
                      }
                    >
                      {m.role === "assistant" && (
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shrink-0">
                          <Sparkles
                            className="h-3.5 w-3.5 text-white"
                            fill="currentColor"
                          />
                        </div>
                      )}
                      <div
                        className={
                          m.role === "user" ? "max-w-[65%]" : "max-w-[85%]"
                        }
                      >
                        {isUnverified ? (
                          <Card className="px-4 py-3 bg-amber/10 border-amber/35">
                            <div className="flex gap-2.5 items-start">
                              <AlertTriangle className="h-[17px] w-[17px] text-amber shrink-0 mt-0.5" />
                              <div>
                                <div className="text-[13px] font-bold text-amber mb-1">
                                  Couldn't fully verify this answer
                                </div>
                                <p className="text-[12.6px] text-text-2 leading-relaxed">
                                  {m.content}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <Card
                            className={
                              m.role === "user"
                                ? "bg-surface-3 rounded-tr-[4px] px-4 py-3"
                                : "px-4 py-3"
                            }
                          >
                            <p className="text-[13.3px] text-text-1 leading-relaxed whitespace-pre-wrap">
                              {m.content}
                            </p>
                          </Card>
                        )}
                        {m.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                            {m.sources.map((s) => (
                              <button
                                key={s.chunk_id}
                                onClick={() => setCitationSource(s)}
                              >
                                <Badge
                                  variant="accent"
                                  className="cursor-pointer hover:brightness-125"
                                >
                                  {s.index} {s.filename}
                                  {s.page_number ? ` · p.${s.page_number}` : ""}
                                </Badge>
                              </button>
                            ))}
                            {m.role === "assistant" && (
                              <button
                                onClick={() => setRunDetailMessage(m)}
                                className="text-[10.5px] text-text-3 hover:text-text-1 font-mono ml-1"
                              >
                                {m.latency_ms != null
                                  ? `${(m.latency_ms / 1000).toFixed(1)}s`
                                  : ""}{" "}
                                · view run
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shrink-0">
                      <Sparkles
                        className="h-3.5 w-3.5 text-white"
                        fill="currentColor"
                      />
                    </div>
                    <Card className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
                        <span className="text-xs font-semibold text-text-2">
                          Agents are working on it…
                        </span>
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="px-7 pb-6 pt-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2.5 bg-surface-2 border border-border-bright rounded-[14px] pl-4 pr-2 py-2">
              <input
                className="flex-1 bg-transparent text-sm text-text-1 placeholder:text-text-3 outline-none"
                placeholder={
                  workspaceReady
                    ? "Ask a question about your documents…"
                    : "Loading workspace…"
                }
                value={input}
                disabled={!workspaceReady}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Agent trace right panel — the signature element */}
        <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
          <div className="font-display text-[13.5px] font-bold text-text-1 mb-0.5">
            Agent trace
          </div>
          <div className="text-[11px] text-text-3 mb-4">
            {messages.length === 0
              ? "Idle — waiting for your first question"
              : isSending
                ? "Live execution for current answer"
                : "Last completed run"}
          </div>

          <Card className={messages.length === 0 ? "p-4 opacity-55" : "p-4"}>
            <AgentRail nodes={traceNodes} />
          </Card>

          {lastAssistantMessage &&
            lastAssistantMessage.sources.length > 0 &&
            !isSending && (
              <>
                <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mt-5 mb-2.5">
                  Sources used
                </div>
                <div className="space-y-2">
                  {lastAssistantMessage.sources.map((s) => (
                    <div
                      key={s.chunk_id}
                      className="flex items-center gap-2 bg-surface-2 border border-border-soft rounded-lg px-2.5 py-2"
                    >
                      <Badge variant="accent" className="shrink-0">
                        {s.index}
                      </Badge>
                      <span className="text-[11.3px] text-text-2 truncate">
                        {s.filename}
                        {s.page_number ? `, p.${s.page_number}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </aside>
      </div>

      <SourceCitationDialog
        source={citationSource}
        open={!!citationSource}
        onOpenChange={(open) => !open && setCitationSource(null)}
      />
      <AgentRunDetailDialog
        message={runDetailMessage}
        open={!!runDetailMessage}
        onOpenChange={(open) => !open && setRunDetailMessage(null)}
      />
    </>
  );
}

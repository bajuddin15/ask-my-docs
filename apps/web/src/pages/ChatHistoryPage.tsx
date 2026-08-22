import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { MessageSquare, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatHistory } from "@/hooks/useChatHistory";

function groupByDay(
  items: { id: string; title: string; created_at: string }[],
) {
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const day = new Date(item.created_at).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    groups[day] = groups[day] ?? [];
    groups[day].push(item);
  }
  return groups;
}

export default function ChatHistoryPage() {
  const { data: chats, isLoading } = useChatHistory();
  const groups = groupByDay(chats ?? []);

  return (
    <>
      <Helmet>
        <title>Chats — Ask My Docs</title>
      </Helmet>
      <div className="flex h-screen">
        <div className="w-[340px] shrink-0 border-r border-border-soft p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-3.5">
            <h1 className="font-display text-[15px] font-bold text-text-1">
              Chats
            </h1>
            <Link to="/">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </Link>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-3" />
            <input
              placeholder="Search conversations…"
              className="w-full h-9 rounded-[10px] border border-border-soft bg-surface-2 pl-9 pr-3 text-xs text-text-1 placeholder:text-text-3 outline-none focus:border-accent"
            />
          </div>

          {isLoading && <p className="text-xs text-text-3 px-1">Loading…</p>}

          {!isLoading && chats?.length === 0 && (
            <p className="text-xs text-text-3 px-1">
              No conversations yet — start one from the Ask tab.
            </p>
          )}

          {Object.entries(groups).map(([day, items]) => (
            <div key={day} className="mb-4">
              <div className="text-[10.5px] font-bold text-text-4 uppercase tracking-wide mb-1.5 px-1">
                {day}
              </div>
              <div className="space-y-1">
                {items.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="block rounded-[10px] px-3 py-2.5 hover:bg-surface-2"
                  >
                    <div className="text-[12.8px] font-bold text-text-1 truncate">
                      {chat.title}
                    </div>
                    <div className="text-[10.5px] text-text-3 mt-0.5">
                      {new Date(chat.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-2 border border-border-soft flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-text-3" />
          </div>
          <h2 className="font-display text-[15.5px] font-bold text-text-1 mb-1.5">
            Select a conversation
          </h2>
          <p className="text-xs text-text-3 max-w-xs">
            Pick a chat from the list, or start a new one to ask your agents
            something.
          </p>
        </div>
      </div>
    </>
  );
}

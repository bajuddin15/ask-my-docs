import { Helmet } from "react-helmet-async";
import {
  FileText,
  MessageSquare,
  Shield,
  Clock,
  Check,
  AlertTriangle,
  Upload,
  FileX,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useOverview,
  useActivity,
  type ActivityItem,
} from "@/hooks/useOverview";

const ICONS: Record<ActivityItem["kind"], typeof Check> = {
  query_answered: Check,
  query_unverified: AlertTriangle,
  document_indexed: Upload,
  document_failed: FileX,
};

const COLORS: Record<ActivityItem["kind"], string> = {
  query_answered: "text-success bg-success/10",
  query_unverified: "text-amber bg-amber/10",
  document_indexed: "text-accent bg-accent/10",
  document_failed: "text-red-400 bg-danger/10",
};

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Check;
  value: string;
  label: string;
}) {
  return (
    <Card className="p-4">
      <div className="h-9 w-9 rounded-lg bg-surface-3 flex items-center justify-center mb-3">
        <Icon className="h-4 w-4 text-text-2" />
      </div>
      <div className="font-display text-xl font-bold text-text-1">{value}</div>
      <div className="text-[11px] text-text-3 mt-0.5">{label}</div>
    </Card>
  );
}

export default function OverviewPage() {
  const { data: stats, isLoading } = useOverview();
  const { data: activity } = useActivity();

  return (
    <>
      <Helmet>
        <title>Overview — Ask My Docs</title>
      </Helmet>
      <div className="h-screen overflow-y-auto">
        <header className="h-[68px] border-b border-border-soft flex items-center px-7">
          <div>
            <h1 className="font-display text-lg font-bold text-text-1">
              Overview
            </h1>
            <p className="text-xs text-text-3">
              Last 30 days across your workspace
            </p>
          </div>
        </header>

        <div className="p-7">
          {isLoading && <p className="text-xs text-text-3">Loading…</p>}

          {stats && (
            <>
              <div className="grid grid-cols-4 gap-3.5 mb-6">
                <StatCard
                  icon={FileText}
                  value={String(stats.document_count)}
                  label="Documents indexed"
                />
                <StatCard
                  icon={MessageSquare}
                  value={String(stats.query_count_30d)}
                  label="Queries (30d)"
                />
                <StatCard
                  icon={Shield}
                  value={`${stats.avg_groundedness_pct}%`}
                  label="Avg. groundedness"
                />
                <StatCard
                  icon={Clock}
                  value={
                    stats.avg_latency_ms != null
                      ? `${(stats.avg_latency_ms / 1000).toFixed(1)}s`
                      : "—"
                  }
                  label="Avg. latency"
                />
              </div>

              <Card className="p-5 mb-6">
                <div className="text-[13.5px] font-bold text-text-1 mb-1">
                  Agent health
                </div>
                <div className="text-[11px] text-text-3 mb-5">
                  Critic retry rate over the last 30 days
                </div>
                <div className="text-center py-2">
                  <div className="font-display text-3xl font-bold text-signal">
                    {stats.critic_retry_rate_pct}%
                  </div>
                  <div className="text-[11px] text-text-3 mt-1">
                    of answers needed a critic retry
                  </div>
                </div>
              </Card>
            </>
          )}

          <Card className="p-5">
            <div className="text-[13.5px] font-bold text-text-1 mb-4">
              Recent activity
            </div>
            {!activity || activity.length === 0 ? (
              <p className="text-xs text-text-3">
                Nothing yet — ask a question or upload a document.
              </p>
            ) : (
              <div className="divide-y divide-border-soft">
                {activity.map((item, i) => {
                  const Icon = ICONS[item.kind];
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${COLORS[item.kind]}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-text-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-text-3 mt-0.5 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                      <span className="text-[10.5px] text-text-4 font-mono shrink-0">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

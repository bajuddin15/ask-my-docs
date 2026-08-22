import { Helmet } from "react-helmet-async";
import {
  Check,
  CreditCard,
  FileText,
  Sparkles,
  Users,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopBar } from "@/components/layout/TopBar";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useOverview } from "@/hooks/useOverview";
import { useMembers } from "@/hooks/useMembers";
import { useDocuments } from "@/hooks/useDocuments";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    tagline: "For trying things out",
    features: [
      "1,000 queries / month",
      "5 documents",
      "gpt-4o-mini answers",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    tagline: "For growing teams",
    highlighted: true,
    features: [
      "10,000 queries / month",
      "Unlimited documents",
      "gpt-4o answers + Critic priority",
      "LangSmith trace export",
      "Email support",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$99",
    tagline: "For whole organizations",
    features: [
      "Unlimited queries",
      "Unlimited documents",
      "Shared workspaces",
      "SSO (coming soon)",
      "Priority support",
    ],
  },
];

function StatBlock({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: typeof Check;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="h-10 w-10 rounded-xl bg-surface-3 flex items-center justify-center shrink-0">
        <Icon className="h-[18px] w-[18px] text-text-2" />
      </div>
      <div>
        <div className="font-display text-lg font-bold text-text-1 leading-none">
          {value}
        </div>
        <div className="text-[11px] text-text-3 mt-1.5">
          {label}
          {sublabel && <span className="text-text-4"> · {sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { activeWorkspace } = useWorkspaces();
  const { data: overview } = useOverview();
  const { data: members } = useMembers();
  const { data: documents } = useDocuments();

  const plan = activeWorkspace?.plan ?? "free";
  const currentPlanInfo = PLANS.find((p) => p.id === plan) ?? PLANS[0];
  const usagePct = activeWorkspace
    ? Math.min(
        100,
        Math.round(
          (activeWorkspace.monthly_query_count /
            activeWorkspace.monthly_query_limit) *
            100,
        ),
      )
    : 0;

  return (
    <>
      <Helmet>
        <title>Billing — Ask My Docs</title>
      </Helmet>
      <div className="flex flex-col h-screen">
        <TopBar title="Billing" subtitle="Plan, usage, and payment details" />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl p-7">
            {/* Current plan hero */}
            <Card className="p-0 mb-7 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-signal/10 pointer-events-none" />
              <div className="relative p-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="font-display text-2xl font-bold text-text-1 capitalize">
                      {currentPlanInfo.name} plan
                    </span>
                    {plan !== "free" && (
                      <Badge variant="accent">
                        <Sparkles className="h-2.5 w-2.5" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-[12.5px] text-text-3">
                    {activeWorkspace?.name} is on the {currentPlanInfo.name}{" "}
                    plan — {currentPlanInfo.tagline.toLowerCase()}
                  </p>
                </div>
                {plan === "free" && (
                  <button className="bg-gradient-to-br from-accent to-accent-2 text-white text-xs font-bold px-4 py-2.5 rounded-[10px] shadow-[0_4px_20px_rgba(124,108,255,0.35)]">
                    Upgrade plan
                  </button>
                )}
              </div>

              <div className="relative px-6 pb-6">
                <div className="flex items-center justify-between text-[11.5px] mb-2">
                  <span className="text-text-2 font-medium">
                    Monthly queries used
                  </span>
                  <span className="font-mono text-text-1">
                    {activeWorkspace?.monthly_query_count ?? 0} /{" "}
                    {activeWorkspace?.monthly_query_limit ?? 1000}
                  </span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-signal rounded-full"
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
              </div>

              <div className="relative grid grid-cols-3 gap-6 px-6 pb-6 pt-1">
                <StatBlock
                  icon={MessageSquare}
                  label="Queries (30d)"
                  value={String(overview?.query_count_30d ?? 0)}
                />
                <StatBlock
                  icon={FileText}
                  label="Documents"
                  value={String(documents?.length ?? 0)}
                />
                <StatBlock
                  icon={Users}
                  label="Members"
                  value={String(members?.length ?? 0)}
                />
              </div>
            </Card>

            {/* Plan comparison */}
            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              Plans
            </div>
            <div className="grid grid-cols-3 gap-4 mb-7">
              {PLANS.map((p) => {
                const isCurrent = p.id === plan;
                return (
                  <Card
                    key={p.id}
                    className={`p-5 relative ${p.highlighted ? "border-2 border-accent" : ""}`}
                  >
                    {p.highlighted && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-accent-2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-xs font-bold text-text-2 mb-1">
                      {p.name}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-2xl font-bold text-text-1">
                        {p.price}
                      </span>
                      <span className="text-[11px] text-text-3">/mo</span>
                    </div>
                    <p className="text-[10.5px] text-text-4 mb-4">
                      {p.tagline}
                    </p>
                    <div className="space-y-2 mb-5">
                      {p.features.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                          <span className="text-[11.5px] text-text-2">{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-lg text-xs font-bold ${
                        isCurrent
                          ? "bg-surface-3 text-text-3 cursor-default"
                          : p.highlighted
                            ? "bg-gradient-to-br from-accent to-accent-2 text-white"
                            : "border border-border-bright text-text-1"
                      }`}
                    >
                      {isCurrent
                        ? "Current plan"
                        : p.id === "team"
                          ? "Talk to sales"
                          : `Upgrade to ${p.name}`}
                    </button>
                  </Card>
                );
              })}
            </div>

            {/* Payment method */}
            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              Payment method
            </div>
            <Card className="p-5 mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-3 flex items-center justify-center">
                  <CreditCard className="h-[18px] w-[18px] text-text-3" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-text-1">
                    No payment method on file
                  </div>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    Add a card before upgrading to a paid plan
                  </div>
                </div>
              </div>
              <button className="border border-border-bright text-text-1 text-xs font-bold px-4 py-2 rounded-[10px]">
                Add payment method
              </button>
            </Card>

            {/* Billing history */}
            <div className="text-[11px] font-bold text-text-2 uppercase tracking-wide mb-3">
              Billing history
            </div>
            <Card className="p-10 text-center">
              <div className="h-11 w-11 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-3.5">
                <FileText className="h-5 w-5 text-text-3" />
              </div>
              <div className="text-[13px] font-semibold text-text-1 mb-1">
                No invoices yet
              </div>
              <p className="text-[11.5px] text-text-3 max-w-xs mx-auto">
                You're on the Free plan, so there's nothing to bill yet.
                Invoices will appear here once you upgrade.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

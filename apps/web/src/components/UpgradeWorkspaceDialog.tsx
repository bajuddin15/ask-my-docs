import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { useWorkspaces } from "@/hooks/useWorkspaces";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    features: [
      "1,000 queries / month",
      "5 documents",
      "gpt-4o-mini answers",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
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
    name: "Team",
    price: "$99",
    features: [
      "Unlimited queries",
      "Unlimited documents",
      "Shared workspaces",
      "Priority support",
    ],
  },
];

export function UpgradeWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeWorkspace } = useWorkspaces();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Upgrade your workspace</DialogTitle>
          <div className="text-[11.5px] text-text-3 mt-1">
            You've used {activeWorkspace?.monthly_query_count ?? 0} of{" "}
            {activeWorkspace?.monthly_query_limit ?? 1000} queries this month
          </div>
        </DialogHeader>
        <DialogBody className="flex gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 rounded-2xl p-5 relative h-96 ${
                plan.highlighted
                  ? "border-2 border-accent bg-surface-3"
                  : "border border-border-soft bg-surface-3"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-accent-2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-xs font-bold text-text-2 mb-1">
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-2xl font-bold text-text-1">
                  {plan.price}
                </span>
                <span className="text-[11px] text-text-3">/mo</span>
              </div>
              <div className="space-y-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    <span className="text-[11.5px] text-text-2">{f}</span>
                  </div>
                ))}
              </div>
              <button
                className={`w-full mt-4 py-2 rounded-lg text-xs font-bold ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-accent to-accent-2 text-white"
                    : "border border-border-bright text-text-1"
                }`}
              >
                {plan.name === "Free"
                  ? "Current plan"
                  : plan.name === "Team"
                    ? "Talk to sales"
                    : "Upgrade to Pro"}
              </button>
            </div>
          ))}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

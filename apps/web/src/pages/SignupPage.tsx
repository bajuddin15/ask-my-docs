import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentRail, type AgentNode } from "@/components/AgentRail";
import { useSignup } from "@/hooks/useAuth";

const previewNodes: AgentNode[] = [
  {
    key: "router",
    label: "Router Agent",
    meta: "classified intent · 180ms",
    status: "done",
  },
  {
    key: "retriever",
    label: "Retriever Agent",
    meta: "6 chunks · pgvector · 340ms",
    status: "done",
  },
  {
    key: "critic",
    label: "Critic Agent",
    meta: "verifying groundedness…",
    status: "live",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    workspace_name: "",
  });

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate(form, { onSuccess: () => navigate("/onboarding/welcome") });
  };

  return (
    <>
      <Helmet>
        <title>Create your workspace — Ask My Docs</title>
      </Helmet>
      <div className="min-h-screen flex">
        <div className="w-full lg:w-[56%] flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="h-8 w-8 rounded-[9px] bg-gradient-to-br from-accent to-signal flex items-center justify-center">
                <Layers className="h-4 w-4 text-[#0A0D14]" strokeWidth={2.2} />
              </div>
              <span className="font-display font-bold text-text-1">
                Ask My Docs
              </span>
            </div>

            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-text-1">
                Create your workspace
              </h1>
              <p className="text-sm text-text-3 mt-1.5">
                Free — 1,000 queries / month, no card required
              </p>
            </div>

            <Card>
              <CardContent className="pt-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="first_name">First name</Label>
                      <Input
                        id="first_name"
                        value={form.first_name}
                        onChange={update("first_name")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last name</Label>
                      <Input
                        id="last_name"
                        value={form.last_name}
                        onChange={update("last_name")}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      minLength={8}
                      value={form.password}
                      onChange={update("password")}
                      required
                    />
                    <p className="text-[11px] text-text-3 mt-1.5">
                      Minimum 8 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="workspace_name">Workspace name</Label>
                    <Input
                      id="workspace_name"
                      placeholder="Acme Inc."
                      value={form.workspace_name}
                      onChange={update("workspace_name")}
                      required
                    />
                  </div>

                  {signup.isError && (
                    <p className="text-xs text-red-400">
                      {(
                        signup.error as {
                          response?: { data?: { detail?: string } };
                        }
                      )?.response?.data?.detail ??
                        "Something went wrong — try again."}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signup.isPending}
                  >
                    {signup.isPending ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-text-3 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex w-[44%] bg-gradient-to-br from-[#12162A] to-[#0A0D14] border-l border-border-soft items-center px-14 relative overflow-hidden">
          <div className="absolute w-[340px] h-[340px] rounded-full bg-accent/20 blur-3xl -top-20 -right-20" />
          <div className="relative">
            <Badge variant="accent" className="mb-4.5">
              <Sparkles className="h-2.5 w-2.5" />
              MULTI-AGENT RAG
            </Badge>
            <h2 className="font-display text-2xl font-bold text-text-1 leading-snug mb-3.5">
              Every answer, verified by a second agent before it reaches you.
            </h2>
            <p className="text-[13px] text-text-2 leading-relaxed mb-7">
              Router, Retriever and Critic agents work in sequence — so answers
              are grounded in your actual documents, not guessed.
            </p>
            <Card className="p-4.5">
              <AgentRail nodes={previewNodes} />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

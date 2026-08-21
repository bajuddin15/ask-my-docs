import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layers, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate("/") });
  };

  return (
    <>
      <Helmet>
        <title>Sign in — Ask My Docs</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="h-8 w-8 rounded-[9px] bg-gradient-to-br from-accent to-signal flex items-center justify-center">
            <Layers className="h-4 w-4 text-[#0A0D14]" strokeWidth={2.2} />
          </div>
          <span className="font-display font-bold text-text-1">
            Ask My Docs
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-text-1">
              Welcome back
            </h1>
            <p className="text-sm text-text-3 mt-1.5">
              Sign in to keep working with your agents
            </p>
          </div>

          <Card>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {login.isError && (
                  <p className="text-xs text-red-400">
                    Incorrect email or password.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={login.isPending}
                >
                  {login.isPending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-text-3 mt-5">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

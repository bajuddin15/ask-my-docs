import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function OnboardingWelcomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Welcome — Ask My Docs</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-9 right-11 text-xs font-semibold text-text-3"
        >
          Skip setup
        </button>

        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-signal flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(124,108,255,0.4)]">
            <Sparkles className="h-7 w-7 text-[#0A0D14]" fill="currentColor" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-1 mb-2.5">
            Welcome
          </h1>
          <p className="text-sm text-text-3 leading-relaxed mb-8">
            Your workspace comes with three agents already configured — a
            Router, a Retriever, and a Critic that double-checks every answer.
            Let's get your first document indexed.
          </p>
          <Button size="lg" onClick={() => navigate("/onboarding/documents")}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-12">
          <StepDots active={0} />
        </div>
      </div>
    </>
  );
}

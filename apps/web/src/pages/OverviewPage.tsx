import { Helmet } from "react-helmet-async";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export default function OverviewPage() {
  const { activeWorkspace } = useWorkspaces();
  return (
    <>
      <Helmet>
        <title>Overview — Ask My Docs</title>
      </Helmet>
      <div className="p-7">
        <h1 className="font-display text-lg font-bold text-text-1">Overview</h1>
        <p className="text-xs text-text-3 mt-1">
          Analytics for {activeWorkspace?.name ?? "your workspace"} — coming
          soon.
        </p>
      </div>
    </>
  );
}

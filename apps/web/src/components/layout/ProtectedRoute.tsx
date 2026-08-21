import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useMe } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const { isLoading, isError } = useMe();

  if (!token) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-3 text-sm">
        Loading…
      </div>
    );
  }

  if (isError) return <Navigate to="/login" replace />;

  return <Outlet />;
}

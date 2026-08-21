import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Settings — Ask My Docs</title>
      </Helmet>
      <div className="p-7 max-w-lg">
        <h1 className="font-display text-lg font-bold text-text-1 mb-5">
          Settings
        </h1>
        <Button
          variant="danger"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sign out
        </Button>
      </div>
    </>
  );
}

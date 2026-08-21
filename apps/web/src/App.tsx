import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingWelcomePage from "@/pages/OnboardingWelcomePage";
import OnboardingDocumentsPage from "@/pages/OnboardingDocumentsPage";
import ChatPage from "@/pages/ChatPage";
import ChatHistoryPage from "@/pages/ChatHistoryPage";
import DocumentsPage from "@/pages/DocumentsPage";
import OverviewPage from "@/pages/OverviewPage";
import SettingsPage from "@/pages/SettingsPage";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/welcome" element={<OnboardingWelcomePage />} />
        <Route
          path="/onboarding/documents"
          element={<OnboardingDocumentsPage />}
        />

        <Route element={<AppShell />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chats" element={<ChatHistoryPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

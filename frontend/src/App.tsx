import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LandingPage } from "./features/landing/pages/LandingPage";
import { AuthPage } from "./features/auth/pages/AuthPage";
import { OnboardingPage } from "./features/onboarding/pages/OnboardingPage";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";

/**
 * Root Application Router & Global Context Providers.
 */
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<AuthPage defaultMode="login" />} />
          <Route path="/signup" element={<AuthPage defaultMode="signup" />} />

          {/* 4-Step Onboarding Preference Setup */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

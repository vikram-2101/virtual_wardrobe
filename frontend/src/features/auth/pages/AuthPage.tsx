import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthNavbar } from "../../../components/layout/AuthNavbar";
import { AuthCard } from "../components/AuthCard";
import { AuthMode } from "../components/TabSwitcher";
import { useAuth } from "../../../context/AuthContext";

export interface AuthPageProps {
  defaultMode?: AuthMode;
}

/**
 * Full-page Authentication View (Login & Sign Up).
 */
export const AuthPage: React.FC<AuthPageProps> = ({
  defaultMode = "login",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Sync mode with route path or prop changes
  useEffect(() => {
    if (location.pathname.includes("signup")) {
      setMode("signup");
    } else {
      setMode("login");
    }
  }, [location.pathname]);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === "signup") {
      navigate("/signup", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const handleAuthSuccess = () => {
    navigate("/onboarding", { replace: true });
  };

  // If already authenticated, redirect to onboarding or home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/onboarding", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased selection:bg-surface-subtle selection:text-ink-primary">
      {/* 1. Header */}
      <AuthNavbar />

      {/* 2. Main Centered Auth Form */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-3 sm:py-5">
        <AuthCard
          mode={mode}
          onModeChange={handleModeChange}
          onSuccess={handleAuthSuccess}
        />

        {/* 3. Footer Legal Disclaimer */}
        <div className="mt-3 text-center text-[11px] text-ink-muted">
          <p>
            By continuing, you agree to our{" "}
            <a
              href="#terms"
              className="text-ink-secondary hover:text-ink-primary underline underline-offset-2 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#privacy"
              className="text-ink-secondary hover:text-ink-primary underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

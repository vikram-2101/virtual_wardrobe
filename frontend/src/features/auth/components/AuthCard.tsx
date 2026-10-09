import React from "react";
import { TabSwitcher, AuthMode } from "./TabSwitcher";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useAuth } from "../../../context/AuthContext";

export interface AuthCardProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess?: () => void;
}

/**
 * Centered Authentication Card with Tab Switching, Forms, and Google OAuth.
 */
export const AuthCard: React.FC<AuthCardProps> = ({
  mode,
  onModeChange,
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [googleError, setGoogleError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      // In web apps, Google Sign-In can authenticate via mock demo account or Google Identity Services
      await loginWithGoogle({
        email: "alex.fashion@gmail.com",
        name: "Alex Rivera",
        googleId: "g-" + Date.now(),
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setGoogleError(
        err.response?.data?.message || "Google authentication failed.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] sm:max-w-[460px] bg-white rounded-3xl p-5 sm:p-7 shadow-floating border border-border-light/80 flex flex-col items-center text-center transition-all animate-fadeIn">
      {/* 1. Header Title (no extra gap) */}
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight mb-3">
        Welcome to FitMe
      </h2>

      {/* 2. Tab Switcher */}
      <TabSwitcher activeMode={mode} onChange={onModeChange} />

      {/* Google Error Message */}
      {googleError && (
        <div className="w-full mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-left">
          {googleError}
        </div>
      )}

      {/* 3. Active Form */}
      <div className="w-full">
        {mode === "login" ? (
          <LoginForm
            onSuccess={onSuccess}
            onForgotPassword={() => {
              alert("Password reset instructions will be sent to your email.");
            }}
          />
        ) : (
          <SignupForm onSuccess={onSuccess} />
        )}
      </div>

      {/* 4. Social Login */}
      <SocialLoginButtons
        onGoogleClick={handleGoogleLogin}
        loading={googleLoading}
      />

      {/* 5. Footer Switcher Text */}
      <div className="mt-3 text-xs sm:text-sm text-ink-secondary">
        {mode === "login" ? (
          <p>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className="font-bold text-ink-primary hover:underline focus:outline-none ml-1"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className="font-bold text-ink-primary hover:underline focus:outline-none ml-1"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

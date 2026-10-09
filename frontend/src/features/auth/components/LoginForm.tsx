import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";

export interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

/**
 * Sign In Form Component with validation and backend API integration.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-2.5 sm:gap-3 mt-3.5"
    >
      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-left animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Email Input */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="w-4 h-4" />}
        required
        autoComplete="email"
      />

      {/* Password Input */}
      <div className="flex flex-col">
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
          autoComplete="current-password"
        />

        {/* Forgot password link */}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[11px] sm:text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
          >
            Forgot password?
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={loading}
        icon={
          loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          )
        }
        iconPosition="right"
        className="w-full mt-1 font-semibold py-2.5 sm:py-3 rounded-2xl group shadow-sm text-sm"
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  );
};

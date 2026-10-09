import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";

export interface SignupFormProps {
  onSuccess?: () => void;
}

/**
 * Sign Up Registration Form Component with validation and backend API integration.
 */
export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again with a different email.";
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

      {/* Name Input */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<User className="w-4 h-4" />}
        required
        autoComplete="name"
      />

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
      <Input
        label="Password"
        type="password"
        placeholder="Create a strong password (min. 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="w-4 h-4" />}
        required
        autoComplete="new-password"
      />

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
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  );
};

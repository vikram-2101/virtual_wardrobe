import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "./Container";
import { FitMeLogoIcon } from "./Navbar";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export interface AuthNavbarProps {
  rightContent?: React.ReactNode;
  showLogout?: boolean;
}

/**
 * Minimalist Navigation Header for Auth and Onboarding pages.
 */
export const AuthNavbar: React.FC<AuthNavbarProps> = ({
  rightContent,
  showLogout = false,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full bg-canvas/90 backdrop-blur-md border-b border-border-light/40 py-2.5 sm:py-3.5 transition-all select-none sticky top-0 z-30">
      <Container size="xl">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none rounded-xl"
          >
            <div className="p-1.5 rounded-xl transition-transform duration-200 group-hover:scale-105">
              <FitMeLogoIcon className="w-8 h-8 text-ink-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-ink-primary font-sans leading-tight">
                FitMe
              </span>
              <span className="text-[11px] font-medium text-ink-secondary tracking-normal">
                Your Wardrobe, Reimagined
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {rightContent}

            {showLogout && (
              <div className="flex items-center gap-3">
                {/* <span className="hidden sm:inline text-xs font-medium text-ink-secondary">
                  Already have an account?
                </span> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-1.5 text-xs font-semibold text-ink-primary border-border-light hover:border-ink-primary"
                >
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

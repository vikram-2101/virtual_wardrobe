import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, ChevronDown, LogOut } from "lucide-react";
import { Container } from "./Container";
import { Button } from "../common/Button";
import { useAuth } from "../../context/AuthContext";

export interface NavbarProps {
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

/**
 * Minimalist Clothes Hanger Icon matching the FitMe brand logo.
 */
export const FitMeLogoIcon: React.FC<{ className?: string }> = ({
  className = "w-7 h-7 text-ink-primary",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Hanger Hook */}
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v3" />
    {/* Hanger Body */}
    <path d="M2.5 17.5L12 10l9.5 7.5c.3.2.5.6.5 1 0 .8-.7 1.5-1.5 1.5H3.5C2.7 20 2 19.3 2 18.5c0-.4.2-.8.5-1z" />
  </svg>
);

/**
 * Global Header / Navigation Bar.
 */
export const Navbar: React.FC<NavbarProps> = ({
  onLoginClick,
  onGetStartedClick,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Gallery", href: "#gallery" },
    { label: "Resources", href: "#resources" },
  ];

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/login");
    }
  };

  const handleGetStarted = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      navigate("/signup");
    }
  };

  return (
    <header className="w-full bg-canvas/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-light/40 transition-all select-none">
      <Container size="xl">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary rounded-xl"
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors duration-150 relative py-1 hover:after:w-full after:w-0 after:h-[2px] after:bg-ink-primary after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Items: Language, Login/User, Get Started */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language Selector */}
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
            >
              <Globe className="w-4 h-4 text-ink-secondary" />
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold text-ink-primary bg-surface-subtle px-3 py-1.5 rounded-full border border-border-light">
                  Hi, {user.name || user.email.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 text-ink-secondary hover:text-red-600 transition-colors rounded-lg hover:bg-surface-subtle"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Log in CTA */}
                <button
                  type="button"
                  onClick={handleLogin}
                  className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors focus:outline-none"
                >
                  Log in
                </button>

                {/* Primary 'Get Started' Pill Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGetStarted}
                  className="px-5 py-2 font-semibold shadow-sm"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

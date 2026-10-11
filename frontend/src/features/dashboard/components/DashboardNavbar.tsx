import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
} from "lucide-react";
import { FitMeLogoIcon } from "../../../components/layout/Navbar";
import { useAuth } from "../../../context/AuthContext";

export interface DashboardNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userName = user?.name || "Vikram";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-border-light sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* 1. Left Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group focus:outline-none shrink-0"
        >
          <div className="p-1 rounded-xl transition-transform duration-200 group-hover:scale-105">
            <FitMeLogoIcon className="w-7 h-7 sm:w-8 sm:h-8 text-ink-primary" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight text-ink-primary font-sans leading-tight">
              FitMe
            </span>
            <span className="text-[10px] font-medium text-ink-secondary tracking-normal">
              Your Wardrobe, Reimagined
            </span>
          </div>
        </Link>

        {/* 2. Center Search Bar */}
        <div className="flex-1 max-w-lg mx-4 sm:mx-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clothes, outfits, styles..."
              className="w-full bg-surface-subtle text-ink-primary text-xs sm:text-sm rounded-full border border-border-light focus:border-ink-primary/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink-primary/8 pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 transition-all placeholder:text-ink-muted/70 shadow-xs"
            />
          </div>
        </div>

        {/* 3. Right User Profile (No notification icon as requested) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-surface-subtle transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-muted border border-border-light flex items-center justify-center font-bold text-xs text-ink-primary">
              <img
                src="/images/hero/1.jpg"
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="select-none">{userName.charAt(0)}</span>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-ink-primary">
              {userName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-floating border border-border-light py-1.5 z-40 text-left animate-fadeIn">
              <div className="px-3.5 py-2 border-b border-border-light/60">
                <p className="text-xs font-bold text-ink-primary">{userName}</p>
                <p className="text-[11px] text-ink-secondary truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </Link>

              <div className="border-t border-border-light/60 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

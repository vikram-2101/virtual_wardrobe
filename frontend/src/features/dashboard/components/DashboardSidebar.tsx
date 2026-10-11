import React from "react";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Bot,
  Heart,
  User,
  Settings,
  Crown,
  ArrowRight,
} from "lucide-react";
import { SidebarTab } from "../types";

export interface DashboardSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  className?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  className = "",
}) => {
  const mainNavItems: {
    id: SidebarTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      id: "wardrobe",
      label: "My Wardrobe",
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    { id: "tryon", label: "Try On", icon: <Sparkles className="w-4 h-4" /> },
    { id: "stylist", label: "AI Stylist", icon: <Bot className="w-4 h-4" /> },
    {
      id: "outfits",
      label: "Saved Outfits",
      icon: <Heart className="w-4 h-4" />,
    },
    // Note: Explore menu item skipped as requested
  ];

  const bottomNavItems: {
    id: SidebarTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      className={`flex flex-col justify-between select-none h-full ${className}`}
    >
      <div className="space-y-1.5">
        {/* Section label */}
        {/* <p className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/60 px-3.5 mb-3">
          Menu
        </p> */}
        {/* Main Nav Items */}
        <nav className="space-y-0.5">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                  isActive
                    ? "bg-[#EEE8DE] text-ink-primary shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-[#F3EDE4]"
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? "text-ink-primary" : "text-ink-muted"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ink-primary/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider & Secondary Nav */}
        <div className="pt-3 mt-3 border-t border-border-light">
          <p className="text-[10px] font-bold tracking-widest uppercase text-ink-muted/60 px-3.5 mb-2">
            Account
          </p>
          <nav className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                    isActive
                      ? "bg-[#EEE8DE] text-ink-primary shadow-xs"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-[#F3EDE4]"
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? "text-ink-primary" : "text-ink-muted"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ink-primary/60" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Upgrade to Pro Banner at bottom */}
      <div className="p-3.5 rounded-2xl bg-[#FAF5ED] border border-[#EFE5D5] text-left">
        <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Upgrade to Pro</span>
        </div>
        <p className="text-[11px] text-ink-secondary leading-snug mb-3">
          Get more outfit generations, higher quality try-ons, and more.
        </p>
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <span>Upgrade Now</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};

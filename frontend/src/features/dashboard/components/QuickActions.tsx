import React from "react";
import { PlusCircle, UserCheck, Sparkles, ChevronRight } from "lucide-react";

export interface QuickActionsProps {
  onAddClothing: () => void;
  onTryOn: () => void;
  onGenerateOutfit: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddClothing,
  onTryOn,
  onGenerateOutfit,
}) => {
  const actions = [
    {
      id: "add_item",
      title: "Add a Clothing Item",
      subtitle: "Upload and organize your clothes",
      icon: <PlusCircle className="w-5 h-5 text-ink-primary" />,
      onClick: onAddClothing,
    },
    {
      id: "try_on",
      title: "Try On Clothes",
      subtitle: "See how they look on you",
      icon: <UserCheck className="w-5 h-5 text-ink-primary" />,
      onClick: onTryOn,
    },
    {
      id: "generate_outfit",
      title: "Generate Outfit",
      subtitle: "Get AI-powered outfit ideas",
      icon: <Sparkles className="w-5 h-5 text-accent-gold" />,
      onClick: onGenerateOutfit,
    },
  ];

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-5 sm:p-6 text-left">
      <h3 className="text-sm sm:text-base font-bold text-ink-primary mb-4">
        Quick Actions
      </h3>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-border-light hover:border-ink-primary/60 hover:bg-surface-subtle/50 transition-all text-left group focus:outline-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border-light/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-ink-primary group-hover:text-ink-primary">
                  {action.title}
                </h4>
                <p className="text-[11px] text-ink-secondary mt-0.5 leading-tight">
                  {action.subtitle}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

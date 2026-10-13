import React from "react";
import { Loader2, Save } from "lucide-react";

export interface ProfileHeaderProps {
  name: string;
  email: string;
  isSaving: boolean;
  onSave: () => void;
  hasChanges: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  isSaving,
  onSave,
  hasChanges,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Avatar Photo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-subtle border border-border-light flex items-center justify-center text-ink-primary font-bold text-lg sm:text-xl shadow-2xs overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-ink-primary font-sans truncate">
              {name || "Vikram Kumar"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Member
            </span>
          </div>
          <p className="text-xs text-ink-muted truncate mt-0.5">
            {email || "user@example.com"}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

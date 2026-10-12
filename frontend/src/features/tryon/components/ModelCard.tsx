import React from "react";
import { Camera } from "lucide-react";
import { AvatarItem } from "../types";

export interface ModelCardProps {
  avatar: AvatarItem | null;
  heightCm?: number;
  weightKg?: number;
  onChangePhoto: () => void;
  onEditDetails?: () => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  avatar,
  heightCm = 165,
  weightKg = 52,
  onChangePhoto,
}) => {
  const displayImageUrl =
    avatar?.imageUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="bg-white rounded-2xl border border-border-light shadow-card p-2 sm:p-2.5 flex items-center gap-3 shrink-0 animate-fadeIn">
      {/* Thumbnail with larger size utilizing the card space */}
      <div className="w-14 h-18 sm:w-16 sm:h-24 rounded-xl bg-surface-subtle overflow-hidden border border-border-light shadow-2xs shrink-0 relative">
        <img
          src={displayImageUrl}
          alt="Your Model"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Info & Action */}
      <div className="flex flex-col justify-between self-stretch py-0.5 text-left min-w-[140px]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-[13px] font-bold text-ink-primary">
              Your Model
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>

          <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
            {avatar?.heightCm || heightCm} cm • {avatar?.weightKg || weightKg}{" "}
            kg
          </p>
        </div>

        <button
          type="button"
          onClick={onChangePhoto}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border-light hover:border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle text-ink-primary text-[10px] font-semibold shadow-2xs transition-all w-fit cursor-pointer active:scale-95 mt-1"
        >
          <Camera className="w-3 h-3 text-ink-secondary" />
          <span>Change Photo</span>
        </button>
      </div>
    </div>
  );
};

import React from "react";
import { Sparkles } from "lucide-react";

export interface TryOnPreviewCardProps {
  className?: string;
}

/**
 * Polaroid-style snapshot card showcasing the casual side model with Try-on tag.
 */
export const TryOnPreviewCard: React.FC<TryOnPreviewCardProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-polaroid border-2 border-white/90 transition-all duration-300 hover:scale-105 hover:rotate-0 hover:z-30 ${className}`}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] w-32 sm:w-36 lg:w-40 rounded-xl sm:rounded-2xl overflow-hidden bg-surface-subtle shadow-inner">
        <img
          src="/images/hero/side-model.jpg"
          alt="Virtual Try-On Model Preview"
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />

        {/* Floating "Try-on" micro-pill */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-md border border-white/60">
          <Sparkles className="w-2.5 h-2.5 text-[#C4972A] fill-[#F6D878]" />
          <span className="text-[10px] font-bold text-ink-primary tracking-tight">
            Try-on
          </span>
        </div>
      </div>
    </div>
  );
};

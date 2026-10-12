import React from "react";
import {
  Bookmark,
  Download,
  RotateCcw,
  Maximize2,
  Sparkles,
} from "lucide-react";

export interface TryOnResultViewerProps {
  originalImageUrl: string;
  resultImageUrl: string;
  onAddToLookbook?: () => void;
  onDownload?: () => void;
  onTryAgain?: () => void;
  isSaved?: boolean;
}

export const TryOnResultViewer: React.FC<TryOnResultViewerProps> = ({
  originalImageUrl,
  resultImageUrl,
  onAddToLookbook,
  onDownload,
  onTryAgain,
  isSaved = false,
}) => {
  // High-quality fallback images
  const displayOriginal =
    originalImageUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
  const displayResult =
    resultImageUrl ||
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="w-full h-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left flex flex-col justify-between animate-fadeIn">
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-bold text-ink-primary font-sans flex items-center gap-1.5">
          <span>Try-On Result</span>
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
        </h2>

        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          AI Fitting Ready
        </span>
      </div>

      {/* 2. Visual Showcase: Dual View (Original + Try-On Result) */}
      <div className="flex-1 min-h-[360px] sm:min-h-[420px] grid grid-cols-2 gap-3 bg-surface-subtle/30 p-2 sm:p-2.5 rounded-2xl border border-border-light overflow-hidden mb-3.5">
        {/* Left Photo (Original Photo) */}
        <div className="relative rounded-xl overflow-hidden bg-white shadow-2xs h-full">
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-ink-primary shadow-xs border border-white/60">
            Original Photo
          </div>
          <img
            src={displayOriginal}
            alt="Original"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Photo (AI Try-On Result) */}
        <div className="relative rounded-xl overflow-hidden bg-white shadow-2xs h-full">
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-ink-primary/90 text-white backdrop-blur-xs text-[10px] sm:text-xs font-bold shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent-gold" />
            <span>AI Try-On Result</span>
          </div>
          <img
            src={displayResult}
            alt="AI Try-On Result"
            className="w-full h-full object-cover object-center"
          />

          {/* Fullscreen Zoom */}
          <button
            type="button"
            onClick={() => window.open(displayResult, "_blank")}
            className="absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-xs flex items-center justify-center text-ink-primary shadow-xs hover:bg-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Streamlined Action Toolbar */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={onAddToLookbook}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-ink-primary hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.98]"
        >
          <Bookmark className="w-3.5 h-3.5 text-accent-gold" />
          <span>{isSaved ? "Saved to Lookbook" : "Save to Lookbook"}</span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border-light hover:border-border-subtle bg-white text-ink-primary text-xs font-semibold shadow-2xs hover:bg-surface-subtle/50 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-ink-secondary" />
          <span>Download</span>
        </button>

        <button
          type="button"
          onClick={onTryAgain}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-border-light hover:border-border-subtle bg-white text-ink-primary text-xs font-semibold shadow-2xs hover:bg-surface-subtle/50 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-ink-secondary" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};

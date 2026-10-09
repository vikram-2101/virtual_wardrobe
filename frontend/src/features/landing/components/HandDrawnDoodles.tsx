import React from "react";

/**
 * Hand-drawn SVG and typography doodle elements.
 * Adds organic personality and warmth to the fashion editorial hero composition.
 */
export const HandDrawnDoodles: React.FC = () => {
  return (
    <>
      {/* 1. Top-Left Annotation: "Same you, New style" + Curved Directional Arrows */}
      <div className="absolute top-10 left-4 sm:left-12 lg:left-2 xl:left-8 z-20 pointer-events-none select-none -rotate-6">
        <div className="flex flex-col items-center">
          <p className="font-handwriting text-2xl sm:text-3xl text-ink-handwriting font-medium leading-none tracking-wide text-center">
            Same you <br />
            <span className="text-xl sm:text-2xl">New style</span>
          </p>

          {/* Curved SVG Arrow pointing toward center model */}
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-ink-handwriting/70 -mr-16 -mt-1 transform rotate-12"
            viewBox="0 0 60 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10,15 C25,10 45,20 48,40" />
            <path d="M42,32 L48,40 L40,44" />
          </svg>
        </div>
      </div>

      {/* Downward pointing arrow toward the Polaroid snapshot */}
      <div className="absolute top-[48%] left-[28%] sm:left-[32%] lg:left-[22%] z-20 pointer-events-none select-none">
        <svg
          className="w-8 h-10 sm:w-10 sm:h-12 text-ink-handwriting/70 -rotate-45"
          viewBox="0 0 40 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M30,5 C20,15 15,30 12,42" />
          <path d="M6,34 L12,42 L18,36" />
        </svg>
      </div>

      {/* 2. Bottom-Right Annotation: "Your clothes. Infinite possibilities." */}
      <div className="absolute -bottom-6 right-2 sm:right-6 lg:right-4 xl:right-12 z-20 pointer-events-none select-none -rotate-3">
        <div className="flex flex-col items-start">
          <p className="font-handwriting text-2xl sm:text-3xl text-ink-handwriting font-medium leading-snug tracking-wide">
            Your clothes. <br />
            <span className="text-xl sm:text-2xl">Infinite possibilities.</span>
          </p>

          {/* Organic Double Underline Strokes */}
          <svg
            className="w-32 sm:w-40 h-4 text-ink-handwriting/60 mt-0.5"
            viewBox="0 0 160 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M4,7 Q80,14 150,5" />
            <path d="M12,12 Q85,17 140,11" />
          </svg>
        </div>
      </div>
    </>
  );
};

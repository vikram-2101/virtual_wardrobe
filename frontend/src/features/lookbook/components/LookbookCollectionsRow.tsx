import React, { useRef, useState, useEffect, useCallback } from "react";
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { OutfitCollection } from "../types";

export interface LookbookCollectionsRowProps {
  collections: OutfitCollection[];
  selectedCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  onCreateCollection: () => void;
}

export const LookbookCollectionsRow: React.FC<LookbookCollectionsRowProps> = ({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCreateCollection,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const defaultCollections: OutfitCollection[] =
    collections.length > 0
      ? collections
      : [
          {
            id: "col-1",
            name: "Workwear",
            outfitCount: 8,
            coverImageUrl: "/images/hero/2.jpg",
            createdAt: new Date().toISOString(),
          },
          {
            id: "col-2",
            name: "Weekend Casual",
            outfitCount: 12,
            coverImageUrl: "/images/hero/3.jpg",
            createdAt: new Date().toISOString(),
          },
          {
            id: "col-3",
            name: "Summer Vacation",
            outfitCount: 6,
            coverImageUrl: "/images/hero/4.jpg",
            createdAt: new Date().toISOString(),
          },
          {
            id: "col-4",
            name: "Date Night",
            outfitCount: 5,
            coverImageUrl: "/images/hero/1.jpg",
            createdAt: new Date().toISOString(),
          },
        ];

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full relative flex items-center animate-fadeIn">
      {/* Scroll Left Button - only shown if actually scrollable */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={scrollLeft}
          className="flex absolute -left-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-border-light items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Collections Tray */}
      <div
        ref={scrollRef}
        className="w-full flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none px-0.5"
      >
        {/* + New Collection Card */}
        <button
          type="button"
          onClick={onCreateCollection}
          className="w-32 sm:w-36 h-20 sm:h-22 rounded-2xl border-2 border-dashed border-border-subtle hover:border-ink-primary bg-white hover:bg-surface-subtle/50 flex flex-col items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-7 h-7 rounded-full bg-surface-subtle group-hover:bg-ink-primary group-hover:text-white flex items-center justify-center text-ink-secondary transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-ink-primary">
            New Collection
          </span>
        </button>

        {/* Collection Cards */}
        {defaultCollections.map((col) => {
          const isSelected = selectedCollectionId === col.id;

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(isSelected ? null : col.id)}
              className={`w-48 sm:w-56 h-20 sm:h-22 rounded-2xl border bg-white p-2.5 flex items-center gap-3 shrink-0 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
                isSelected
                  ? "bg-[#F4ECE1] border-ink-primary ring-1 ring-ink-primary/20 shadow-xs"
                  : "border-border-light hover:border-border-subtle hover:bg-surface-subtle/30"
              }`}
            >
              {/* Cover Image */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface-subtle overflow-hidden border border-border-light shadow-2xs shrink-0 p-1 flex items-center justify-center">
                <img
                  src={col.coverImageUrl || "/images/hero/1.jpg"}
                  alt={col.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-xs sm:text-sm font-bold text-ink-primary truncate">
                  {col.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-ink-muted">
                  {col.outfitCount} outfits
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button - only shown if actually scrollable */}
      {canScrollRight && (
        <button
          type="button"
          onClick={scrollRight}
          className="flex absolute -right-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-border-light items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

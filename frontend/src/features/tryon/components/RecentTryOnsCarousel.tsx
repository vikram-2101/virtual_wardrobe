import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { TryOnJob } from "../types";

export interface RecentTryOnsCarouselProps {
  recentJobs: TryOnJob[];
  selectedJobId: string | null;
  onSelectJob: (job: TryOnJob) => void;
  onViewAll?: () => void;
}

export const RecentTryOnsCarousel: React.FC<RecentTryOnsCarouselProps> = ({
  recentJobs,
  selectedJobId,
  onSelectJob,
  onViewAll,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  // Mock demo items when user has no previous jobs yet
  const displayItems =
    recentJobs.length > 0
      ? recentJobs
      : [
          {
            id: "demo-1",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date().toISOString(),
          },
          {
            id: "demo-2",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: "demo-3",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
          {
            id: "demo-4",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
          },
          {
            id: "demo-5",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
          },
          {
            id: "demo-6",
            userId: "u1",
            status: "COMPLETED" as const,
            resultImageUrl:
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80",
            createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
          },
        ];

  const formatRelativeTime = (index: number) => {
    if (index === 0) return "Just now";
    if (index === 1) return "2 hours ago";
    if (index === 2) return "1 day ago";
    if (index === 3) return "2 days ago";
    if (index === 4) return "3 days ago";
    return `${index} days ago`;
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-border-light shadow-card p-4 sm:p-5 text-left animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-bold text-ink-primary font-sans">
          Recent Try-Ons
        </h3>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Carousel with Navigation Arrows */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={scrollLeft}
          className="hidden sm:flex absolute -left-2.5 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-border-light items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Cards Row */}
        <div
          ref={scrollRef}
          className="w-full flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none px-0.5 sm:px-3"
        >
          {displayItems.map((job, idx) => {
            const isSelected =
              selectedJobId === job.id || (!selectedJobId && idx === 0);

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-20 h-26 sm:w-24 sm:h-30 rounded-2xl overflow-hidden border-2 bg-surface-subtle p-0.5 transition-all ${
                    isSelected
                      ? "border-ink-primary ring-2 ring-ink-primary/20 shadow-xs scale-[1.02]"
                      : "border-border-light hover:border-border-subtle group-hover:scale-100"
                  }`}
                >
                  <img
                    src={job.resultImageUrl || "/images/hero/1.jpg"}
                    alt="Recent Try-On"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                    isSelected ? "text-ink-primary font-bold" : "text-ink-muted"
                  }`}
                >
                  {formatRelativeTime(idx)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={scrollRight}
          className="hidden sm:flex absolute -right-2.5 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-border-light items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

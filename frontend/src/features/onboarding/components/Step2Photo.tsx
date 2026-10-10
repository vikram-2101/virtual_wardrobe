import React, { useRef, useState } from "react";
import {
  ImagePlus,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Star,
  Plus,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { OnboardingPreferences, UploadedPhoto } from "../types";

export interface Step2PhotoProps {
  preferences: OnboardingPreferences;
  onUpdatePreferences: (updates: Partial<OnboardingPreferences>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

export const Step2Photo: React.FC<Step2PhotoProps> = ({
  preferences,
  onUpdatePreferences,
  onNext,
  onBack,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const photos = preferences.photos || [];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map((file, idx) => ({
      id: `${Date.now()}_${idx}_${file.name}`,
      url: URL.createObjectURL(file),
      isMain: photos.length === 0 && idx === 0,
    }));

    const updated = [...photos, ...newPhotos];
    // If no main photo is selected, set first one as main
    if (!updated.some((p) => p.isMain) && updated.length > 0) {
      updated[0].isMain = true;
    }

    onUpdatePreferences({ photos: updated });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSetMain = (id: string) => {
    const updated = photos.map((p) => ({
      ...p,
      isMain: p.id === id,
    }));
    onUpdatePreferences({ photos: updated });
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = photos.filter((p) => p.id !== id);
    if (updated.length > 0 && !updated.some((p) => p.isMain)) {
      updated[0].isMain = true;
    }
    onUpdatePreferences({ photos: updated });
  };

  return (
    <div className="bg-surface rounded-3xl sm:rounded-4xl border border-border-light shadow-card p-6 sm:p-8 lg:p-10 transition-all">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Step Header */}
      <div className="border-b border-border-light/60 pb-5 mb-6">
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-ink-secondary uppercase">
          STEP 2 OF 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight font-sans mt-1">
          Upload Your Photo
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Choose a clear,{" "}
          <span className="font-semibold text-ink-primary">
            full-body photo
          </span>{" "}
          of yourself. You can upload multiple photos and select your favorite
          one.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-ink-primary bg-surface-subtle"
              : "border-border-subtle hover:border-ink-primary/80 bg-canvas/30 hover:bg-surface-subtle/40"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-border-light shadow-sm flex items-center justify-center text-ink-primary mb-3">
            <ImagePlus className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-bold text-ink-primary">
            Drag and drop your photo here
          </p>
          <p className="text-xs text-ink-secondary mt-0.5">
            or{" "}
            <span className="underline underline-offset-2">
              click to browse
            </span>
          </p>
          <span className="text-[11px] text-ink-muted mt-2 font-medium">
            JPG, PNG, or WEBP • Max 10MB
          </span>
        </div>

        {/* 2. Photo Gallery & Requirements Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Photos list / add slots (7 cols) */}
          <div className="md:col-span-7 flex flex-wrap gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="flex flex-col items-center">
                <div
                  onClick={() => handleSetMain(photo.id)}
                  className={`relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                    photo.isMain
                      ? "border-ink-primary ring-2 ring-ink-primary/20 shadow-md"
                      : "border-border-light hover:border-border-subtle"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt="Uploaded user"
                    className="w-full h-full object-cover"
                  />

                  {/* Top-Right Badge: Star for Main or Delete Button */}
                  {photo.isMain ? (
                    <div
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-primary text-white flex items-center justify-center shadow-md"
                      title="Main photo"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(photo.id, e)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-ink-primary hover:bg-red-500 hover:text-white flex items-center justify-center shadow-sm transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {photo.isMain && (
                  <span className="text-[11px] font-semibold text-ink-primary mt-1.5">
                    Main photo
                  </span>
                )}
              </div>
            ))}

            {/* Add another photo slot button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 sm:w-28 aspect-[3/4] rounded-2xl border-2 border-dashed border-border-subtle hover:border-ink-primary bg-surface-subtle/30 hover:bg-surface-subtle flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-white border border-border-light flex items-center justify-center text-ink-secondary group-hover:text-ink-primary mb-1">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-ink-secondary leading-tight group-hover:text-ink-primary">
                Add another photo
              </span>
              <span className="text-[9px] text-ink-muted mt-0.5">
                (optional)
              </span>
            </button>
          </div>

          {/* Photo Requirements Card (5 cols) */}
          <div className="md:col-span-5 bg-surface-subtle/50 rounded-2xl p-4 border border-border-light text-left text-xs space-y-3">
            <div>
              <h4 className="font-bold text-ink-primary text-xs mb-2">
                Photo requirements
              </h4>
              <ul className="space-y-1.5 text-ink-secondary text-[11px]">
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Full body visible</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>One person only</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Good lighting</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Standing naturally</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Face visible</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Regular clothing</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-border-light/60 pt-2.5">
              <h4 className="font-bold text-ink-primary text-xs mb-1.5">
                Avoid
              </h4>
              <ul className="space-y-1 text-red-600 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Group photos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Cropped body</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Sitting or lying down</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Very dark photos</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                  <span>Heavy filters</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-light/60">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold"
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onNext}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

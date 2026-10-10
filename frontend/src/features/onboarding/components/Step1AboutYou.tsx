import React, { useState } from "react";
import { User, Ruler, Scale, Info, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { FitSelector } from "./FitSelector";
import {
  OnboardingPreferences,
  FitType,
  HeightUnit,
  WeightUnit,
} from "../types";

export interface Step1AboutYouProps {
  preferences: OnboardingPreferences;
  onUpdatePreferences: (updates: Partial<OnboardingPreferences>) => void;
  onNext: () => void;
  onSkip: () => void;
}

export const Step1AboutYou: React.FC<Step1AboutYouProps> = ({
  preferences,
  onUpdatePreferences,
  onNext,
  onSkip,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePreferences({ name: e.target.value });
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePreferences({ height: e.target.value });
  };

  const handleHeightUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdatePreferences({ heightUnit: e.target.value as HeightUnit });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePreferences({ weight: e.target.value });
  };

  const handleWeightUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdatePreferences({ weightUnit: e.target.value as WeightUnit });
  };

  const handleFitChange = (fit: FitType) => {
    onUpdatePreferences({ preferredFit: fit });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-surface rounded-3xl sm:rounded-4xl border border-border-light shadow-card p-6 sm:p-8 lg:p-10 transition-all">
      {/* Step Header */}
      <div className="border-b border-border-light/60 pb-5 mb-6">
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-ink-secondary uppercase">
          STEP 1 OF 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight font-sans mt-1">
          About You
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          This information helps us personalize your experience.
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* 1. Name Field */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="onboarding-name"
            className="block text-xs sm:text-sm font-semibold text-ink-primary"
          >
            Your name
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-ink-muted pointer-events-none flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <input
              id="onboarding-name"
              type="text"
              value={preferences.name}
              onChange={handleNameChange}
              placeholder="e.g. Vikram"
              className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-ink-primary/10 pl-10 pr-4 py-2.5 sm:py-3 transition-all placeholder:text-ink-muted/70"
            />
          </div>
        </div>

        {/* 2. Height & Weight Inputs (2-col grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Height */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="onboarding-height"
              className="block text-xs sm:text-sm font-semibold text-ink-primary"
            >
              Height
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-ink-muted pointer-events-none flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
              <input
                id="onboarding-height"
                type="number"
                value={preferences.height}
                onChange={handleHeightChange}
                placeholder="167"
                className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-ink-primary/10 pl-10 pr-20 py-2.5 sm:py-3 transition-all placeholder:text-ink-muted/70"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
                <select
                  value={preferences.heightUnit}
                  onChange={handleHeightUnitChange}
                  className="h-full bg-surface-subtle text-ink-primary text-xs font-medium rounded-lg px-2 border-0 focus:ring-1 focus:ring-ink-primary focus:outline-none cursor-pointer"
                  aria-label="Height unit"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="onboarding-weight"
              className="block text-xs sm:text-sm font-semibold text-ink-primary"
            >
              Weight{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-ink-muted pointer-events-none flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <input
                id="onboarding-weight"
                type="number"
                value={preferences.weight}
                onChange={handleWeightChange}
                placeholder="65"
                className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-ink-primary/10 pl-10 pr-20 py-2.5 sm:py-3 transition-all placeholder:text-ink-muted/70"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center">
                <select
                  value={preferences.weightUnit}
                  onChange={handleWeightUnitChange}
                  className="h-full bg-surface-subtle text-ink-primary text-xs font-medium rounded-lg px-2 border-0 focus:ring-1 focus:ring-ink-primary focus:outline-none cursor-pointer"
                  aria-label="Weight unit"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Preferred Fit Selection */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-ink-primary">
              Preferred fit{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-ink-muted hover:text-ink-primary transition-colors focus:outline-none"
                aria-label="Fit info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ink-primary text-white text-[11px] rounded-lg shadow-lg z-20 pointer-events-none text-center leading-tight animate-fadeIn">
                  How you usually prefer your shirts and tops to fit your body.
                </div>
              )}
            </div>
          </div>

          <FitSelector
            value={preferences.preferredFit}
            onChange={handleFitChange}
          />
        </div>

        {/* 4. Tip Callout Banner */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FDF8EB]/80 border border-amber-200/60 text-left">
          <div className="p-1 rounded-lg bg-amber-100/60 text-amber-700 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            These details help us suggest outfits that fit your style and body
            type. You can always update them later in your profile.
          </p>
        </div>

        {/* 5. Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-light/60">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs sm:text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors px-2 py-1.5 rounded-lg focus:outline-none"
          >
            Skip for now
          </button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

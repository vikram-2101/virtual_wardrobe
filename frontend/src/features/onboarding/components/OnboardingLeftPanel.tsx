import React from "react";
import {
  Shirt,
  User,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Heart,
} from "lucide-react";
import { StepIndicator } from "./StepIndicator";

export interface OnboardingLeftPanelProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

interface StepContent {
  heading: React.ReactNode;
  subtitle: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  doodleText: React.ReactNode;
}

const STEP_CONTENTS: Record<number, StepContent> = {
  1: {
    heading: (
      <>
        Let’s personalize <br />
        your wardrobe
      </>
    ),
    subtitle:
      "Tell us a little about yourself. This helps us create better outfit suggestions and try-on results.",
    features: [
      {
        icon: <Shirt className="w-5 h-5 stroke-[1.75]" />,
        title: "Better outfit ideas",
        description: "Get suggestions that match your style and fit.",
      },
      {
        icon: <User className="w-5 h-5 stroke-[1.75]" />,
        title: "More accurate try-ons",
        description: "Helps us understand your proportions and preferences.",
      },
      {
        icon: <SlidersHorizontal className="w-5 h-5 stroke-[1.75]" />,
        title: "You’re in control",
        description: "You can change these anytime in your profile.",
      },
    ],
    doodleText: (
      <>
        Same you. <br />
        <span className="text-xl sm:text-2xl ml-4">New possibilities.</span>
      </>
    ),
  },
  2: {
    heading: (
      <>
        Create your <br />
        virtual self
      </>
    ),
    subtitle:
      "Upload a clear full-body photo. We'll use it as your personal try-on image.",
    features: [
      {
        icon: <User className="w-5 h-5 stroke-[1.75]" />,
        title: "See your clothes on you",
        description: "Get realistic try-on results using your own photo.",
      },
      {
        icon: <ShieldCheck className="w-5 h-5 stroke-[1.75]" />,
        title: "Your privacy matters",
        description: "Your photos are secure and only used for try-on results.",
      },
      {
        icon: <Sparkles className="w-5 h-5 stroke-[1.75]" />,
        title: "Better outfit recommendations",
        description: "Helps us suggest outfits that match your body and style.",
      },
    ],
    doodleText: (
      <>
        Same you. <br />
        <span className="text-xl sm:text-2xl ml-4">New outfits.</span>
      </>
    ),
  },
  3: {
    heading: (
      <>
        What’s <br />
        your style?
      </>
    ),
    subtitle:
      "Tell us about your style preferences. This helps us create outfits you’ll actually want to wear.",
    features: [
      {
        icon: <Sparkles className="w-5 h-5 stroke-[1.75]" />,
        title: "Personalized outfits",
        description: "Get outfit ideas that match your taste.",
      },
      {
        icon: <Shirt className="w-5 h-5 stroke-[1.75]" />,
        title: "Discover new looks",
        description: "Explore styles you might love.",
      },
      {
        icon: <Heart className="w-5 h-5 stroke-[1.75]" />,
        title: "You’re in control",
        description: "You can change these anytime in your profile.",
      },
    ],
    doodleText: (
      <>
        Different days, <br />
        <span className="text-xl sm:text-2xl ml-4">different you.</span>
      </>
    ),
  },
  4: {
    heading: <>You’re all set!</>,
    subtitle:
      "Here's a summary of your profile. You can edit this anytime in your settings.",
    features: [
      {
        icon: <Sparkles className="w-5 h-5 stroke-[1.75]" />,
        title: "Personalized outfit ideas",
        description: "Get looks that match your style and fit.",
      },
      {
        icon: <Shirt className="w-5 h-5 stroke-[1.75]" />,
        title: "Realistic try-ons",
        description: "See your clothes on you before you wear them.",
      },
      {
        icon: <Heart className="w-5 h-5 stroke-[1.75]" />,
        title: "A wardrobe that learns",
        description: "The more you use it, the better it gets.",
      },
    ],
    doodleText: (
      <>
        Same you. <br />
        <span className="text-xl sm:text-2xl ml-4">New possibilities.</span>
      </>
    ),
  },
};

export const OnboardingLeftPanel: React.FC<OnboardingLeftPanelProps> = ({
  currentStep,
  onStepClick,
}) => {
  const content = STEP_CONTENTS[currentStep] || STEP_CONTENTS[1];

  return (
    <div className="flex flex-col justify-between h-full space-y-8 py-2">
      {/* Top: 4-Step Progress Indicator */}
      <div>
        <StepIndicator
          currentStep={currentStep}
          onStepClick={onStepClick}
          className="mb-8 sm:mb-10"
        />

        {/* Hero Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-ink-primary font-normal tracking-tight leading-[1.18]">
            {content.heading}
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans max-w-md">
            {content.subtitle}
          </p>
        </div>

        {/* Value Proposition Highlights */}
        <div className="mt-8 sm:mt-10 space-y-5 max-w-md">
          {content.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface border border-border-light shadow-sm flex items-center justify-center shrink-0 text-ink-primary">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink-primary">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5 leading-snug">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Doodle Tagline */}
      <div className="pt-6 relative select-none">
        <div className="inline-flex flex-col -rotate-2">
          <span className="font-handwriting text-2xl sm:text-3xl text-ink-handwriting italic font-medium leading-none">
            {content.doodleText}
          </span>
          <svg
            className="w-28 h-3 text-ink-handwriting/40 ml-4 mt-1"
            viewBox="0 0 120 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4,6 Q60,11 114,4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

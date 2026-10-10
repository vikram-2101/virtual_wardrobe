import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthNavbar } from "../../../components/layout/AuthNavbar";
import { Container } from "../../../components/layout/Container";
import { useAuth } from "../../../context/AuthContext";
import { OnboardingLeftPanel } from "../components/OnboardingLeftPanel";
import { Step1AboutYou } from "../components/Step1AboutYou";
import { Step2Photo } from "../components/Step2Photo";
import { Step3Style } from "../components/Step3Style";
import { Step4Review } from "../components/Step4Review";
import { OnboardingPreferences } from "../types";

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [preferences, setPreferences] = useState<OnboardingPreferences>(() => {
    const saved = localStorage.getItem("fitme_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || user?.name || "Vikram",
          height: parsed.height || "167",
          heightUnit: parsed.heightUnit || "cm",
          weight: parsed.weight || "45",
          weightUnit: parsed.weightUnit || "kg",
          preferredFit: parsed.preferredFit || "regular",
          photos: parsed.photos || [],
          styles: parsed.styles || ["clean_minimal", "casual_relaxed"],
          occasions: parsed.occasions || ["everyday", "college"],
          colors: parsed.colors || ["black", "grey", "blue"],
        };
      } catch (e) {
        console.error("Failed to parse saved preferences", e);
      }
    }
    return {
      name: user?.name || "Vikram",
      height: "167",
      heightUnit: "cm",
      weight: "45",
      weightUnit: "kg",
      preferredFit: "regular",
      photos: [],
      styles: ["clean_minimal", "casual_relaxed"],
      occasions: ["everyday", "college"],
      colors: ["black", "grey", "blue"],
    };
  });

  // Sync user name if updated in auth context
  useEffect(() => {
    if (user?.name && !preferences.name) {
      setPreferences((prev) => ({ ...prev, name: user.name || "Vikram" }));
    }
  }, [user?.name, preferences.name]);

  const updatePreferences = (updates: Partial<OnboardingPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("fitme_preferences", JSON.stringify(next));
      return next;
    });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = () => {
    localStorage.setItem("fitme_preferences", JSON.stringify(preferences));
    localStorage.setItem("fitme_onboarding_completed", "true");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased selection:bg-surface-subtle selection:text-ink-primary">
      {/* 1. Header with Logout option */}
      <AuthNavbar showLogout={true} />

      {/* 2. Main Content Layout */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 px-4 sm:px-6">
        <Container size="xl" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Info & Visual Value Props (~40% width) */}
            <div className="lg:col-span-5 w-full">
              <OnboardingLeftPanel
                currentStep={currentStep}
                onStepClick={(stepId) => setCurrentStep(stepId)}
              />
            </div>

            {/* Right Column: Dynamic Step Form (~60% width - generous space) */}
            <div className="lg:col-span-7 w-full">
              {currentStep === 1 && (
                <Step1AboutYou
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                  onNext={handleNext}
                  onSkip={handleSkip}
                />
              )}

              {currentStep === 2 && (
                <Step2Photo
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {currentStep === 3 && (
                <Step3Style
                  preferences={preferences}
                  onUpdatePreferences={updatePreferences}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}

              {currentStep === 4 && (
                <Step4Review
                  preferences={preferences}
                  onBack={handleBack}
                  onEdit={(stepId) => setCurrentStep(stepId)}
                  onComplete={handleComplete}
                />
              )}
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

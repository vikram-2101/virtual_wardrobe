import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/layout/Navbar";
import { HeroSection } from "../components/HeroSection";

/**
 * Landing Page View.
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleWatchDemo = () => {
    alert("Interactive demo coming soon!");
  };

  const handleViewAllWardrobe = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col antialiased selection:bg-surface-subtle selection:text-ink-primary">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Main Hero Section */}
      <main className="flex-1 flex flex-col">
        <HeroSection
          onGetStarted={handleGetStarted}
          onWatchDemo={handleWatchDemo}
          onViewAllWardrobe={handleViewAllWardrobe}
        />
      </main>
    </div>
  );
};

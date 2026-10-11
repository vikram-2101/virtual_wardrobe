import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { DashboardNavbar } from "../components/DashboardNavbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { QuickActions } from "../components/QuickActions";
import { EmptyWardrobeCallout } from "../components/EmptyWardrobeCallout";
import { WardrobeCategoryGrid } from "../components/WardrobeCategoryGrid";
import { OutfitIdeasGrid } from "../components/OutfitIdeasGrid";
import { WardrobePage } from "../../wardrobe/pages/WardrobePage";
import { AddClothingModal } from "../../wardrobe/components/AddClothingModal";
import { StylistPage } from "../../stylist/pages/StylistPage";
import { TryOnPage } from "../../tryon/pages/TryOnPage";
import { LookbookPage } from "../../lookbook/pages/LookbookPage";
import { ProfilePage } from "../../profile/pages/ProfilePage";
import { listWardrobeItems } from "../../wardrobe/services/wardrobeService";
import { WardrobeItem } from "../../wardrobe/types";
import { SidebarTab, WardrobeCategory } from "../types";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Real wardrobe items from backend
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(false);

  const userName = user?.name || "Vikram Kumar";

  const fetchWardrobe = useCallback(async () => {
    try {
      setLoadingWardrobe(true);
      const items = await listWardrobeItems();
      setWardrobeItems(items);
    } catch (err) {
      console.warn("Could not fetch wardrobe items:", err);
    } finally {
      setLoadingWardrobe(false);
    }
  }, []);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const handleAddClothing = () => {
    setIsAddModalOpen(true);
  };

  const handleTryOn = () => {
    setActiveTab("tryon");
  };

  const handleGenerate = () => {
    setActiveTab("stylist");
  };

  // Dynamic Category Counts from real data
  const dynamicCategories: WardrobeCategory[] = [
    {
      id: "tops",
      name: "Tops",
      itemCount: wardrobeItems.filter((i) => i.category === "TOPS").length,
      imageUrl:
        wardrobeItems.find((i) => i.category === "TOPS")?.images?.[0]
          ?.imageUrl || "/images/hero/3.jpg",
    },
    {
      id: "bottoms",
      name: "Bottoms",
      itemCount: wardrobeItems.filter((i) => i.category === "BOTTOMS").length,
      imageUrl:
        wardrobeItems.find((i) => i.category === "BOTTOMS")?.images?.[0]
          ?.imageUrl || "/images/hero/2.jpg",
    },
    {
      id: "outerwear",
      name: "Outerwear",
      itemCount: wardrobeItems.filter((i) => i.category === "OUTERWEAR").length,
      imageUrl:
        wardrobeItems.find((i) => i.category === "OUTERWEAR")?.images?.[0]
          ?.imageUrl || "/images/hero/5.jpg",
    },
    {
      id: "shoes",
      name: "Shoes",
      itemCount: wardrobeItems.filter((i) => i.category === "SHOES").length,
      imageUrl:
        wardrobeItems.find((i) => i.category === "SHOES")?.images?.[0]
          ?.imageUrl || "/images/hero/4.jpg",
    },
    {
      id: "accessories",
      name: "Accessories",
      itemCount: wardrobeItems.filter((i) => i.category === "ACCESSORIES")
        .length,
      imageUrl:
        wardrobeItems.find((i) => i.category === "ACCESSORIES")?.images?.[0]
          ?.imageUrl || "/images/hero/6.jpg",
    },
  ];

  const hasClothes = wardrobeItems.length > 0;

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased selection:bg-surface-subtle selection:text-ink-primary">
      {/* 1. Dashboard Top Header (Spanning full width) */}
      <DashboardNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Below-navbar layout: sidebar + content side by side, full height */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left Sidebar: flush to viewport left, full height, sticky ── */}
        <aside className="hidden md:flex flex-col w-52 lg:w-56 shrink-0 sticky top-[57px] self-start h-[calc(100vh-57px)] bg-white border-r border-border-light overflow-y-auto">
          <div className="flex-1 flex flex-col px-3 py-5">
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="w-full h-full"
            />
          </div>
        </aside>

        {/* ── Right: main content area ── */}
        <div className="flex-1 min-w-0 flex gap-5 lg:gap-6 px-4 sm:px-6 lg:px-7 py-5 sm:py-3 items-start">
          {/* Main View Area */}
          <main className="flex-1 min-w-0 flex flex-col gap-3">
            {activeTab === "wardrobe" ? (
              /* My Wardrobe Dedicated Page */
              <WardrobePage onOpenAddModal={handleAddClothing} />
            ) : activeTab === "stylist" ? (
              /* AI Stylist Page */
              <StylistPage onTryOnOutfit={() => setActiveTab("tryon")} />
            ) : activeTab === "tryon" ? (
              /* Virtual Try-On Studio Page */
              <TryOnPage />
            ) : activeTab === "outfits" ? (
              /* Saved Outfits & Lookbook Page */
              <LookbookPage
                onNavigateToStylist={() => setActiveTab("stylist")}
                onNavigateToTryOn={() => setActiveTab("tryon")}
              />
            ) : activeTab === "profile" ? (
              /* User Profile & Style Preferences Page */
              <ProfilePage />
            ) : (
              /* Home Overview Tab */
              <>
                {/* Welcome Banner */}
                <WelcomeBanner
                  userName={userName}
                  onTryOn={handleTryOn}
                  onGenerate={handleGenerate}
                />

                {/* Quick Actions for Mobile/Tablet view */}
                <div className="block lg:hidden w-full">
                  <QuickActions
                    onAddClothing={handleAddClothing}
                    onTryOn={handleTryOn}
                    onGenerateOutfit={handleGenerate}
                  />
                </div>

                {/* Main Content: Empty State vs Populated Wardrobe */}
                {!hasClothes && !loadingWardrobe ? (
                  <EmptyWardrobeCallout
                    onAddClothing={handleAddClothing}
                    onExploreDemo={() => {
                      fetchWardrobe();
                    }}
                  />
                ) : (
                  <>
                    {/* Wardrobe Categories Grid */}
                    <WardrobeCategoryGrid
                      categories={dynamicCategories}
                      onSelectCategory={() => setActiveTab("wardrobe")}
                      onAddItem={handleAddClothing}
                      onViewAll={() => setActiveTab("wardrobe")}
                    />

                    {/* Outfit Ideas for You */}
                    <OutfitIdeasGrid
                      onOutfitClick={(id) => console.log("Outfit:", id)}
                      onViewAll={() => setActiveTab("outfits")}
                    />
                  </>
                )}
              </>
            )}
          </main>

          {/* ── Right Sticky Quick Actions column (on Home tab) ── */}
          {activeTab === "home" && (
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[57px] self-start">
              <QuickActions
                onAddClothing={handleAddClothing}
                onTryOn={handleTryOn}
                onGenerateOutfit={handleGenerate}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Global Add Clothing Modal */}
      <AddClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => {
          fetchWardrobe();
        }}
      />
    </div>
  );
};

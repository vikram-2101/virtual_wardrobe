import React, { useState, useEffect, useMemo } from "react";
import { Plus, Shirt, Loader2 } from "lucide-react";
import { Button } from "../../../components/common/Button";
import {
  ClothingCategory,
  WardrobeItem,
  WardrobeCategorySummary,
  SortOption,
} from "../types";
import {
  listWardrobeItems,
  deleteWardrobeItem,
} from "../services/wardrobeService";
import { WardrobeCard } from "../components/WardrobeCard";
import { WardrobeCategoryRow } from "../components/WardrobeCategoryRow";
import { WardrobeFilterBar } from "../components/WardrobeFilterBar";
import { WardrobeStatsCard } from "../components/WardrobeStatsCard";
import { AddClothingModal } from "../components/AddClothingModal";

export interface WardrobePageProps {
  onOpenAddModal?: () => void;
}

export const WardrobePage: React.FC<WardrobePageProps> = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<
    ClothingCategory | "ALL"
  >("ALL");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedSort, setSelectedSort] = useState<SortOption>("newest");

  // Fetch Wardrobe items from backend API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listWardrobeItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch wardrobe items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteItem = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to remove this clothing item?")
    ) {
      return;
    }
    try {
      await deleteWardrobeItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  // Compute Category Counts dynamically from items list
  const categorySummaries: WardrobeCategorySummary[] = useMemo(() => {
    const total = items.length;
    const topsCount = items.filter((i) => i.category === "TOPS").length;
    const bottomsCount = items.filter((i) => i.category === "BOTTOMS").length;
    const outerwearCount = items.filter(
      (i) => i.category === "OUTERWEAR",
    ).length;
    const shoesCount = items.filter((i) => i.category === "SHOES").length;
    const accessoriesCount = items.filter(
      (i) => i.category === "ACCESSORIES",
    ).length;

    // Grab representative image for each category if available
    const getSampleImage = (cat: ClothingCategory) => {
      const match = items.find((i) => i.category === cat);
      return match?.images?.[0]?.imageUrl;
    };

    return [
      {
        category: "ALL",
        label: "All",
        count: total,
        color: "#14171A",
      },
      {
        category: "TOPS",
        label: "Tops",
        count: topsCount,
        imageUrl: getSampleImage("TOPS") || "/images/hero/3.jpg",
        color: "#4F75FF",
      },
      {
        category: "BOTTOMS",
        label: "Bottoms",
        count: bottomsCount,
        imageUrl: getSampleImage("BOTTOMS") || "/images/hero/2.jpg",
        color: "#58A399",
      },
      {
        category: "OUTERWEAR",
        label: "Outerwear",
        count: outerwearCount,
        imageUrl: getSampleImage("OUTERWEAR") || "/images/hero/5.jpg",
        color: "#8E7DBE",
      },
      {
        category: "SHOES",
        label: "Shoes",
        count: shoesCount,
        imageUrl: getSampleImage("SHOES") || "/images/hero/4.jpg",
        color: "#E6B325",
      },
      {
        category: "ACCESSORIES",
        label: "Accessories",
        count: accessoriesCount,
        imageUrl: getSampleImage("ACCESSORIES") || "/images/hero/6.jpg",
        color: "#D97706",
      },
    ];
  }, [items]);

  // Filter & Sort Items
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== "ALL") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (selectedColor) {
      result = result.filter(
        (item) => item.color?.toLowerCase() === selectedColor.toLowerCase(),
      );
    }

    if (selectedSeason) {
      result = result.filter((item) =>
        item.season?.toUpperCase().includes(selectedSeason.toUpperCase()),
      );
    }

    if (selectedStyle) {
      result = result.filter(
        (item) => item.fit?.toLowerCase() === selectedStyle.toLowerCase(),
      );
    }

    // Sort
    result.sort((a, b) => {
      if (selectedSort === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (selectedSort === "oldest") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }
      if (selectedSort === "category") {
        return a.category.localeCompare(b.category);
      }
      if (selectedSort === "color") {
        return (a.color || "").localeCompare(b.color || "");
      }
      return 0;
    });

    return result;
  }, [
    items,
    selectedCategory,
    selectedColor,
    selectedSeason,
    selectedStyle,
    selectedSort,
  ]);

  return (
    <div className="w-full flex flex-col gap-3.5 sm:gap-4 text-left animate-fadeIn">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary font-sans">
            My Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Your personal collection. Organize, manage, and get the most out of
            your clothes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
          >
            Add Clothing Item
          </Button>
        </div>
      </div>

      {/* 2. Category Summary Cards Row (All, Tops, Bottoms, Outerwear, Shoes, Accessories) */}
      <WardrobeCategoryRow
        categories={categorySummaries}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Main Content Area (Grid + Right Stats Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* ── Left Column: Filters + Clothing Grid (8 or 9 cols) ── */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-3">
          {/* Filter Bar */}
          <WardrobeFilterBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />

          {/* Clothing Items Grid */}
          {loading ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin text-ink-primary mb-3" />
              <p className="text-xs sm:text-sm font-medium">
                Loading your wardrobe collection...
              </p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredItems.map((item) => (
                <WardrobeCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          ) : (
            /* Empty State for category/filter */
            <div className="w-full bg-white rounded-3xl border border-border-light p-10 sm:p-14 text-center flex flex-col items-center justify-center my-4 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-border-light flex items-center justify-center text-ink-secondary mb-4">
                <Shirt className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink-primary font-sans mb-1">
                No clothing items found
              </h3>
              <p className="text-xs sm:text-sm text-ink-secondary max-w-sm mb-5">
                {selectedCategory !== "ALL"
                  ? `You haven't added any ${selectedCategory.toLowerCase()} to your wardrobe yet.`
                  : "Your wardrobe is empty. Start adding your favorite clothes to unlock AI styling."}
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
                iconPosition="left"
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-sm"
              >
                Add Your First Item
              </Button>
            </div>
          )}
        </div>

        {/* ── Right Column: Wardrobe Stats Card (4 or 3 cols) ── */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-[72px] space-y-5">
          <WardrobeStatsCard
            categories={categorySummaries}
            totalItems={items.length}
          />
        </div>
      </div>

      {/* Add Clothing Modal */}
      <AddClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => {
          fetchItems();
        }}
      />
    </div>
  );
};

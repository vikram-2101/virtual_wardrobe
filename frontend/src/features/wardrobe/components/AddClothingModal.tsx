import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Sparkles,
  Plus,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { ClothingCategory } from "../types";
import {
  createWardrobeItem,
  suggestClothingMetadata,
} from "../services/wardrobeService";

export interface AddClothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

const CATEGORY_OPTIONS: { id: ClothingCategory; label: string }[] = [
  { id: "TOPS", label: "Tops" },
  { id: "BOTTOMS", label: "Bottoms" },
  { id: "OUTERWEAR", label: "Outerwear" },
  { id: "SHOES", label: "Shoes" },
  { id: "ACCESSORIES", label: "Accessories" },
  { id: "DRESSES", label: "Dresses" },
];

const SUBCATEGORY_MAP: Record<ClothingCategory, string[]> = {
  TOPS: ["T-Shirt", "Sweater", "Shirt", "Hoodie", "Polo", "Tank Top", "Blouse"],
  BOTTOMS: [
    "Jeans",
    "Trousers",
    "Cargo Pants",
    "Shorts",
    "Sweatpants",
    "Skirt",
  ],
  OUTERWEAR: [
    "Jacket",
    "Overcoat",
    "Blazer",
    "Trench Coat",
    "Cardigan",
    "Vest",
  ],
  SHOES: ["Sneakers", "Boots", "Loafers", "Dress Shoes", "Sandals", "Slides"],
  ACCESSORIES: ["Cap / Hat", "Watch", "Sunglasses", "Belt", "Bag", "Scarf"],
  DRESSES: ["Casual Dress", "Formal Gown", "Maxi Dress", "Mini Dress"],
};

const COLOR_OPTIONS = [
  { name: "Beige", hex: "#E6DEC8" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy Blue", hex: "#1E2D4A" },
  { name: "Light Blue", hex: "#9BC4E2" },
  { name: "Olive Green", hex: "#556B2F" },
  { name: "Forest Green", hex: "#2E5B37" },
  { name: "Gray", hex: "#8A929A" },
  { name: "Brown", hex: "#6E472A" },
  { name: "Tan / Camel", hex: "#C49A6C" },
  { name: "Burgundy / Red", hex: "#7B1113" },
  { name: "Pastel Pink", hex: "#F3C5CB" },
  { name: "Yellow", hex: "#E9C46A" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const STYLE_OPTIONS = [
  "Casual",
  "Smart Casual",
  "Formal",
  "Streetwear",
  "Minimalist",
  "Sporty",
  "Vintage",
];
const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All-Season"];

export const AddClothingModal: React.FC<AddClothingModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
}) => {
  // Image states
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // Form states
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>("TOPS");
  const [subcategory, setSubcategory] = useState("Sweater");
  const [color, setColor] = useState("Beige");
  const [size, setSize] = useState("M");
  const [brand, setBrand] = useState("");
  const [material, setMaterial] = useState("Cotton Knit");
  const [style, setStyle] = useState("Casual");
  const [season, setSeason] = useState("Spring");
  const [tags, setTags] = useState<string[]>(["Striped", "Knit"]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(
    "Soft and comfortable. Goes well with jeans.",
  );

  // AI & Submission loading states
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Front Image selection & trigger AI Metadata extraction
  const handleFrontImageSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setFrontFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFrontPreview(objectUrl);
    setErrorMessage(null);

    // Auto-populate item name if blank
    if (!itemName) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setItemName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Trigger AI suggestion
    try {
      setIsAiSuggesting(true);
      setAiSuccessMessage(null);
      const aiResult = await suggestClothingMetadata(file);

      if (aiResult) {
        if (aiResult.category) setCategory(aiResult.category);
        if (aiResult.subCategory) {
          setSubcategory(aiResult.subCategory);
          setItemName(
            `${aiResult.color || ""} ${aiResult.subCategory}`.trim() ||
              itemName,
          );
        }
        if (aiResult.color) setColor(aiResult.color);
        if (aiResult.season) {
          const matchedSeason = SEASONS.find(
            (s) => s.toUpperCase() === aiResult.season?.toUpperCase(),
          );
          if (matchedSeason) setSeason(matchedSeason);
        }
        if (aiResult.detectedTags && aiResult.detectedTags.length > 0) {
          setTags((prev) =>
            Array.from(new Set([...prev, ...aiResult.detectedTags!])),
          );
        }

        setAiSuccessMessage("✨ AI Auto-tagged category, color, and season!");
        setTimeout(() => setAiSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.warn("AI metadata suggestion skipped or timed out:", err);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleBackImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setBackFile(file);
    setBackPreview(URL.createObjectURL(file));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontFile) {
      setErrorMessage(
        "Please upload at least one front photo of the clothing item.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("frontImage", frontFile);
      if (backFile) {
        formData.append("backImage", backFile);
      }
      formData.append("category", category);
      formData.append("subcategory", subcategory || itemName);
      formData.append("color", color);
      formData.append("fit", style);
      formData.append("material", material);
      formData.append("season", season.toUpperCase().replace("-", "_"));

      // Include tags & notes
      const fullNotes = [
        notes,
        brand ? `Brand: ${brand}` : "",
        size ? `Size: ${size}` : "",
        tags.length > 0 ? `Tags: ${tags.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      formData.append("notes", fullNotes);

      await createWardrobeItem(formData);

      if (onItemAdded) {
        onItemAdded();
      }
      onClose();
    } catch (err: any) {
      console.error("Failed to add clothing item:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to upload clothing item. Please check your image and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl sm:rounded-4xl shadow-floating border border-border-light overflow-hidden text-left my-auto max-h-[95vh] flex flex-col">
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-2 border-b border-border-light/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-primary font-sans">
              Add a Clothing Item
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
              Upload a photo and add some details to organize your wardrobe.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-subtle hover:bg-surface-muted text-ink-secondary hover:text-ink-primary flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ── LEFT COLUMN: Image Uploader & Preview ── */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Main Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFrontImageSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative w-full aspect-square rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group ${
                  frontPreview
                    ? "border-border-light bg-surface-subtle/30"
                    : "border-border-subtle bg-surface-subtle/40 hover:border-ink-primary hover:bg-surface-subtle"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFrontImageSelect(e.target.files[0]);
                    }
                  }}
                />

                {frontPreview ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                    <img
                      src={frontPreview}
                      alt="Front preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold rounded-2xl">
                      Click to change photo
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-border-light shadow-xs flex items-center justify-center text-ink-secondary group-hover:text-ink-primary group-hover:scale-105 transition-all mb-3">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-ink-primary">
                      Drag &amp; drop an image here
                    </span>
                    <span className="text-[11px] text-ink-secondary mt-0.5">
                      or click to select
                    </span>
                    <span className="text-[10px] text-ink-muted mt-2">
                      Supports JPG, PNG, WebP (max 10MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Thumbnails Row */}
              <div className="flex items-center gap-3">
                {/* Main Front Photo Thumbnail */}
                {frontPreview && (
                  <div className="relative w-20 h-20 rounded-2xl border-2 border-ink-primary overflow-hidden bg-white shrink-0 group">
                    <img
                      src={frontPreview}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-ink-primary text-white text-[9px] font-bold uppercase tracking-wider">
                      Main
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFrontFile(null);
                        setFrontPreview(null);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Back / Secondary Photo Thumbnail */}
                {backPreview ? (
                  <div className="relative w-20 h-20 rounded-2xl border border-border-light overflow-hidden bg-white shrink-0 group">
                    <img
                      src={backPreview}
                      alt="Back"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-surface-muted text-ink-secondary text-[9px] font-bold uppercase tracking-wider">
                      Back
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBackFile(null);
                        setBackPreview(null);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => backFileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-border-light hover:border-ink-primary bg-surface-subtle/30 hover:bg-surface-subtle transition-all flex flex-col items-center justify-center text-ink-secondary hover:text-ink-primary shrink-0"
                  >
                    <Plus className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-semibold text-center leading-tight">
                      Add back photo
                    </span>
                  </button>
                )}

                <input
                  ref={backFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleBackImageSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* AI Auto-Tag Feedback Message */}
              {isAiSuggesting && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    AI is auto-detecting category, colors &amp; style...
                  </span>
                </div>
              )}

              {aiSuccessMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: Clothing Details Form ── */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-ink-primary">
                Clothing Details
              </h3>

              {/* Item Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink-primary">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Striped Knit Sweater"
                  className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-ink-primary/5 transition-all"
                />
                <span className="text-[11px] text-ink-muted">
                  Give a short, clear name
                </span>
              </div>

              {/* Category & Subcategory Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as ClothingCategory;
                      setCategory(newCat);
                      setSubcategory(SUBCATEGORY_MAP[newCat]?.[0] || "");
                    }}
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    {SUBCATEGORY_MAP[category]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color & Size Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary pl-9 pr-3.5 py-2.5 focus:outline-none transition-all cursor-pointer"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {/* Visual Color Dot indicator */}
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-black/10 shadow-xs pointer-events-none"
                      style={{
                        backgroundColor:
                          COLOR_OPTIONS.find((c) => c.name === color)?.hex ||
                          "#ccc",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand & Material Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Brand (optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. H&M, Zara, Uniqlo"
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Material / Fabric
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. Cotton Knit"
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Style & Season Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary px-3.5 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    {STYLE_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-ink-primary">
                    Season
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {SEASONS.map((s) => {
                      const isSelected = season === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSeason(s)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-accent-dark text-white font-semibold shadow-xs"
                              : "bg-surface-subtle text-ink-secondary hover:text-ink-primary hover:bg-surface-muted"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tags (optional) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink-primary">
                  Tags (optional)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-border-light focus-within:border-ink-primary transition-all">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-subtle text-ink-primary text-xs font-medium"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-ink-muted hover:text-ink-primary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={
                      tags.length === 0 ? "Add tags (press Enter)" : ""
                    }
                    className="flex-1 min-w-[120px] bg-transparent text-xs sm:text-sm text-ink-primary focus:outline-none px-1"
                  />
                </div>
              </div>

              {/* Notes (optional) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink-primary">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Soft and comfortable. Goes well with jeans."
                  className="w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border border-border-light focus:border-ink-primary p-3 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border-light hover:bg-surface-subtle text-ink-primary text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              icon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
            >
              {isSubmitting ? "Uploading..." : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

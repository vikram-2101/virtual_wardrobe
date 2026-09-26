Viewed response.md:1-800
Viewed response.md:801-850

# Final Product & UX Design Specification: FitMe AI Virtual Wardrobe

Combining the backend architecture from [`AGENT.md`](file:///c:/Users/Vikram%20Kumar/Desktop/Projects/virtual_wardrobe/docs/AGENT.md), [`API.md`](file:///c:/Users/Vikram%20Kumar/Desktop/Projects/virtual_wardrobe/docs/API.md), [`SRD.md`](file:///c:/Users/Vikram%20Kumar/Desktop/Projects/virtual_wardrobe/docs/SRD.md), and the UX insights from [`docs/response.md`](file:///c:/Users/Vikram%20Kumar/Desktop/Projects/virtual_wardrobe/docs/response.md), here is the finalized design specification for the dashboard and all user actions.

---

## 1. Core Mental Model & Product Journey

FitMe has **two distinct AI layers**:
1. **Rule/AI Outfit Generation (Fast, free)**: Combines your actual clothes into styled sets (Tops + Bottoms + Shoes) based on occasions or categories.
2. **Virtual Try-On VTON (GPU inference, quota-limited to 5/day)**: Takes a selected garment or outfit and photorealistically renders it onto your canonical 2D avatar.

```text
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   MY WARDROBE   │  ───►  │    AI STYLIST    │  ───►  │     TRY ON      │
│  "What I own"   │        │"What to wear"    │        │ "How it looks   │
│ (Garment photos)│        │ (Outfit combos)  │        │   on my body"   │
└─────────────────┘        └──────────────────┘        └─────────────────┘
                                                                │
                                                                ▼
                                                       ┌─────────────────┐
                                                       │  SAVED OUTFITS  │
                                                       │"Looks I loved"  │
                                                       └─────────────────┘
```

---

## 2. Finalized Sidebar Structure

```text
MENU
  ⌂  Home            (Overview, stats, recent try-ons, outfit ideas)
  👕 My Wardrobe      (All clothes, category filters, upload, edit/delete)
  ✨ AI Stylist       (Occasion & category outfit generation studio)
  🪞 Try On          (VTON workspace: single-item & outfit try-on)
  ❤️ Saved Outfits    (Liked, saved, and manual outfit library)

ACCOUNT
  👤 Profile & Avatar (Body info, measurements, canonical avatar photo)
  ⚙️ Settings         (Preferences, account, theme)

FOOTER
  ⚡ Quota Badge      (e.g., "3/5 Try-Ons Left Today")
  👑 Upgrade to Pro   (Modal with unlimited try-on benefits)
```

---

## 3. Finalized Dashboard Layout & Wireframe

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ 👕 FitMe         🔍 Search clothes, outfits...               ⚡ 5/5 Left   👤 Vikram ▼ │
├──────────────┬────────────────────────────────────────────────────────┬───────────────┤
│              │                                                        │ QUICK ACTIONS │
│ ⌂ Home       │  Good evening, Vikram Kumar 👋                          │               │
│              │  Your wardrobe, powered by AI.                         │ ＋ Add Clothes │
│ 👕 Wardrobe   │  [ ✨ Generate an Outfit ]   [ 🪞 Try Something On ]   │ 🪞 Try On     │
│              ├────────────────────────────────────────────────────────┤ ✨ AI Stylist │
│ ✨ AI Stylist │                                                        │               │
│              │  Your Wardrobe                              View all → │ ┌───────────┐ │
│ 🪞 Try On     │  [Tops 12] [Bottoms 6] [Outer 4] [Shoes 5] [Access 3] +│ │ Canonical │ │
│              ├────────────────────────────────────────────────────────┤ │ Avatar    │ │
│ ❤️ Saved     │                                                        │ │ Preview   │ │
│              │  Outfit Ideas for You                       View all → │ └───────────┘ │
│ ──────────── │  (Combinations of your clothes with Try On CTA)        │               │
│ 👤 Profile   │  [ Outfit Card 1 ]  [ Outfit Card 2 ]  [ Outfit Card 3 ]│               │
│ ⚙️ Settings  │                                                        │               │
│              ├────────────────────────────────────────────────────────┤               │
│ ⚡ 5/5 Quota  │                                                        │               │
│ 👑 Upgrade   │  Recent Try-Ons (VTON Results)              View all → │               │
│              │  [ VTON Result 1 ]  [ VTON Result 2 ]  [ VTON Result 3 ]│               │
└──────────────┴────────────────────────────────────────────────────────┴───────────────┘
```

---

## 4. Button-by-Button Functionality & API Contract

### A. Top Navigation (`DashboardNavbar`)
| UI Element | Label | Target Action / UX Flow | Backing API |
| :--- | :--- | :--- | :--- |
| **Logo** | `FitMe` | Returns to Dashboard `home` tab. | — |
| **Search Input** | `Search clothes, outfits...` | Client-side filter across loaded wardrobe items & outfits. | Client state |
| **Quota Pill** | `⚡ 3/5 Try-Ons` | Shows remaining daily VTON limit; clicks to view quota info modal. | Config / Store |
| **User Profile Dropdown** | `Vikram Kumar ▼` | Opens dropdown: **Profile**, **Avatar Photo**, **Settings**, **Log Out**. | `logout()` clears token |

---

### B. Welcome Banner (`WelcomeBanner`)
| Button | Variant | Target Action | Destination / API |
| :--- | :--- | :--- | :--- |
| **"Generate an Outfit"** | Primary (Dark) | Opens the **AI Stylist** tab or generation modal to create a new styled set. | Switches to `stylist` tab |
| **"Try Something On"** | Secondary (Outline) | Opens the **Try-On Studio** tab to pick an item/outfit to test on the canonical avatar. | Switches to `tryon` tab |

---

### C. Quick Actions Card (`QuickActions`)
| Action Card | Icon | UX Flow & Modal Behavior | Backing API |
| :--- | :--- | :--- | :--- |
| **Add Clothing** | `＋` | Opens **Upload Garment Modal**: <br>1. Drop front (and optional back) photo.<br>2. Click *"AI Suggest"* for automatic tag detection.<br>3. Confirm category, color, fit, season.<br>4. Click *"Save"*. | `POST /api/wardrobe/suggest-metadata`<br>`POST /api/wardrobe/items` |
| **Try Something On** | `🪞` | Opens **Quick Try-On Drawer**: <br>1. Select any garment from wardrobe or saved outfit.<br>2. Previews against active canonical avatar.<br>3. Submits VTON job with progress indicator. | `POST /api/try-ons/single-item` or<br>`POST /api/try-ons` |
| **Create an Outfit** | `✨` | Opens **Quick Stylist Drawer**: <br>Choose Occasion (*Casual, Work, Party, Summer*) → Click *"Generate"*. | `POST /api/outfits/generate-automatic` |

---

### D. "Your Wardrobe" Section (`WardrobeCategoryGrid`)
| Action Element | UX Behavior | Backing API |
| :--- | :--- | :--- |
| **"View all →" Link** | Navigates to `wardrobe` tab with all items displayed. | `GET /api/wardrobe/items` |
| **Category Cards** (*Tops, Bottoms, Outerwear, Shoes, Accessories*) | Counts calculated dynamically from item list (`items.filter(i => i.category === 'TOPS').length`). Clicking a card opens `wardrobe` tab pre-filtered to that category. | `GET /api/wardrobe/items?category=...` |
| **"+ Add Item" Card** | Direct trigger for the **Upload Garment Modal**. | `POST /api/wardrobe/items` |

---

### E. "Outfit Ideas for You" Section (`OutfitIdeasGrid`)
*Displays flat-lay garment combinations (Top + Bottom + Shoes thumbnails), not pre-rendered VTON images.*

| Button / Element | UX Behavior | Backing API |
| :--- | :--- | :--- |
| **"View all →" Link** | Navigates to `outfits` (Saved Outfits) tab. | `GET /api/outfits` |
| **Heart Icon (`♡` / `❤️`)** | Instantly toggles favorite status on the outfit. | `PUT /api/outfits/{id}/favorite` |
| **"Try On" CTA on Card** | Submits outfit for virtual try-on with canonical avatar. | `POST /api/try-ons` |
| **Card Click** | Opens **Outfit Detail Modal**: <br>• View all piece photos & metadata.<br>• **"Try On This Outfit"** (`POST /api/try-ons`)<br>• **"Regenerate"** (`POST /api/outfits/{id}/regenerate`)<br>• **"Save Outfit"** (`PUT /api/outfits/{id}/save`)<br>• **"Delete Outfit"** (`DELETE /api/outfits/{id}`) | `/api/outfits/*` |

---

### F. NEW SECTION: "Recent Try-Ons" Section (`RecentTryOnsGrid`)
*Displays the user's completed AI virtual try-on results.*

| Button / Element | UX Behavior | Backing API |
| :--- | :--- | :--- |
| **"View all →" Link** | Navigates to `tryon` tab history list. | `GET /api/try-ons` |
| **Try-On Result Card** | Shows generated avatar image wearing the outfit + relative timestamp (*"Today", "Yesterday"*). | `GET /api/try-ons` |
| **Result Card Click** | Opens **Try-On Result Modal**: <br>• Full-resolution generated image view.<br>• Breakdown of items worn.<br>• **"Save Outfit"** (`PUT /api/outfits/{id}/save`)<br>• **"Download Image"** / **"Share"** | `GET /api/try-ons/{id}` |

---

### G. Empty Wardrobe State (`EmptyWardrobeCallout`)
| Button | UX Behavior |
| :--- | :--- |
| **"Add Your First Item"** | Opens the Upload Garment Modal. |
| **"View Sample Wardrobe"** | Seeds mock/sample clothing items so the user can immediately test outfit generation & try-on. |

---

## 5. Summary of Key Decisions

1. **No VTON on unrequested outfits**: Outfit cards display actual clothing item thumbnails (flat-lay style), preserving daily AI GPU quota and keeping dashboard load instant.
2. **Dynamic Category Counts**: Calculated client-side from `GET /api/wardrobe/items` (no extra backend endpoint needed).
3. **Explicit 2-Step Try-On**: Generate outfit first $\rightarrow$ user reviews combination $\rightarrow$ clicks *"Try On"* to run VTON.
4. **Recent Try-Ons Added**: Gives users instant visual feedback of their generated try-on history on the dashboard.
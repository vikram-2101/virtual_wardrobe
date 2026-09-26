# Database Documentation

## Overview
- **Database Engine**: PostgreSQL 16
- **Database Name**: `wardrobe`
- **Default Port**: 5432
- **Persistence Owner**: Spring Boot Backend (via Spring Data JPA / Hibernate)

> **Rule**: Python AI service does NOT directly access or write to PostgreSQL. All persistence is managed by Spring Boot.

---

## Entity Schema

All primary entities inherit from `BaseEntity` which defines:
- `id` (`UUID`, Primary Key, auto-generated)
- `created_at` (`TIMESTAMP WITH TIME ZONE`, auto-generated)
- `updated_at` (`TIMESTAMP WITH TIME ZONE`, auto-generated)

### 1. `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Unique user identifier |
| `email` | `VARCHAR(150)` | UNIQUE, NOT NULL | User email address |
| `password_hash` | `VARCHAR(255)` | NOT NULL | BCrypt hashed password |
| `role` | `VARCHAR(20)` | NOT NULL | `ROLE_USER`, `ROLE_ADMIN` |
| `enabled` | `BOOLEAN` | NOT NULL | Account active status |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 2. `user_profiles` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Profile identifier |
| `user_id` | `UUID` | FK (users.id), UNIQUE, NOT NULL | 1:1 relationship with User |
| `name` | `VARCHAR(100)` | NULL | User display name |
| `height` | `DOUBLE PRECISION` | NULL | Height in centimeters |
| `weight` | `DOUBLE PRECISION` | NULL | Weight in kilograms |
| `gender` | `VARCHAR(30)` | NULL | Gender identity |
| `style_preferences` | `VARCHAR(500)` | NULL | User style preferences |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 3. `avatars` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Avatar identifier |
| `user_id` | `UUID` | FK (users.id), NOT NULL | Owning user |
| `image_key` | `VARCHAR(500)` | NOT NULL | S3 object key (`avatars/{userId}/{avatarId}.ext`) |
| `image_url` | `VARCHAR(1000)` | NULL | Accessible/signed image URL |
| `source` | `VARCHAR(50)` | NOT NULL | `UPLOAD`, `PROCESSED` |
| `is_canonical` | `BOOLEAN` | NOT NULL | Whether selected as primary avatar |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 4. `wardrobe_items` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Garment item identifier |
| `user_id` | `UUID` | FK (users.id), NOT NULL | Owning user |
| `category` | `VARCHAR(50)` | NOT NULL | e.g. T-Shirt, Jeans, Jacket, Shoes |
| `category` | `VARCHAR(50)` | NOT NULL | e.g. `T-SHIRT`, `JEANS`, `JACKET`, `HOODIE`, `SHOES` |
| `subcategory` | `VARCHAR(50)` | NULL | Specific sub-type |
| `color` | `VARCHAR(50)` | NOT NULL | Primary color |
| `pattern` | `VARCHAR(50)` | NULL | Solid, Striped, Graphic, etc. |
| `fit` | `VARCHAR(50)` | NULL | Slim, Regular, Oversized, etc. |
| `material` | `VARCHAR(100)` | NULL | Cotton, Denim, Silk, etc. |
| `season` | `VARCHAR(50)` | NULL | Summer, Winter, All-season |
| `notes` | `VARCHAR(500)` | NULL | User notes |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 5. `wardrobe_images` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Image record identifier |
| `wardrobe_item_id` | `UUID` | FK (wardrobe_items.id), NOT NULL | Associated wardrobe item |
| `image_key` | `VARCHAR(500)` | NOT NULL | S3 object key |
| `image_key` | `VARCHAR(500)` | NOT NULL | S3 object key (`wardrobe/{userId}/{itemId}/{type}_{uuid}.ext`) |
| `image_url` | `VARCHAR(1000)` | NULL | Accessible URL |
| `image_type` | `VARCHAR(30)` | NOT NULL | `FRONT`, `BACK`, `PROCESSED`, `SEGMENTED` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 6. `outfits` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Outfit identifier |
| `user_id` | `UUID` | FK (users.id), NOT NULL | Owning user |
| `name` | `VARCHAR(100)` | NULL | Optional outfit name |
| `source` | `VARCHAR(50)` | NOT NULL | `MANUAL`, `CONTROLLED_GENERATION`, `AUTOMATIC_RULE_ENGINE` |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'SAVED' | `SAVED`, `REJECTED`, `DRAFT`, `ARCHIVED` |
| `occasion` | `VARCHAR(50)` | NULL | Occasion tag (e.g. `CASUAL`, `FORMAL`, `WINTER`, `PARTY`, `MINIMAL`) |
| `is_favorite` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Favorited flag |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

**Indexes**:
- `idx_outfits_user_created`: `(user_id, created_at DESC)`
- `idx_outfits_user_status`: `(user_id, status)`
- `idx_outfits_user_fav`: `(user_id, is_favorite)`

### 7. `outfit_items` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Join record identifier |
| `outfit_id` | `UUID` | FK (outfits.id), NOT NULL | Associated outfit |
| `wardrobe_item_id` | `UUID` | FK (wardrobe_items.id), NOT NULL | Associated clothing item |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

### 8. `try_on_jobs` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | Job identifier |
| `user_id` | `UUID` | FK (users.id), NOT NULL | Owning user |
| `outfit_id` | `UUID` | FK (outfits.id), NOT NULL | Target outfit (always Outfit abstraction) |
| `avatar_id` | `UUID` | FK (avatars.id), NULL | Avatar used for try-on |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PENDING' | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `result_image_key` | `VARCHAR(500)` | NULL | Generated image S3 key (`tryon/{userId}/{jobId}.jpg`) |
| `result_image_url` | `VARCHAR(1000)` | NULL | Generated image URL |
| `error_code` | `VARCHAR(100)` | NULL | Error classification code |
| `error_message` | `VARCHAR(1000)` | NULL | Error details |
| `started_at` | `TIMESTAMPTZ` | NULL | Timestamp inference started |
| `completed_at` | `TIMESTAMPTZ` | NULL | Timestamp job resolved |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Record update timestamp |

**Indexes**:
- `idx_try_on_jobs_user_id`: `(user_id)`
- `idx_try_on_jobs_outfit_id`: `(outfit_id)`
- `idx_try_on_jobs_status`: `(status)`

---

## Log of Changes

| Date | Phase | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-09-15 | Phase 0 | Initial database container configuration in `docker-compose.yml` | AI Assistant |
| 2026-09-15 | Phase 1 & 2 | Defined all JPA domain entities with UUID PKs: `User`, `UserProfile`, `Avatar`, `WardrobeItem`, `WardrobeImage`, `Outfit`, `OutfitItem`, `TryOnJob` | AI Assistant |
| 2026-09-15 | Phase 3 | Implemented `AvatarRepository` queries and S3 key management | AI Assistant |
| 2026-09-15 | Phase 4 | Implemented `WardrobeItemRepository` queries (`findByUserIdOrderByCreatedAtDesc`, `findByUserIdAndCategoryIgnoreCaseOrderByCreatedAtDesc`, `findByIdAndUserId`), `WardrobeImage` cascade management, and S3 cleanup | AI Assistant |
| 2026-09-16 | Phase 6 | Implemented `OutfitRepository` (`findAllByUserIdOrderByCreatedAtDesc`, `findByIdAndUserId`) and `OutfitItemRepository` (`findAllByOutfitId`, `deleteAllByOutfitId`) with orphan removal cascading | AI Assistant |
| 2026-09-16 | Phase 7 | Added rule-based generation support to `OutfitRepository` and `outfits` table | AI Assistant |
| 2026-09-16 | Phase 8 | Added `status` (`SAVED`, `REJECTED`, `DRAFT`, `ARCHIVED`), `occasion`, composite indexes (`idx_outfits_user_status`, `idx_outfits_user_fav`), and repository filtering methods | AI Assistant |
| 2026-09-16 | Phase 9 | Implemented `TryOnJobRepository` (`findAllByUserIdOrderByCreatedAtDesc`, `findByUserIdAndStatusOrderByCreatedAtDesc`, `findByIdAndUserId`, `countByUserIdAndStatus`) for asynchronous try-on lifecycle | AI Assistant |
| 2026-09-17 | Phase 10 | Added `countByUserIdSince(@Param("userId") UUID, @Param("since") Instant)` JPQL query to `TryOnJobRepository` for UTC-based daily quota enforcement | AI Assistant |

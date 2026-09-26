# Architectural Decision Records (ADR)

This document records all key architectural decisions made across the lifecycle of the AI Virtual Wardrobe project.

---

## ADR 001: Multi-Service Architecture & Domain Boundaries
* **Status**: Accepted
* **Date**: 2026-09-15
* **Context**:
  The system needs structured business logic, user auth, relational persistence, fast UI rendering, and AI computer vision / VTON inference pipelines.
* **Decision**:
  - **Spring Boot (Java 21)** is the single authority for business logic, authentication, PostgreSQL persistence, and REST APIs.
  - **Python (FastAPI)** is strictly dedicated to AI/CV workloads (Redis queue consumption, preprocessing, hosted VTON inference, object storage uploads).
  - **React (TypeScript + Vite + Tailwind)** provides the frontend user interface.
* **Consequences**:
  Clear separation of concerns; prevents business logic bleed into Python worker scripts while leveraging Python's rich ML ecosystem and Java's enterprise reliability.

---

## ADR 002: Storage & Asynchronous VTON Execution Model
* **Status**: Accepted
* **Date**: 2026-09-15
* **Context**:
  VTON inference is computationally intensive, variable in latency, and deals with high-resolution image inputs and outputs.
* **Decision**:
  - Store all raw and generated images in **S3-compatible Object Storage (MinIO for local dev)**. PostgreSQL stores metadata and object keys only.
  - VTON requests will be processed asynchronously via a **Redis job queue**.
  - Python worker communicates job completion back to Spring Boot via an authenticated internal callback endpoint.
* **Consequences**:
  Prevents blocking HTTP requests during AI inference, keeps PostgreSQL database lightweight, and enables horizontal scaling of AI workers independently.

---

## ADR 003: Stateless JWT Authentication & UUID Identification
* **Status**: Accepted
* **Date**: 2026-09-15
* **Context**:
  The application needs secure, stateless authentication for both the React frontend and mobile/web clients, as well as an ID strategy that prevents enumeration attacks.
* **Decision**:
  - Implement **stateless JSON Web Tokens (JWT)** signed via HMAC-SHA256 with Spring Security.
  - Use **UUIDv4** across all database entities as primary keys rather than auto-incrementing sequential integers.
  - Separate `User` (security credentials & identity) from `UserProfile` (physical attributes, preferences) with a 1:1 relationship.
* **Consequences**:
  Provides horizontally scalable stateless sessions, protects sensitive profile attributes, and prevents sequential ID scraping vulnerabilities.

---

## ADR 004: Wardrobe Item Structure & Multi-View Image Model
* **Status**: Accepted
* **Date**: 2026-09-15
* **Context**:
  Clothing items require front-facing reference images for VTON inference and optional back/detail views for cataloguing and style exploration. Multiple images per garment must be managed cleanly with cascade deletions across both relational records and object storage.
* **Decision**:
  - `WardrobeItem` maintains 1-to-many relationship with `WardrobeImage` with an enum `view_type` (`FRONT`, `BACK`, `DETAIL`).
  - During creation, `frontImage` is mandatory (for VTON canonical alignment), while `backImage` is optional.
  - Image files are stored under `wardrobe/{userId}/{itemId}_{viewType}_{uuid}.{ext}` in S3.
  - Deleting an item cascades deletion to all associated `WardrobeImage` records in PostgreSQL and triggers S3 object cleanup for each image key.
* **Consequences**:
  Guarantees consistent garment front-view availability for AI pipelines, maintains referential integrity, and prevents orphaned image objects in S3 storage.

---

## ADR 005: AI Metadata Suggestion & Human-in-the-Loop Authority
* **Status**: Accepted
* **Date**: 2026-09-15
* **Context**:
  Manually entering garment classification attributes (category, subcategory, color, pattern, fit, season) creates friction during wardrobe onboarding. However, AI/CV predictions may occasionally misclassify nuances (e.g. distinguishing a dark navy tee from black, or complex patterns).
* **Decision**:
  - FastAPI AI Service exposes a computer vision analysis endpoint (`POST /api/ai/metadata/suggest`) leveraging dominant color clustering, geometry/aspect-ratio silhouette classification, texture/pattern analysis, and heuristic confidence scoring.
  - Spring Boot acts as the client gateway (`POST /api/wardrobe/suggest-metadata`), communicating with the AI service over HTTP with configurable timeouts and graceful degradation (fallback with `isAiGenerated: false`).
  - **Human-in-the-loop**: AI suggestions are strictly advisory and are **never** persisted directly into PostgreSQL without explicit user confirmation via `POST /api/wardrobe/items` or `PUT /api/wardrobe/items/{id}`.
* **Consequences**:
  Accelerates user wardrobe building while maintaining 100% data fidelity controlled by the user, and ensures the wardrobe upload pipeline remains resilient to AI service latency or downtime.

---

## ADR 006: Controlled Outfit Generation & Entity Link Model
* **Status**: Accepted
* **Date**: 2026-09-16
* **Context**:
  Outfit generation requires flexible combination logic that respects deterministic user category constraints (Controlled Mode) while maintaining high relational performance and data integrity.
* **Decision**:
  - Model outfit composition through an explicit `Outfit` aggregate root and `OutfitItem` join entity (`outfits` -> `outfit_items` -> `wardrobe_items`).
  - **Controlled Mode Constraints**: The generator queries only user-owned items strictly matching requested categories (e.g., `["TOPS", "BOTTOMS"]`). Unrequested categories are strictly excluded. If any requested category contains 0 user items, a 400 Bad Request error is returned with explicit category feedback.
  - **Cascade Safety**: Deleting an `Outfit` utilizes JPA orphan removal on `OutfitItem` join rows, preserving the referenced `WardrobeItem` and S3 images intact.
* **Consequences**:
  Guarantees deterministic, rule-compliant outfit generation without accidental category contamination, provides a clean abstraction for future VTON try-on jobs, and safeguards wardrobe inventory records from deletion.

---

## ADR 007: Automatic Rule-Based Outfit Generation & Color Harmony Engine
* **Status**: Accepted
* **Date**: 2026-09-16
* **Context**:
  Users want prompt-based / occasion-driven outfit recommendations without manually specifying categories. The system requires high throughput, deterministic behavior, and zero hallucinations, avoiding complex, ungrounded LLM completions.
* **Decision**:
  - Implement a rule-based `AutomaticOutfitRuleEngine` mapping occasion templates (`CASUAL`, `FORMAL`, `WORK`, `PARTY`, `SUMMER`, `WINTER`, `MINIMAL`, `LOUNGEWEAR`, `ACTIVEWEAR`) to category heuristics.
  - Score combinations using a color harmony matrix (rewarding neutral + accent pairings, monochromatic palettes, and season affinity while penalizing clashing busy patterns).
  - Provide graceful degradation: automatically include optional items (outerwear, shoes) when available in the user's wardrobe, but never fail if only base combinations (Top + Bottom or Dress) exist.
* **Consequences**:
  Delivers sub-millisecond execution, guarantees that all recommended outfits are composed strictly of existing user-owned garments, and avoids hallucination risks or heavy LLM compute costs.

---

## ADR 008: Outfit Lifecycle, Interaction States & Regeneration Semantics
* **Status**: Accepted
* **Date**: 2026-09-16
* **Context**:
  Users need rich interactions with generated outfits: saving favorites, archiving/rejecting unwanted recommendations, fine-grained multi-dimensional querying across creation sources and statuses, and regenerating alternative combinations without restarting the wizard flow.
* **Decision**:
  - **State Machine**: Introduce `status` (`SAVED`, `REJECTED`, `DRAFT`, `ARCHIVED`) and orthogonal `is_favorite` boolean flag on `outfits` table.
  - **History & Indexing**: Add composite indexes `(user_id, created_at DESC)`, `(user_id, status)`, and `(user_id, is_favorite)` for performant paginated history and filtered lookups.
  - **Context-Aware Regeneration (`POST /api/outfits/{id}/regenerate`)**: Inspects original outfit metadata (`source`, `occasion`, and garment categories) to invoke the appropriate generator engine (Automatic Rule Engine or Controlled Generation) and return a newly randomized permutation under user ownership.
  - **IDOR Protection**: All interaction endpoints (`/save`, `/reject`, `/favorite`, `/regenerate`, `PUT /{id}`) enforce strict user ownership checks (`findByIdAndUserId`), preventing unauthorized cross-user manipulation or state disclosure.
* **Consequences**:
  Provides a clean, stateful lifecycle for outfit curation, fast filtered query performance, and contextually aware regeneration while maintaining strict multi-tenant isolation.

---

## ADR 009: Asynchronous Try-On Queue & Authenticated Callback Architecture
* **Status**: Accepted
* **Date**: 2026-09-16
* **Context**:
  Virtual Try-On (VTON) is a high-latency, GPU-intensive workload. Blocking client HTTP connections during inference leads to timeouts, gateway drops, and severe thread starvation in the Spring Boot backend. Furthermore, single garments must be seamlessly handled without requiring different data models.
* **Decision**:
  - **Single-Garment Abstraction**: Every try-on target is uniformly treated as an `Outfit` (single garments are dynamically mapped to a 1-item `Outfit`).
  - **Asynchronous Redis Queue (`vton:tryon:queue`)**: Spring Boot enqueues job payloads containing user, avatar, and garment S3 image metadata, immediately returning `201 Created` with a `PENDING` job status to the client.
  - **Decoupled Python Worker**: A background worker thread consumes jobs using Redis blocking pop (`brpop`), synthesizes the output, uploads the result to MinIO/S3 (`tryon/{userId}/{jobId}.jpg`), and posts resolution details to Spring Boot via `POST /api/internal/try-ons/callback`.
  - **Callback Authentication**: The internal callback endpoint is protected via an `X-Internal-Secret` matching `INTERNAL_API_SECRET`, preventing external actors from spoofing job completions.
* **Consequences**:
  Completely decouples distributed system scalability from AI inference latency, prevents backend HTTP blocking, supports graceful worker retries, and establishes the exact architecture ready for hosted deep-learning models in Phase 10.

---

## ADR 010: Dual-Mode VTON Provider (Fashn.ai + Enhanced Mock)
* **Status**: Accepted
* **Date**: 2026-09-17
* **Context**:
  Real virtual try-on requires a hosted diffusion model. All commercially viable options (Fashn.ai, Replicate, Modal) incur per-call costs. Development and CI must work without any API key, billing account, or network access.
* **Decision**:
  Implement a **dual-mode routing strategy** controlled exclusively by the presence of `FASHN_API_KEY` in the environment:
  - **No API key** (default dev/test): Routes to `generate_enhanced_mock_tryon()` — a deterministic PIL composite that downloads the real avatar + garment images and overlays the garment on the torso region using alpha blending.
  - **API key present** (production): Routes to `run_fashn_tryon()` — submits to Fashn.ai API, polls until `completed`, downloads result bytes, uploads to S3.
  - Worker maps provider errors to three callback status codes: `PROVIDER_ERROR`, `PROVIDER_TIMEOUT`, `INFERENCE_ERROR`.
  - Backend enforces a configurable **daily quota** (`app.tryon.daily-limit`, default 5) using a UTC start-of-day JPQL query, returning HTTP 400 when exceeded.
* **Consequences**:
  - Zero-friction development: clone + `docker compose up` works without any API key.
  - Feature parity: the enhanced mock produces a realistic composite using actual images rather than a colored rectangle, making UI development and demos meaningful even without the real model.
  - Operator control: production operators set `FASHN_API_KEY` in the environment; no code change required.
  - Quota prevents unbounded spend in production deployments; `TRYON_DAILY_LIMIT=0` disables it for demos.



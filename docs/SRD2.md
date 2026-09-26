# AI Virtual Wardrobe — Software Requirements Document

**Version:** 0.2  
**Status:** Portfolio MVP specification

## 1. Product Overview

AI Virtual Wardrobe is a web application that lets users build a personal digital wardrobe, generate outfit combinations, and visualize selected clothing on their own 2D person representation using AI virtual try-on (VTON).

The product is intentionally a practical portfolio project. V1 prioritizes a reliable end-to-end workflow over advanced 3D reconstruction or custom AI research.

## 2. Goals

- Create a simple 2D canonical representation from user photos.
- Store and manage a personal clothing inventory.
- Collect useful clothing metadata, with AI suggestions that the user confirms.
- Generate outfits in controlled and automatic modes.
- Let users save, reject, regenerate, and try on outfits.
- Provide asynchronous single-garment VTON.
- Keep application data owned by Spring Boot while AI inference remains isolated in Python.
- Keep GPU costs controlled through hosted inference and usage quotas.

## 3. Non-Goals for V1

- True 3D avatars or body meshes.
- Custom VTON model training.
- Self-hosted GPU inference unless suitable free/low-cost infrastructure is available.
- Multi-garment VTON in one inference.
- Cloth physics or physically accurate simulation.
- Complex LLM-based personal stylist/recommendation systems.

## 4. User Profile and Canonical Avatar

Users provide basic profile information and upload 2–3 suitable photos.

The system should:
1. Validate that a photo contains one person and enough of the body for the intended use.
2. Remove the background where useful.
3. Let the user choose a preferred photo as the canonical 2D representation.

V1 does **not** perform pose estimation, human parsing, or generative body reconstruction during avatar creation. Those operations belong to the VTON pipeline because they depend on the garment and try-on task.

## 5. Wardrobe

Users can upload clothing images, ideally with a front image and optionally a back image.

Each wardrobe item stores metadata such as:
- Category
- Color
- Pattern
- Fit
- Optional material/season information

AI may suggest metadata, but the user must be able to review and edit it before it becomes the item's confirmed metadata.

## 6. Outfit Generation

### Controlled Mode

The user specifies allowed categories, for example:
- T-shirt + trousers
- Shirt + jeans

The generator must only select items from those requested categories.

### Automatic Mode

The user provides a broad request such as "generate a casual outfit." The system chooses appropriate categories and wardrobe items using available metadata.

Users can:
- View an outfit
- Save/favorite it
- Reject it
- Regenerate another outfit

Replacing an individual item can be added after the core generation workflow is stable.

## 7. Outfit and Try-On Model

An **Outfit** is the consistent abstraction for selected wardrobe items.

Even a single-garment try-on creates a one-item Outfit. `TryOnJob` always references an Outfit rather than directly referencing a wardrobe item.

This keeps the data model consistent and allows future multi-item try-on without changing the core relationship.

V1 VTON supports **one garment per inference**. Multi-garment VTON is explicitly post-MVP because sequential compositing can compound visual artifacts.

## 8. Virtual Try-On Architecture

The main application is responsible for users, wardrobe data, outfits, jobs, authorization, and persistence.

```text
React + TypeScript
        |
        v
   Spring Boot API
    /     |         v      v       v
Postgres Redis  Object Storage
          |
          v
    Python Worker
          |
          v
   Hosted VTON API
```

### Job Flow

1. Spring Boot creates a `TryOnJob`.
2. Spring places a minimal job message on Redis.
3. Python worker consumes the message.
4. Python retrieves input images from object storage using object keys or signed URLs.
5. Python performs VTON-specific preprocessing such as human parsing/pose estimation.
6. Python calls the selected hosted VTON model/API.
7. Python uploads the result to object storage.
8. Python calls an internal Spring Boot callback.
9. Spring validates the callback and updates the job status/result.

Spring Boot remains the system of record. Python must not directly write application data to PostgreSQL.

### Example Queue Payload

```json
{
  "jobId": "uuid",
  "outfitId": "uuid",
  "avatarImageKey": "avatars/user123/canonical.png",
  "garmentImageKeys": ["wardrobe/item456/front.png"]
}
```

### Completion Callback

```json
{
  "status": "COMPLETED",
  "resultImageKey": "tryons/job789/result.png"
}
```

Failure:

```json
{
  "status": "FAILED",
  "errorCode": "VTON_INFERENCE_FAILED"
}
```

The internal callback uses service-to-service authentication, not the user's JWT.

Jobs need explicit states such as `PENDING`, `PROCESSING`, `COMPLETED`, and `FAILED`, with bounded retry handling.

## 9. Inference and Cost Control

V1 should use a hosted GPU inference provider rather than requiring the portfolio user to operate GPU infrastructure.

The exact provider and VTON model should be selected when VTON implementation begins, based on current:
- Visual quality
- API reliability
- Cost
- Latency
- Licensing
- Privacy/data handling
- Ease of integration

The application should have a configurable per-user daily try-on quota (for example, 5/day for a demo) to protect hosted inference costs.

## 10. High-Level Data Model

Core entities:

- `User`
- `UserProfile`
- `Avatar`
- `WardrobeItem`
- `Outfit`
- `OutfitItem`
- `TryOnJob`

Relationships:

```text
User
 ├── UserProfile
 ├── Avatar(s)
 ├── WardrobeItem(s)
 ├── Outfit(s)
 │     └── OutfitItem(s) -> WardrobeItem
 └── TryOnJob(s) -> Outfit
```

Images are stored in object storage; PostgreSQL stores metadata and object keys rather than large image blobs.

## 11. API Responsibilities

Spring Boot exposes REST APIs for:
- Authentication/user profile
- Avatar upload and selection
- Wardrobe CRUD and metadata confirmation
- Outfit generation and management
- Try-on job creation/status/result
- Daily quota/status

The Python service exposes only internal AI-worker endpoints/callback behavior and must not become the application's primary business API.

## 12. Security and Privacy

- Authenticate users with secure tokens/session mechanisms.
- Authorize access to user-owned wardrobe, avatar, outfit, and try-on resources.
- Validate image type, size, and upload limits.
- Store secrets in environment/configuration management, never source code.
- Use signed/private object-storage access where appropriate.
- Do not log raw personal images or sensitive tokens.

## 13. Frontend

React + TypeScript should provide:
- Profile/avatar setup
- Wardrobe management
- Metadata editing
- Outfit generation
- Outfit history/favorites
- Try-on progress and result states

The UI must clearly represent loading, empty, error, success, and in-progress job states.

## 14. Technology Stack

- Frontend: React + TypeScript
- Main backend: Java + Spring Boot
- Database: PostgreSQL
- Queue: Redis
- Object storage: S3-compatible storage
- AI service: Python + FastAPI
- VTON inference: hosted GPU provider
- Local development: Docker Compose

## 15. Testing

- Unit tests for business rules and outfit generation.
- Integration tests for Spring Boot + PostgreSQL.
- API tests for authentication/authorization and ownership.
- Worker tests for queue handling and callback behavior.
- End-to-end test for:
  `upload -> wardrobe -> outfit -> try-on job -> result`.

## 16. MVP Phases

### Phase 1 — Foundation
Repository structure, Docker Compose, Spring Boot, React, PostgreSQL, Redis, object storage, configuration.

### Phase 2 — User + Avatar
Profile, photo upload/validation, background removal, canonical avatar selection.

### Phase 3 — Wardrobe
Clothing upload, storage, metadata entry, AI metadata suggestion flow, confirmation/editing.

### Phase 4 — Outfit Generation
Controlled category-based generation, automatic generation, save/reject/regenerate.

### Phase 5 — Single-Garment VTON
One-item Outfit creation, TryOnJob lifecycle, Redis worker flow, hosted VTON integration, result storage, quota.

### Phase 6 — Polish
Error handling, UX improvements, tests, documentation, deployment, demo readiness.

## 17. Future Roadmap

Potential post-MVP work:
- Multi-garment VTON
- Better pose/body preprocessing
- More advanced recommendations
- Outfit replacement/interactive editing
- Weather/occasion-aware recommendations
- 3D or richer body representations
- Custom/self-hosted models if scale justifies them

## 18. Definition of Done

V1 is complete when a user can:

1. Create a profile and canonical 2D avatar.
2. Add clothing to a personal wardrobe.
3. Confirm/edit clothing metadata.
4. Generate controlled or automatic outfits.
5. Save/reject/regenerate outfits.
6. Create a one-garment try-on job through an Outfit.
7. Receive an asynchronous VTON result.
8. View the result securely.
9. Stay within configured daily try-on limits.

The guiding principle is:

**Build the smallest reliable end-to-end product first; add AI complexity only when it directly improves the user workflow.**

# AI Virtual Wardrobe --- Software Requirements Document (SRD)

**Version:** 0.1\
**Status:** Initial Product & Architecture Baseline\
**Avatar approach:** 2D image-based\
**Primary backend:** Java + Spring Boot\
**AI service:** Python + FastAPI

------------------------------------------------------------------------

## 1. Product Overview

AI Virtual Wardrobe is a web application that lets a user create a
personalized digital wardrobe, generate outfit combinations from their
own clothes, and visualize selected outfits on a personalized 2D
representation of themselves.

The product has three core capabilities:

1.  **Personal representation** --- create a consistent, user-specific
    2D avatar/canonical person image from uploaded photos.
2.  **Digital wardrobe** --- upload and organize real clothing items
    with lightweight user-confirmed metadata.
3.  **Outfit generation + virtual try-on** --- generate compatible
    outfits from the user's wardrobe and render those outfits on the
    user's avatar/person image.

The application is intended to start as a practical portfolio/MVP
project and evolve toward a production-quality AI wardrobe assistant.

------------------------------------------------------------------------

## 2. Problem Statement

People often own many clothes but have difficulty deciding what to wear
and imagining how combinations will look together.

The application solves this by allowing users to:

-   Digitize their own wardrobe.
-   Ask for outfit combinations.
-   Restrict generation to selected clothing categories.
-   Visualize an outfit on a representation of themselves.
-   Avoid repeatedly wearing the same combinations.
-   Eventually consider weather, occasion, style preferences, and other
    context.

------------------------------------------------------------------------

## 3. Product Goals

### 3.1 MVP Goals

The MVP must allow a user to:

-   Create an account.
-   Create a profile.
-   Upload personal photos.
-   Create a usable 2D avatar/canonical person representation.
-   Upload clothing images.
-   Categorize clothing.
-   Add lightweight clothing metadata.
-   View and manage their wardrobe.
-   Select clothing categories to constrain outfit generation.
-   Generate outfit combinations.
-   Select an outfit for virtual try-on.
-   Generate an image showing the user wearing the selected outfit.
-   Save generated outfits/results.

### 3.2 Future Goals

Future versions may support:

-   Weather-aware outfit recommendations.
-   Occasion-aware recommendations.
-   Weekly outfit planning.
-   Calendar integration.
-   Clothing wear history.
-   Favorite outfits.
-   Style preference learning.
-   Individual-item replacement.
-   Packing assistant.
-   Size/fit recommendations.
-   Natural-language outfit requests.
-   More advanced body-shape personalization.

------------------------------------------------------------------------

## 4. Non-Goals for V1

The following are explicitly out of scope for the first version:

-   Full 3D avatar generation.
-   3D clothing reconstruction.
-   Physical cloth simulation.
-   Perfect measurement-based body reconstruction.
-   Training a proprietary VTON model from scratch.
-   Building a general-purpose fashion marketplace.
-   Automatically determining every clothing property without user
    confirmation.
-   Complex social features.

Height and weight are profile metadata in V1. They are not treated as
sufficient information to reconstruct an accurate 3D body.

------------------------------------------------------------------------

# 5. Core User Flows

## 5.1 Registration and Profile

User:

1.  Creates an account.
2.  Logs in.
3.  Enters profile information.
4.  Provides height.
5.  Optionally provides weight.
6.  Uploads personal photos.

Profile information is stored separately from wardrobe information.

------------------------------------------------------------------------

## 5.2 Create Personal 2D Representation

User uploads approximately 2--3 useful photos.

Pipeline:

``` text
User Photos
    ↓
Validation
    ↓
Person/background preprocessing
    ↓
Canonical image generation/selection
    ↓
Personal representation
```

The system should prioritize consistency and recognizability over
creating an artificial "3D-looking" person.

The original user photos should remain private and should not be
publicly accessible.

------------------------------------------------------------------------

## 5.3 Add Clothing

User chooses **Add Clothing**.

Required/important inputs:

-   Clothing image.
-   Category.
-   Color.

Optional inputs:

-   Back image.
-   Pattern.
-   Fit.
-   Material.
-   Notes.

Recommended categories for V1:

### Tops

-   T-shirt
-   Shirt
-   Polo
-   Hoodie
-   Sweater
-   Jacket

### Bottoms

-   Jeans
-   Trousers
-   Chinos
-   Shorts

### Footwear

-   Sneakers
-   Formal shoes
-   Boots
-   Sandals
-   Other

### Accessories

-   Watch
-   Cap
-   Sunglasses
-   Other

The category list should be configurable so new categories can be added
later.

------------------------------------------------------------------------

## 5.4 AI-Assisted Clothing Metadata

AI may analyze uploaded clothing images and suggest metadata.

Example:

``` text
Image
  ↓
AI analysis
  ↓
Suggested:
T-shirt
Black
Graphic
Regular fit
  ↓
User confirms/edits
  ↓
Save
```

The AI should assist rather than silently become the source of truth.

User-confirmed metadata should take precedence.

Material/fabric should be optional because it is generally less
important to basic outfit compatibility than category, color, pattern,
and fit.

------------------------------------------------------------------------

# 6. Outfit Generation

Outfit generation is a core product feature.

There are two modes.

## 6.1 Controlled Generation

The user explicitly selects categories.

Example:

``` text
TOP
☑ T-Shirts

BOTTOM
☑ Trousers

SHOES
☐ Any
```

The generator must only use eligible items from the selected categories.

If the user selects:

``` text
T-Shirts + Trousers
```

the generator must not silently add jeans.

------------------------------------------------------------------------

## 6.2 AI/Automatic Generation

The user can request something broad such as:

> Generate a casual outfit.

The system determines appropriate categories and selects items from the
wardrobe.

The recommendation engine should consider:

-   Category compatibility.
-   Color compatibility.
-   Pattern compatibility.
-   Fit compatibility.
-   Occasion, when available.
-   Weather, when available.
-   User preferences.
-   Recent outfit history.
-   Item repetition.
-   Overall style compatibility.

------------------------------------------------------------------------

# 7. Outfit Recommendation Engine

V1 should use a deterministic/rule-based scoring system rather than
depending entirely on an LLM.

Conceptual scoring:

``` text
Outfit Score =
    Category Compatibility
  + Color Compatibility
  + Pattern Compatibility
  + Fit Compatibility
  + User Preference
  + Context Compatibility
  - Repetition Penalty
```

The exact scoring model can evolve.

The recommendation engine should be implemented as an independent
backend service/module so that its algorithm can be improved without
changing the rest of the application.

------------------------------------------------------------------------

# 8. Outfit Interaction

After an outfit is generated, the user should be able to:

-   View the outfit.
-   Generate virtual try-on.
-   Save/favorite the outfit.
-   Reject the outfit.
-   Regenerate.
-   Replace an individual item where possible.

Example:

``` text
White T-shirt
Black trousers
White sneakers

[Try On]
[Save]
[Regenerate]
[Replace T-shirt]
```

"Replace item" is an important future interaction because users often
like most of an outfit but dislike one component.

------------------------------------------------------------------------

# 9. Virtual Try-On

Virtual try-on is the primary AI differentiator.

Input:

``` text
Canonical Person Image
        +
Selected Garment(s)
        +
Garment Metadata
        ↓
Virtual Try-On Model
        ↓
Generated Image
```

The architecture must keep the VTON implementation replaceable.

Candidate model families can be evaluated during implementation,
including:

-   IDM-VTON
-   CatVTON
-   StableVITON
-   Newer suitable VTON models available at implementation time

The application should not hard-code the entire product around a single
model.

------------------------------------------------------------------------

## 9.1 Multi-Garment Try-On

The system should eventually support outfits containing multiple
garments:

``` text
Person
 +
T-shirt
 +
Trousers
 +
Shoes
 ↓
Complete outfit image
```

For the earliest VTON prototype, it is acceptable to begin with one
garment at a time and then expand to multi-item outfits.

------------------------------------------------------------------------

# 10. Technical Architecture

## 10.1 High-Level Architecture

``` text
                    React + TypeScript
                           │
                           │ REST / WebSocket
                           ▼
                    Spring Boot API
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      PostgreSQL       Object Storage     Redis/Queue
          │                │                │
          │                │                ▼
          │                │          Python Worker
          │                │                │
          │                │                ▼
          │                │          VTON / CV Models
          │                │
          └────────────────┴───────► Generated Results
```

------------------------------------------------------------------------

# 11. Technology Stack

## 11.1 Frontend

-   React
-   TypeScript
-   Tailwind CSS
-   React Router
-   State management only where necessary

The frontend communicates with the backend through REST APIs.

------------------------------------------------------------------------

## 11.2 Main Backend

**Java + Spring Boot**

Responsibilities:

-   Authentication.
-   Authorization.
-   User profiles.
-   Wardrobe management.
-   Clothing metadata.
-   Outfit generation.
-   Recommendation logic.
-   Try-on job management.
-   Persistence.
-   API validation.
-   Application security.

Why Spring Boot:

-   The developer already knows Java.
-   It provides an opportunity to learn a market-relevant Java backend
    framework.
-   Spring Boot is well suited to a structured application with
    authentication, persistence, services, and REST APIs.

------------------------------------------------------------------------

## 11.3 AI Service

**Python + FastAPI**

Responsibilities:

-   Image preprocessing.
-   Person segmentation.
-   Clothing segmentation.
-   Image normalization.
-   AI metadata extraction where useful.
-   Virtual try-on inference.
-   Other computer-vision operations.

Python is isolated to AI/ML responsibilities rather than being used for
the entire backend.

------------------------------------------------------------------------

## 11.4 Database

**PostgreSQL**

Primary relational data store.

Potential entities:

``` text
User
UserProfile
Avatar
WardrobeItem
WardrobeImage
Outfit
OutfitItem
TryOnJob
TryOnResult
UserPreference
```

------------------------------------------------------------------------

## 11.5 Object Storage

Use S3-compatible object storage for:

-   Original profile photos.
-   Processed avatar images.
-   Clothing images.
-   Segmented clothing images.
-   Generated try-on results.

Images should not be stored directly inside PostgreSQL as binary data
unless there is a specific reason.

The database should store metadata and object references.

------------------------------------------------------------------------

## 11.6 Queue / Asynchronous Processing

Use Redis and a job/queue mechanism for long-running AI operations.

Example:

``` text
POST /api/try-ons
       ↓
Create TryOnJob
       ↓
Queue job
       ↓
Return 202 + jobId
       ↓
Python AI worker
       ↓
VTON inference
       ↓
Upload result
       ↓
Mark job COMPLETED
```

The browser should not keep an HTTP request open while waiting for GPU
inference.

------------------------------------------------------------------------

# 12. Backend API Concept

Example API groups:

``` text
/api/auth
/api/users
/api/profile
/api/avatar
/api/wardrobe
/api/wardrobe/items
/api/outfits
/api/recommendations
/api/try-ons
```

Example endpoints:

``` text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/profile
PUT    /api/profile

POST   /api/avatar/photos
GET    /api/avatar

POST   /api/wardrobe/items
GET    /api/wardrobe/items
GET    /api/wardrobe/items/{id}
PUT    /api/wardrobe/items/{id}
DELETE /api/wardrobe/items/{id}

POST   /api/outfits/generate
GET    /api/outfits
GET    /api/outfits/{id}

POST   /api/try-ons
GET    /api/try-ons/{jobId}
```

These are initial contracts and can be refined after database design.

------------------------------------------------------------------------

# 13. Data Model --- Initial Design

## User

``` text
id
email
passwordHash
createdAt
updatedAt
```

## UserProfile

``` text
id
userId
name
height
weight (nullable)
createdAt
updatedAt
```

## Avatar

``` text
id
userId
imageUrl
source
version
createdAt
updatedAt
```

## WardrobeItem

``` text
id
userId
category
subcategory
color
pattern
fit
material (nullable)
notes (nullable)
createdAt
updatedAt
```

## WardrobeImage

``` text
id
wardrobeItemId
imageUrl
imageType
createdAt
```

`imageType` may distinguish:

``` text
FRONT
BACK
PROCESSED
SEGMENTED
```

## Outfit

``` text
id
userId
name
source
createdAt
```

`source` can represent:

``` text
USER_SELECTED
RULE_ENGINE
AI_RECOMMENDATION
```

## OutfitItem

``` text
id
outfitId
wardrobeItemId
```

## TryOnJob

``` text
id
userId
outfitId
status
createdAt
startedAt
completedAt
errorMessage
```

Potential statuses:

``` text
QUEUED
PROCESSING
COMPLETED
FAILED
```

## TryOnResult

``` text
id
tryOnJobId
imageUrl
createdAt
```

------------------------------------------------------------------------

# 14. Security & Privacy Requirements

Because the system processes personal photos and body-related images,
privacy is a first-class requirement.

Requirements:

-   User images must not be publicly accessible by default.
-   Access to images must require authorization.
-   Use signed/temporary URLs where appropriate.
-   Users must only be able to access their own wardrobe and generated
    images.
-   Passwords must never be stored as plaintext.
-   Authentication tokens must be handled securely.
-   API endpoints must validate ownership of resources.
-   User deletion should eventually delete associated personal images
    and generated assets.
-   Logs must not unnecessarily expose image URLs, tokens, or sensitive
    personal information.

------------------------------------------------------------------------

# 15. Error Handling

The application must gracefully handle:

### Invalid profile photos

Examples:

-   No person detected.
-   Poor image quality.
-   Unsupported format.
-   Multiple people detected where one person is expected.

### Invalid clothing images

Examples:

-   Garment not detected.
-   Multiple garments in one image.
-   Image too low quality.
-   Unsupported image format.

### AI failures

The user should see a meaningful state:

``` text
Queued
Generating
Completed
Failed
```

AI failures should not corrupt wardrobe or outfit data.

------------------------------------------------------------------------

# 16. Performance Requirements

V1 should prioritize correctness and reliability over extreme
optimization.

Important principles:

-   AI generation must be asynchronous.
-   Images should be compressed/resized where appropriate.
-   Original uploads should be retained only when required.
-   Generated results should be cached.
-   Duplicate try-on requests should be avoidable where practical.
-   Database queries should be indexed appropriately.
-   API responses should not contain unnecessarily large image payloads.

------------------------------------------------------------------------

# 17. AI Architecture Principles

The AI layer must be modular.

Avoid:

``` text
Spring Boot
   ↓
Hard-coded IDM-VTON implementation
```

Prefer:

``` text
Spring Boot
   ↓
AI Job
   ↓
AI Service Interface
   ↓
VTON Provider
   ↓
Model A / Model B / External API
```

This allows us to change models without redesigning the application.

------------------------------------------------------------------------

# 18. MVP Development Phases

## Phase 1 --- Project Foundation

Build:

-   Git repository.
-   React frontend.
-   Spring Boot backend.
-   PostgreSQL.
-   Basic project structure.
-   Docker development environment.
-   Basic authentication.

Deliverable:

> User can register, log in, and view their profile.

------------------------------------------------------------------------

## Phase 2 --- Wardrobe

Build:

-   Clothing upload.
-   Image storage.
-   Clothing categories.
-   Metadata form.
-   Wardrobe grid.
-   Clothing details.
-   Edit/delete clothing.

Deliverable:

> User has a usable digital wardrobe.

------------------------------------------------------------------------

## Phase 3 --- Outfit Engine

Build:

-   Category selection.
-   Controlled outfit generation.
-   Compatibility rules.
-   Outfit scoring.
-   Generated outfit UI.
-   Save/reject/regenerate.

Deliverable:

> User can generate combinations from selected wardrobe categories.

------------------------------------------------------------------------

## Phase 4 --- Personal Representation

Build:

-   Personal photo upload.
-   Photo validation.
-   Person segmentation.
-   Canonical image generation/selection.
-   Avatar management.

Deliverable:

> User has a reusable personal representation.

------------------------------------------------------------------------

## Phase 5 --- AI Virtual Try-On Prototype

Before fully integrating it into the application, build a standalone AI
prototype.

Input:

``` text
Person image
+
One garment
```

Output:

``` text
Person wearing garment
```

Evaluate multiple suitable VTON approaches.

Deliverable:

> A reliable prototype capable of producing acceptable try-on images.

------------------------------------------------------------------------

## Phase 6 --- VTON Integration

Connect:

``` text
React
 ↓
Spring Boot
 ↓
TryOnJob
 ↓
Queue
 ↓
Python AI service
 ↓
VTON
 ↓
Object storage
 ↓
Spring Boot
 ↓
React
```

Deliverable:

> User can select an outfit and see a generated visualization.

------------------------------------------------------------------------

## Phase 7 --- Product Integration

Combine:

-   Wardrobe.
-   Outfit generator.
-   Avatar.
-   VTON.
-   Saved outfits.
-   History.

Deliverable:

> End-to-end AI virtual wardrobe MVP.

------------------------------------------------------------------------

# 19. Testing Strategy

## Backend

-   Unit tests for recommendation logic.
-   Service tests.
-   Repository tests.
-   Controller/API tests.
-   Authentication/authorization tests.

## Frontend

-   Component tests for important UI.
-   API integration tests.
-   Form validation tests.

## AI

Maintain a small evaluation dataset containing representative:

-   Person images.
-   Clothing categories.
-   Poses.
-   Clothing types.

Evaluate:

-   Identity preservation.
-   Garment preservation.
-   Visual realism.
-   Artifact rate.
-   Generation time.

AI model quality should be measured independently from normal
application tests.

------------------------------------------------------------------------

# 20. Git / Repository Structure

Initial target:

``` text
ai-virtual-wardrobe/
│
├── frontend/
│   └── React + TypeScript
│
├── backend/
│   └── Spring Boot
│
├── ai-service/
│   └── Python + FastAPI
│
├── docs/
│   ├── SRD.md
│   ├── architecture.md
│   └── api.md
│
├── docker/
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

This may evolve as the implementation grows.

------------------------------------------------------------------------

# 21. Important Product Decisions

The following decisions are considered baseline decisions for V1:

  Area                          Decision
  ----------------------------- -----------------------------------------
  Avatar                        2D image-based
  3D avatar                     Out of scope for V1
  Main backend                  Spring Boot + Java
  AI service                    Python + FastAPI
  Frontend                      React + TypeScript
  Database                      PostgreSQL
  Object storage                S3-compatible
  Async jobs                    Redis + queue
  Clothing metadata             User-confirmed
  AI metadata                   Suggestions/assistance
  Material                      Optional
  Category selection            Core feature
  Automatic outfit generation   Core feature
  Virtual try-on                Core differentiator
  VTON model                    Replaceable implementation
  Height/weight                 Profile metadata, not 3D reconstruction

------------------------------------------------------------------------

# 22. Future Feature Roadmap

After MVP stability:

### Context-aware outfits

``` text
Weather
+
Occasion
+
Time
+
Wardrobe
↓
Recommendation
```

### Weekly planning

``` text
Monday → Outfit A
Tuesday → Outfit B
Wednesday → Outfit C
...
```

### Outfit history

Track what the user has already worn to reduce repetition.

### Natural-language assistant

Examples:

> "Give me something casual for college."

> "Use my black trousers but not my white T-shirt."

> "Give me three outfits for a date."

### Smart wardrobe analytics

Examples:

-   Most-used items.
-   Least-used items.
-   Most versatile items.
-   Frequently paired items.
-   Missing wardrobe categories.

### Shopping assistant

Eventually identify wardrobe gaps and recommend new items, while keeping
shopping separate from the core wardrobe functionality.

------------------------------------------------------------------------

# 23. Definition of Done for MVP

The MVP is considered successful when a new user can complete this flow:

``` text
Register
   ↓
Create profile
   ↓
Upload personal photos
   ↓
Create personal representation
   ↓
Add several clothing items
   ↓
View wardrobe
   ↓
Select categories
   ↓
Generate outfit combinations
   ↓
Choose an outfit
   ↓
Request virtual try-on
   ↓
Wait while AI processes
   ↓
View generated image
   ↓
Save/reject/regenerate
```

The most important success criterion is not the number of features.

It is:

> **Can a real user upload their own clothes and receive a believable
> visualization of themselves wearing a generated outfit?**

That is the core product loop.

------------------------------------------------------------------------

# 24. Engineering Principle

Build the application in layers and keep responsibilities separated:

``` text
Presentation
     ↓
Application/API
     ↓
Business Logic
     ↓
Persistence
     ↓
Infrastructure

AI is an independent service:
     ↓
AI orchestration
     ↓
Preprocessing
     ↓
Model inference
     ↓
Postprocessing
```

Do not prematurely optimize for production scale.

First make the complete product loop work.

Then improve model quality, performance, infrastructure, and UX.

------------------------------------------------------------------------

**End of SRD v0.1**

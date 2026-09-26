
1. Project Goal

Build a practical portfolio-quality AI Virtual Wardrobe:

React + TypeScript → Spring Boot → PostgreSQL / Redis / Object Storage → Python VTON worker

V1 is image-based, not a true 3D avatar system.

2. Architecture Rules

Spring Boot is the application authority

Spring Boot owns:

Authentication/authorization

Users and profiles

Avatars

Wardrobe items and metadata

Outfits

TryOnJobs

PostgreSQL persistence

REST APIs

Job lifecycle/status

Python must not directly write to PostgreSQL.

Python is the AI worker

Python/FastAPI handles:

Queue consumption

VTON-specific preprocessing

Human parsing/pose processing when required by the chosen model

Calling the hosted VTON provider

Uploading generated results

Reporting job completion/failure to Spring Boot

Do not put normal business logic in Python.

Images

Store images in object storage. Store object keys/URLs and metadata in PostgreSQL.

Do not pass large image bytes through Spring Boot between services when object-storage references can be used.

Async VTON

Spring -> Redis -> Python -> Hosted VTON
                         |
                         v
                  Object Storage
                         |
                         v
                  Spring callback

Use explicit job states:

PENDING -> PROCESSING -> COMPLETED / FAILED

Include bounded retries and useful failure codes.

3. Backend Structure

Prefer feature-oriented packages:

...user
...avatar
...wardrobe
...outfit
...tryon
...common

Within features, use sensible separation such as:

controller -> service -> repository

Controllers should be thin. Business rules belong in services.

Use DTOs for API boundaries rather than exposing JPA entities directly.

4. Database

PostgreSQL is the source of truth.

Use migrations for schema changes.

Avoid storing image binaries in PostgreSQL.

Enforce ownership/authorization at the service layer.

Use UUIDs or another consistent ID strategy throughout the project.

Keep relationships explicit and simple.

Core model:

User
 ├── Profile
 ├── Avatar
 ├── WardrobeItem
 ├── Outfit -> OutfitItem -> WardrobeItem
 └── TryOnJob -> Outfit

A single-garment try-on still creates a one-item Outfit.

5. Outfit Generation

Controlled mode

If the user requests specific categories, the generator must not select outside those categories.

Automatic mode

The system can choose suitable categories based on the user's request and available wardrobe metadata.

Never silently violate a user's explicit category constraints.

6. Avatar Rule

Keep avatar creation simple in V1:

Validate uploaded photo.

Background removal if needed.

Let the user choose the canonical image.

Do not add pose estimation, human parsing, body reconstruction, or generative avatar creation to the avatar setup unless the product requirements later justify it.

Those operations belong in the VTON pipeline.

7. VTON Scope

V1 supports single-garment try-on.

Do not implement multi-garment VTON as if it were a normal extension of single-garment VTON. It is post-MVP because sequential compositing can introduce artifacts.

The exact hosted provider/model must be chosen based on current quality, cost, latency, licensing, privacy, and API behavior when Phase 5 starts.

Add a configurable daily per-user try-on quota.

8. API and Security

Validate all request input and uploaded files.

Users may access only their own resources.

Never trust client-supplied ownership fields.

Keep secrets in environment/configuration.

Internal worker callbacks use service authentication, separate from user JWT authentication.

Return consistent error responses.

Do not log tokens or private image data.

9. Frontend

Use React + TypeScript.

Organize code by feature rather than one giant components folder.

Represent all important states:

loading

empty

error

success

processing

Keep API calls separated from presentation components. Prefer typed API models.

10. Coding Standards

When implementing a feature:

Understand the existing code before changing it.

Make the smallest change that correctly solves the task.

Follow existing project conventions.

Do not introduce a dependency when existing code can solve the problem cleanly.

Keep controllers/components thin.

Validate at boundaries.

Handle failures explicitly.

Write tests for important business logic.

Update documentation when architecture or behavior changes.

Avoid premature abstractions and unnecessary design patterns.

11. AI-Generated Code Review

Before accepting generated code, check:

Does it follow the architecture?

Is business logic in the correct service?

Does it preserve ownership/security?

Does it handle errors and empty states?

Does it introduce unnecessary dependencies?

Does it create unnecessary database/image coupling?

Are tests needed?

Does it accidentally expand MVP scope?

Prefer:

correctness → simplicity → maintainability → performance → cleverness

12. Git and Changes

Keep commits focused and descriptive.

Do not mix unrelated refactors with feature work.

Before a large architectural change, explain:

Why it is needed

What components change

What alternatives were considered

Whether it affects the SRD

13. Current Product Decisions

These decisions should not be casually changed:

Spring Boot + Java is the main backend.

React + TypeScript is the frontend.

Python + FastAPI is the AI service.

PostgreSQL is owned by Spring Boot.

Redis is the initial job queue.

Object storage holds images/results.

VTON is asynchronous.

V1 uses a 2D canonical avatar.

V1 uses single-garment VTON.

A TryOnJob always references an Outfit.

Hosted GPU inference is preferred.

Multi-garment VTON and 3D are post-MVP.

If a task conflicts with these decisions, flag the conflict before implementing it.

14. After each feature implementation update these document with relevant updates, log all the update related to database in docs\DATABASE.md, for api updates in docs\API.md, list and breifly explain any architectural decision made in docs\ARCHITECTURAL_DECISION.md and track the implementation of this project in docs\IMPLEMENTATION_TRACKER.md file.
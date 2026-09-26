# API Documentation

## Overview
The AI Virtual Wardrobe exposes REST APIs through two primary services:
1. **Spring Boot Backend** (`http://localhost:8080`) — Primary business, authentication, avatar, and wardrobe API.
2. **FastAPI AI Service** (`http://localhost:8000`) — Internal worker and AI inference service.

---

## 1. Backend APIs (`/api`)

### Standard Response Envelope
All API responses follow a unified JSON envelope:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "timestamp": "2026-09-15T14:40:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Error details",
  "path": "/api/...",
  "validationErrors": {
    "field": "Validation message"
  },
  "timestamp": "2026-09-15T14:40:00Z"
}
```

---

### Authentication (`/api/auth`)

#### 1. Register User
- **Method / Path**: `POST /api/auth/register`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "Jane Doe",
    "height": 172.5,
    "weight": 65.0,
    "gender": "FEMALE"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "type": "Bearer",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "name": "Jane Doe"
    }
  }
  ```

#### 2. Login User
- **Method / Path**: `POST /api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "type": "Bearer",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "name": "Jane Doe"
    }
  }
  ```

#### 3. Google OAuth Login / Provision
- **Method / Path**: `POST /api/auth/google`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@gmail.com",
    "name": "Alex Rivera",
    "googleId": "g-123456789"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Google authentication successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiJ9...",
      "type": "Bearer",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@gmail.com",
      "name": "Alex Rivera"
    }
  }
  ```

---

### User Profile (`/api/users`)

#### 1. Get Current User Profile
- **Method / Path**: `GET /api/users/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "name": "Jane Doe",
      "height": 172.5,
      "weight": 65.0,
      "gender": "FEMALE",
      "stylePreferences": "Casual, Minimalist",
      "createdAt": "2026-09-15T14:40:00Z",
      "updatedAt": "2026-09-15T14:40:00Z"
    }
  }
  ```

#### 2. Update User Profile
- **Method / Path**: `PUT /api/users/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "height": 174.0,
    "weight": 64.0,
    "gender": "FEMALE",
    "stylePreferences": "Vintage, Classic"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "name": "Jane Doe",
      "height": 174.0,
      "weight": 64.0,
      "gender": "FEMALE",
      "stylePreferences": "Vintage, Classic",
      "createdAt": "2026-09-15T14:40:00Z",
      "updatedAt": "2026-09-15T14:42:00Z"
    }
  }
  ```

---

### Avatar & Personal Representation (`/api/avatars`)

#### 1. Upload Avatar Photo
- **Method / Path**: `POST /api/avatars/upload`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (Binary image file: JPG, PNG, WEBP, max 10MB)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Avatar uploaded successfully",
    "data": {
      "id": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imageKey": "avatars/3fa85f64-5717-4562-b3fc-2c963f66afa6/7b8f9e61-8212-4c6e-a342-6e2798e2bb61.jpg",
      "imageUrl": "http://localhost:9000/wardrobe-storage/avatars/3fa85f64-5717-4562-b3fc-2c963f66afa6/7b8f9e61-8212-4c6e-a342-6e2798e2bb61.jpg",
      "source": "UPLOAD",
      "isCanonical": true,
      "createdAt": "2026-09-15T14:45:00Z",
      "updatedAt": "2026-09-15T14:45:00Z"
    }
  }
  ```

#### 2. List User Avatars
- **Method / Path**: `GET /api/avatars`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "imageKey": "avatars/3fa85f64-5717-4562-b3fc-2c963f66afa6/7b8f9e61-8212-4c6e-a342-6e2798e2bb61.jpg",
        "imageUrl": "http://localhost:9000/wardrobe-storage/avatars/...",
        "source": "UPLOAD",
        "isCanonical": true,
        "createdAt": "2026-09-15T14:45:00Z"
      }
    ]
  }
  ```

#### 3. Get Canonical Avatar
- **Method / Path**: `GET /api/avatars/canonical`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "imageKey": "avatars/...",
      "imageUrl": "http://localhost:9000/wardrobe-storage/...",
      "source": "UPLOAD",
      "isCanonical": true
    }
  }
  ```

#### 4. Set Canonical Avatar
- **Method / Path**: `PUT /api/avatars/{id}/canonical`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Canonical avatar updated successfully",
    "data": {
      "id": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "isCanonical": true
    }
  }
  ```

#### 5. Delete Avatar
- **Method / Path**: `DELETE /api/avatars/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Avatar deleted successfully"
  }
  ```

---

### Wardrobe Management (`/api/wardrobe/items`)

#### 1. Create Wardrobe Item
- **Method / Path**: `POST /api/wardrobe/items`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `frontImage`: (Required, File) Binary image (JPG, PNG, WEBP, max 10MB)
  - `backImage`: (Optional, File) Binary image (JPG, PNG, WEBP, max 10MB)
  - `category`: (Required, String) e.g. `TOPS`, `BOTTOMS`, `DRESSES`, `OUTERWEAR`, `SHOES`, `ACCESSORIES`
  - `subCategory`: (Optional, String) e.g. `t-shirt`, `jeans`, `blazer`
  - `color`: (Optional, String) e.g. `navy blue`
  - `pattern`: (Optional, String) e.g. `striped`, `solid`
  - `fit`: (Optional, String) e.g. `slim`, `oversized`, `regular`
  - `season`: (Optional, String) e.g. `SUMMER`, `WINTER`, `ALL_SEASON`
  - `notes`: (Optional, String) e.g. `Favorite denim jacket`
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Wardrobe item created successfully",
    "data": {
      "id": "e4a2b1c0-4321-4def-9876-543210abcdef",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "category": "TOPS",
      "subCategory": "t-shirt",
      "color": "navy blue",
      "pattern": "solid",
      "fit": "regular",
      "season": "SUMMER",
      "notes": "Comfortable cotton tee",
      "images": [
        {
          "id": "11111111-2222-3333-4444-555555555555",
          "imageKey": "wardrobe/3fa85f64-.../e4a2b1c0-..._FRONT_....jpg",
          "imageUrl": "http://localhost:9000/wardrobe-storage/wardrobe/...",
          "viewType": "FRONT",
          "createdAt": "2026-09-15T15:00:00Z"
        }
      ],
      "createdAt": "2026-09-15T15:00:00Z",
      "updatedAt": "2026-09-15T15:00:00Z"
    }
  }
  ```

#### 2. List Wardrobe Items
- **Method / Path**: `GET /api/wardrobe/items`
- **Auth Required**: Yes (`Bearer <token>`)
- **Query Parameters**:
  - `category`: (Optional, String) Filter by garment category (e.g. `TOPS`, `BOTTOMS`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e4a2b1c0-4321-4def-9876-543210abcdef",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "category": "TOPS",
        "subCategory": "t-shirt",
        "color": "navy blue",
        "pattern": "solid",
        "fit": "regular",
        "season": "SUMMER",
        "notes": "Comfortable cotton tee",
        "images": [ ... ],
        "createdAt": "2026-09-15T15:00:00Z",
        "updatedAt": "2026-09-15T15:00:00Z"
      }
    ]
  }
  ```

#### 3. Get Wardrobe Item by ID
- **Method / Path**: `GET /api/wardrobe/items/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e4a2b1c0-4321-4def-9876-543210abcdef",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "category": "TOPS",
      "subCategory": "t-shirt",
      "color": "navy blue",
      "pattern": "solid",
      "fit": "regular",
      "season": "SUMMER",
      "notes": "Comfortable cotton tee",
      "images": [ ... ],
      "createdAt": "2026-09-15T15:00:00Z",
      "updatedAt": "2026-09-15T15:00:00Z"
    }
  }
  ```

#### 4. Update Wardrobe Item Metadata
- **Method / Path**: `PUT /api/wardrobe/items/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "category": "TOPS",
    "subCategory": "polo shirt",
    "color": "dark navy",
    "pattern": "solid",
    "fit": "slim",
    "season": "ALL_SEASON",
    "notes": "Updated notes"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Wardrobe item updated successfully",
    "data": { ... }
  }
  ```

#### 5. Delete Wardrobe Item
- **Method / Path**: `DELETE /api/wardrobe/items/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Wardrobe item deleted successfully"
  }
#### 6. Suggest Garment Metadata (AI Assistance)
- **Method / Path**: `POST /api/wardrobe/suggest-metadata` (also accessible at `/api/wardrobe/items/suggest-metadata`)
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: (Required, File) Garment photo (JPG, PNG, WEBP, max 10MB)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Metadata suggestions generated successfully",
    "data": {
      "category": "TOPS",
      "subCategory": "t-shirt",
      "color": "Navy Blue",
      "pattern": "solid",
      "fit": "regular",
      "season": "SUMMER",
      "confidence": 0.93,
      "detectedTags": [
        "casual-wear",
        "short-sleeved",
        "navy blue"
      ],
      "isAiGenerated": true
    }
  }
  ```

---

### Outfit Management & Generation (`/api/outfits`)

#### 1. Generate Automatic Outfit (Rule-Based Occasion Engine)
- **Method / Path**: `POST /api/outfits/generate-automatic`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "occasion": "CASUAL",
    "season": "SUMMER",
    "includeShoes": true,
    "includeOuterwear": false,
    "name": "Weekend Casual"
  }
  ```
- **Supported Occasions**: `CASUAL`, `FORMAL`, `WORK`, `PARTY`, `SUMMER`, `WINTER`, `MINIMAL`, `LOUNGEWEAR`, `ACTIVEWEAR`.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Automatic outfit generated successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Weekend Casual",
      "source": "AUTOMATIC_RULE_ENGINE",
      "isFavorite": false,
      "items": [
        {
          "id": "e4a2b1c0-4321-4def-9876-543210abcdef",
          "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "category": "TOPS",
          "subcategory": "t-shirt",
          "color": "Navy Blue",
          "primaryImageUrl": "http://localhost:9000/wardrobe-storage/...",
          "images": [ ... ],
          "createdAt": "2026-09-15T15:00:00Z"
        },
        {
          "id": "f5b3c2d1-5432-4eef-8765-654321fedcba",
          "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "category": "BOTTOMS",
          "subcategory": "shorts",
          "color": "Beige",
          "primaryImageUrl": "http://localhost:9000/wardrobe-storage/...",
          "images": [ ... ],
          "createdAt": "2026-09-15T15:05:00Z"
        },
        {
          "id": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
          "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "category": "SHOES",
          "subcategory": "sneakers",
          "color": "White",
          "primaryImageUrl": "http://localhost:9000/wardrobe-storage/...",
          "images": [ ... ],
          "createdAt": "2026-09-15T15:10:00Z"
        }
      ],
      "createdAt": "2026-09-16T08:50:00Z",
      "updatedAt": "2026-09-16T08:50:00Z"
    }
  }
  ```

#### 2. Generate Controlled Outfit
- **Method / Path**: `POST /api/outfits/generate-controlled`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Summer Casual",
    "categories": ["TOPS", "BOTTOMS"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Controlled outfit generated successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Summer Casual",
      "source": "CONTROLLED_GENERATION",
      "isFavorite": false,
      "items": [ ... ],
      "createdAt": "2026-09-16T08:00:00Z",
      "updatedAt": "2026-09-16T08:00:00Z"
    }
  }
  ```

#### 3. Create Manual Outfit
- **Method / Path**: `POST /api/outfits`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "name": "My Custom Set",
    "itemIds": [
      "e4a2b1c0-4321-4def-9876-543210abcdef",
      "f5b3c2d1-5432-4eef-8765-654321fedcba"
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Outfit created successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "My Custom Set",
      "source": "MANUAL",
      "isFavorite": false,
      "items": [ ... ],
      "createdAt": "2026-09-16T08:00:00Z",
      "updatedAt": "2026-09-16T08:00:00Z"
    }
  }
  ```

#### 4. List Outfits (History & Multi-Dimensional Filtering)
- **Method / Path**: `GET /api/outfits`
- **Auth Required**: Yes (`Bearer <token>`)
- **Query Parameters**:
  - `status`: (Optional, String) Filter by outfit state: `SAVED`, `REJECTED`, `DRAFT`, `ARCHIVED`.
  - `isFavorite`: (Optional, Boolean) Filter by favorited flag (`true` or `false`).
  - `source`: (Optional, String) Filter by creation source: `MANUAL`, `CONTROLLED_GENERATION`, `AUTOMATIC_RULE_ENGINE`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Summer Casual",
        "source": "CONTROLLED_GENERATION",
        "status": "SAVED",
        "occasion": null,
        "isFavorite": true,
        "items": [ ... ],
        "createdAt": "2026-09-16T08:00:00Z",
        "updatedAt": "2026-09-16T08:00:00Z"
      }
    ]
  }
  ```

#### 5. Get Outfit by ID
- **Method / Path**: `GET /api/outfits/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Summer Casual",
      "source": "CONTROLLED_GENERATION",
      "status": "SAVED",
      "occasion": null,
      "isFavorite": true,
      "items": [ ... ],
      "createdAt": "2026-09-16T08:00:00Z",
      "updatedAt": "2026-09-16T08:00:00Z"
    }
  }
  ```

#### 6. Update Outfit
- **Method / Path**: `PUT /api/outfits/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Updated Outfit Name",
    "isFavorite": true,
    "status": "SAVED"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outfit updated successfully",
    "data": { ... }
  }
  ```

#### 7. Toggle or Set Favorite Status
- **Method / Path**: `PUT /api/outfits/{id}/favorite`
- **Auth Required**: Yes (`Bearer <token>`)
- **Query Parameters**:
  - `isFavorite`: (Optional, Boolean) Explicit boolean to set; if omitted, toggles current value.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outfit favorite status updated successfully",
    "data": { ... }
  }
  ```

#### 8. Save Outfit
- **Method / Path**: `PUT /api/outfits/{id}/save`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outfit saved successfully",
    "data": { ... }
  }
  ```

#### 9. Reject Outfit
- **Method / Path**: `PUT /api/outfits/{id}/reject`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outfit rejected successfully",
    "data": { ... }
  }
  ```

#### 10. Regenerate Outfit (Fresh Permutation)
- **Method / Path**: `POST /api/outfits/{id}/regenerate`
- **Auth Required**: Yes (`Bearer <token>`)
- **Description**: Re-executes the outfit generation pipeline using the original outfit's generation mode, occasion, and categories to produce an alternative garment combination.
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Outfit regenerated successfully",
    "data": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Regenerated Summer Casual",
      "source": "CONTROLLED_GENERATION",
      "status": "SAVED",
      "occasion": null,
      "isFavorite": false,
      "items": [ ... ],
      "createdAt": "2026-09-16T09:00:00Z",
      "updatedAt": "2026-09-16T09:00:00Z"
    }
  }
  ```

#### 11. Delete Outfit
- **Method / Path**: `DELETE /api/outfits/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Outfit deleted successfully"
  }
  ```

---

### Virtual Try-On Infrastructure (`/api/try-ons`)

#### 1. Create Outfit Try-On Job
- **Method / Path**: `POST /api/try-ons`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "outfitId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61"
  }
  ```
  *(Note: `avatarId` is optional; if omitted, automatically uses the user's active canonical avatar)*
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Try-on job submitted successfully",
    "data": {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "outfitId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "status": "PENDING",
      "resultImageKey": null,
      "resultImageUrl": null,
      "errorCode": null,
      "errorMessage": null,
      "startedAt": "2026-09-16T12:00:00Z",
      "completedAt": null,
      "createdAt": "2026-09-16T12:00:00Z",
      "updatedAt": "2026-09-16T12:00:00Z"
    }
  }
  ```

#### 2. Create Single-Garment Try-On Job
- **Method / Path**: `POST /api/try-ons/single-item`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "itemId": "e4a2b1c0-4321-4def-9876-543210abcdef",
    "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Single item try-on job submitted successfully",
    "data": {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "outfitId": "d4e5f6a7-b8c9-0123-def0-123456789012",
      "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "status": "PENDING",
      "createdAt": "2026-09-16T12:00:00Z"
    }
  }
  ```

#### 3. List User Try-On Jobs
- **Method / Path**: `GET /api/try-ons`
- **Auth Required**: Yes (`Bearer <token>`)
- **Query Parameters**:
  - `status`: (Optional, String) Filter by status: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "outfitId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
        "status": "COMPLETED",
        "resultImageKey": "tryon/3fa85f64-.../c3d4e5f6-....jpg",
        "resultImageUrl": "http://localhost:9000/wardrobe-storage/tryon/3fa85f64-.../c3d4e5f6-....jpg",
        "startedAt": "2026-09-16T12:00:00Z",
        "completedAt": "2026-09-16T12:00:05Z",
        "createdAt": "2026-09-16T12:00:00Z"
      }
    ]
  }
  ```

#### 4. Get Single Try-On Job Status & Result
- **Method / Path**: `GET /api/try-ons/{id}`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "outfitId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "avatarId": "7b8f9e61-8212-4c6e-a342-6e2798e2bb61",
      "status": "COMPLETED",
      "resultImageKey": "tryon/3fa85f64-.../c3d4e5f6-....jpg",
      "resultImageUrl": "http://localhost:9000/wardrobe-storage/tryon/3fa85f64-.../c3d4e5f6-....jpg",
      "startedAt": "2026-09-16T12:00:00Z",
      "completedAt": "2026-09-16T12:00:05Z"
    }
  }
  ```

#### 5. Internal Try-On Worker Callback
- **Method / Path**: `POST /api/internal/try-ons/callback`
- **Auth Required**: `X-Internal-Secret` header matching configured internal secret
- **Request Body**:
  ```json
  {
    "jobId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "status": "COMPLETED",
    "resultImageKey": "tryon/3fa85f64-.../c3d4e5f6-....jpg",
    "resultImageUrl": "http://localhost:9000/wardrobe-storage/tryon/...",
    "startedAt": "2026-09-16T12:00:00Z",
    "completedAt": "2026-09-16T12:00:05Z"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Try-on job callback processed successfully",
    "data": { ... }
  }
  ```

---

### Health & Connectivity (`/api/health`)
- `GET /api/health` — Full health probe (Database, Redis, MinIO storage)
- `GET /api/health/ping` — Lightweight health ping

---

## 2. AI Service APIs (`/api/ai`)
- `GET /api/ai/health` — AI service status & dependencies
- `GET /api/ai/ping` — AI service ping
- `POST /api/ai/metadata/suggest` — Extract clothing metadata suggestions from uploaded image (multipart `file`).
- `POST /api/ai/tryon/process-mock` — Direct test endpoint for enhanced mock VTON image synthesis and S3 upload.
- `POST /api/ai/tryon/process` — Direct test endpoint that routes through full dual-mode worker (Fashn.ai if `FASHN_API_KEY` set, else enhanced mock).

---

## Error: Daily Try-On Quota Exceeded

When a user has reached their daily try-on limit (default: 5/day, configurable via `TRYON_DAILY_LIMIT`):

- **HTTP Status**: `400 Bad Request`
- **Endpoints affected**: `POST /api/try-ons`, `POST /api/try-ons/single-item`
- **Response**:
  ```json
  {
    "success": false,
    "status": 400,
    "error": "Bad Request",
    "message": "Daily try-on limit of 5 reached. Please try again tomorrow.",
    "path": "/api/try-ons",
    "timestamp": "2026-09-17T..."
  }
  ```

---

## Log of Changes

| Date | Phase | Description | Author |
| :--- | :--- | :--- | :--- |
| 2026-09-15 | Phase 0 | Added health & ping endpoints | AI Assistant |
| 2026-09-15 | Phase 2 | Added JWT Auth (`/api/auth/*`) and Profile endpoints (`/api/users/*`) | AI Assistant |
| 2026-09-15 | Phase 3 | Added Avatar endpoints (`/api/avatars/upload`, `GET /api/avatars`, `GET /api/avatars/canonical`, `PUT /api/avatars/{id}/canonical`, `DELETE /api/avatars/{id}`) | AI Assistant |
| 2026-09-15 | Phase 4 | Added Wardrobe endpoints (`POST /api/wardrobe/items`, `GET /api/wardrobe/items`, `GET /api/wardrobe/items/{id}`, `PUT /api/wardrobe/items/{id}`, `DELETE /api/wardrobe/items/{id}`) | AI Assistant |
| 2026-09-15 | Phase 5 | Added AI Metadata Suggestion endpoints (`POST /api/wardrobe/suggest-metadata`, `POST /api/ai/metadata/suggest`) | AI Assistant |
| 2026-09-16 | Phase 6 | Added Outfit endpoints (`POST /api/outfits/generate-controlled`, `POST /api/outfits`, `GET /api/outfits`, `GET /api/outfits/{id}`, `DELETE /api/outfits/{id}`) | AI Assistant |
| 2026-09-16 | Phase 7 | Added Automatic Outfit Generation endpoint (`POST /api/outfits/generate-automatic`) | AI Assistant |
| 2026-09-16 | Phase 8 | Added Outfit Interaction & History endpoints (`PUT /api/outfits/{id}/favorite`, `PUT /api/outfits/{id}/save`, `PUT /api/outfits/{id}/reject`, `POST /api/outfits/{id}/regenerate`, `PUT /api/outfits/{id}`, and filtered `GET /api/outfits`) | AI Assistant |
| 2026-09-16 | Phase 9 | Added Try-On Infrastructure endpoints (`POST /api/try-ons`, `POST /api/try-ons/single-item`, `GET /api/try-ons`, `GET /api/try-ons/{id}`, `POST /api/internal/try-ons/callback`, `POST /api/ai/tryon/process-mock`) | AI Assistant |
| 2026-09-17 | Phase 10 | Added dual-mode VTON (Fashn.ai + enhanced PIL mock), daily quota enforcement (400 on limit exceeded), `/api/ai/tryon/process` endpoint | AI Assistant |

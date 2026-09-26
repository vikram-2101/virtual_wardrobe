# AI Virtual Wardrobe

A multi-service web application that lets users build a personal digital wardrobe, generate outfit combinations, and visualize selected clothing on their own 2D person representation using AI virtual try-on (VTON).

## Architecture

* **Frontend**: React 18, TypeScript, Tailwind CSS, Vite (`frontend/`)
* **Main Backend**: Java 21, Spring Boot 3.3, Spring Data JPA, Redis, S3 SDK (`backend/`)
* **AI Service**: Python 3.12, FastAPI, Uvicorn, Boto3, Redis (`ai-service/`)
* **Infrastructure**: PostgreSQL 16, Redis 7, MinIO S3 Object Storage (`docker-compose.yml`)

## Quickstart with Docker Compose

1. Clone or open the repository root.
2. Copy environment file (optional):
   ```bash
   cp .env.example .env
   ```
3. Start the entire application stack:
   ```bash
   docker-compose up --build
   ```
4. Access the services:
   * **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   * **Spring Boot API**: [http://localhost:8080](http://localhost:8080)
   * **AI FastAPI Service & Swagger Docs**: [http://localhost:8000/api/ai/docs](http://localhost:8000/api/ai/docs)
   * **MinIO Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin`)

## Local Development (Without Docker)

### 1. Start Backing Services
```bash
docker-compose up -d postgres redis minio create-buckets
```

### 2. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```

### 3. AI Service (Python FastAPI)
```bash
cd ai-service
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. React Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentation
* [Software Requirements Document](docs/SRD2.md)
* [Structured Roadmap](docs/ROADMAP.md)
* [Agent Guidelines](docs/AGENT.md)
* [API Reference](docs/API.md)
* [Database Schema](docs/DATABASE.md)
* [Architectural Decisions](docs/ARCHITECTURAL_DECISION.md)
* [Implementation Tracker](docs/IMPLEMENTATION_TRACKER.md)


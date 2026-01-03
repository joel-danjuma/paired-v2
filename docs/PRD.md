# Product Requirements Document (PRD)
# Paired - AI-Powered Roommate Matching Platform

**Version:** 1.0  
**Last Updated:** January 3, 2026  
**Status:** Production Deployed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Core Features](#core-features)
6. [Data Models](#data-models)
7. [API Architecture](#api-architecture)
8. [Security & Authentication](#security--authentication)
9. [Infrastructure & Deployment](#infrastructure--deployment)
10. [Performance Requirements](#performance-requirements)
11. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Paired** is a full-stack web application designed to revolutionize the roommate finding experience through AI-powered matching algorithms. The platform leverages natural language processing, machine learning, and geographic data to connect compatible individuals seeking housing arrangements.

### Key Differentiators
- **AI-Powered Matching**: Uses Google's Generative AI and custom ML algorithms
- **Natural Language Processing**: Users describe preferences in plain English
- **Intelligent Recommendations**: Collaborative and content-based filtering
- **Real-Time Communication**: WebSocket-based messaging
- **Comprehensive Verification**: Multi-layer identity and background checks

---

## Product Overview

### Problem Statement
Finding a compatible roommate is challenging, time-consuming, and often results in mismatched living situations. Traditional platforms rely on manual searching and basic filters, lacking intelligent matching capabilities.

### Solution
Paired uses advanced AI and machine learning to:
- Extract user preferences from natural language
- Calculate compatibility scores using multiple algorithms
- Provide personalized recommendations
- Facilitate secure communication
- Verify user identities for safety

### Target Users
1. **Seekers**: Individuals looking for a place to live or a roommate
2. **Providers**: People with available rooms or apartments
3. **Agents**: Property managers or real estate agents (admin features)

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **TypeScript** | 5.5.3 | Type Safety |
| **Vite** | 5.4.1 | Build Tool & Dev Server |
| **Tailwind CSS** | 3.4.11 | Styling Framework |
| **shadcn/ui** | Latest | Component Library (Radix UI) |
| **React Router** | 6.26.2 | Client-side Routing |
| **TanStack Query** | 5.56.2 | Data Fetching & Caching |
| **React Hook Form** | 7.53.0 | Form Management |
| **Zod** | 3.23.8 | Schema Validation |
| **Lucide React** | 0.462.0 | Icon Library |

**UI Components (Radix UI primitives):**
- Dialog, Dropdown, Popover, Toast
- Tabs, Accordion, Collapsible
- Avatar, Badge, Button, Card
- Form inputs and controls

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | Web Framework |
| **Python** | 3.10 | Programming Language |
| **Uvicorn** | 0.24.0 | ASGI Server |
| **Pydantic** | 2.5.0 | Data Validation |
| **SQLAlchemy** | 2.0.23 | ORM (Async Support) |
| **asyncpg** | 0.29.0 | PostgreSQL Driver |
| **Alembic** | 1.13.1 | Database Migrations |

**AI & Machine Learning:**
- **Google Generative AI** (0.5.4): Natural language understanding
- **OpenAI** (1.3.7): Embeddings generation
- **scikit-learn** (1.3.2): ML algorithms
- **NumPy** (1.24.4): Numerical computing
- **Pandas** (2.1.4): Data manipulation

**Authentication & Security:**
- **python-jose** (3.3.0): JWT token handling
- **passlib** (1.7.4): Password hashing (bcrypt)
- **cryptography** (>=3.4.0): Encryption utilities

**Communication:**
- **FastAPI-Mail** (1.4.1): Email notifications
- **Twilio** (8.11.0): SMS verification

**File Storage:**
- **boto3** (1.34.0): AWS S3 integration
- **Pillow** (10.1.0): Image processing

### Database Stack

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | 15 | Primary Database |
| **PostGIS** | 3.4 | Geographic/Spatial Data |
| **pgvector** | 0.5.1 | Vector Similarity Search |
| **GeoAlchemy2** | 0.14.2 | Geographic Objects in SQLAlchemy |
| **Redis** | 7-alpine | Caching & Session Store |

### DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | Latest | Multi-container Orchestration |
| **Nginx** | Latest | Reverse Proxy & Load Balancer |
| **Ubuntu** | Latest LTS | Server OS |
| **UFW** | - | Firewall |
| **Let's Encrypt/Certbot** | - | SSL Certificates |

### Monitoring & Testing

- **Pytest** (7.4.3): Testing framework
- **pytest-asyncio** (0.21.1): Async test support
- **httpx** (>=0.27.0): HTTP client for testing
- **Sentry SDK** (1.38.0): Error tracking & monitoring
- **structlog** (23.2.0): Structured logging

### Development Tools

- **Black** (23.11.0): Code formatting
- **isort** (5.12.0): Import sorting
- **flake8** (6.1.0): Linting
- **ESLint**: Frontend linting
- **TypeScript ESLint**: TypeScript linting

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   Browser    │   │    Mobile    │   │   Desktop    │       │
│  │  (React SPA) │   │   (Future)   │   │   (Future)   │       │
│  └──────┬───────┘   └──────────────┘   └──────────────┘       │
└─────────┼──────────────────────────────────────────────────────┘
          │
          │ HTTPS
          │
┌─────────▼──────────────────────────────────────────────────────┐
│                      WEB SERVER LAYER                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                 Nginx Reverse Proxy                     │    │
│  │    • SSL Termination                                    │    │
│  │    • Load Balancing                                     │    │
│  │    • Static File Serving                                │    │
│  │    • Request Routing                                    │    │
│  └─────────────────────────┬──────────────────────────────┘    │
└────────────────────────────┼───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                   APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         FastAPI Application (Uvicorn)                │      │
│  │                                                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │      │
│  │  │   Auth      │  │   Routes    │  │ Middleware │  │      │
│  │  │  • JWT      │  │  • Users    │  │  • CORS    │  │      │
│  │  │  • OAuth    │  │  • Listings │  │  • Trusted │  │      │
│  │  │             │  │  • Matches  │  │  • Perf    │  │      │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │      │
│  │                                                       │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │      │
│  │  │   AI/ML     │  │  Services   │  │  WebSocket │  │      │
│  │  │  • LLM      │  │  • Matching │  │  • Chat    │  │      │
│  │  │  • Embeddi│  │  • Verify   │  │  • Updates │  │      │
│  │  │  • ML Algos │  │  • Email    │  │            │  │      │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                      DATA LAYER                                 │
│  ┌───────────────────┐          ┌───────────────────┐          │
│  │   PostgreSQL 15   │          │    Redis 7        │          │
│  │  • pgvector       │          │  • Caching        │          │
│  │  • PostGIS        │          │  • Sessions       │          │
│  │  • User Data      │          │  • Rate Limiting  │          │
│  │  • Listings       │          └───────────────────┘          │
│  │  • Messages       │                                          │
│  │  • Embeddings     │                                          │
│  └───────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │   Google AI   │ │   OpenAI      │ │   AWS S3      │        │
│  │  Gemini API   │ │  Embeddings   │ │  File Storage │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │    Twilio     │ │   SendGrid    │ │   Checkr      │        │
│  │  SMS Verify   │ │   Email       │ │  Background   │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Browser sends HTTP/HTTPS request
2. **Nginx** → Receives request, handles SSL, forwards to backend
3. **FastAPI Middleware** → CORS, Auth, Performance tracking
4. **Route Handler** → Processes business logic
5. **Service Layer** → Interacts with databases, external APIs
6. **Response** → Returns JSON data through the stack

### Data Flow Architecture

```
User Input → AI Processing → Preference Extraction → Embedding Generation
                ↓
          Database Storage
                ↓
    Matching Algorithm (ML) → Similarity Search → Recommendations
                ↓
          User Interface
```

---

## Core Features

### 1. User Authentication & Authorization

**Components:**
- JWT-based authentication
- Refresh token mechanism
- Role-based access control (Seeker, Provider, Agent, Admin)
- Password hashing with bcrypt
- Email verification
- Phone verification (Twilio)

**Endpoints:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### 2. User Profile Management

**Features:**
- Comprehensive user profiles
- Profile completion scoring
- Lifestyle preferences
- Photo uploads (AWS S3)
- Bio and interests
- Verification status badges

**Data Stored:**
- Personal information
- Contact details
- Preferences (JSON)
- Lifestyle data (JSON)
- Verification status

### 3. AI-Powered Matching System

**Machine Learning Components:**

**a) Content-Based Filtering**
- User preference analysis
- Feature engineering
- Similarity calculations
- Vector embeddings (pgvector)

**b) Collaborative Filtering**
- User behavior tracking
- Interaction patterns
- Implicit feedback signals
- Matrix factorization

**c) Hybrid Approach**
- Weighted combination of both methods
- Personalized ranking
- Real-time updates

**Matching Algorithm:**
```python
compatibility_score = (
    0.4 * content_similarity +
    0.3 * collaborative_score +
    0.2 * geographic_proximity +
    0.1 * activity_score
)
```

### 4. Natural Language Processing

**AI Agent Features:**
- Google Generative AI integration
- Preference extraction from text
- Conversational interface
- Context-aware responses
- Thread-based conversations

**Example Input:**
```
"I need a roommate in Brooklyn under $1200 who's clean and quiet"
```

**Extracted Preferences:**
```json
{
  "location": "Brooklyn",
  "max_budget": 1200,
  "cleanliness": "very clean",
  "social_habits": ["quiet"]
}
```

### 5. Listing Management

**Features:**
- Create/edit/delete listings
- Multiple listing types (Room, Roommate Wanted)
- Rich property details
- Image galleries
- Geographic search (PostGIS)
- Status management (Active, Paused, Filled, Expired)

**Search Capabilities:**
- Geographic radius search
- Price range filtering
- Amenity filtering
- Availability date matching

### 6. Real-Time Messaging

**Technology:**
- WebSocket connections
- Real-time message delivery
- Typing indicators
- Read receipts
- Message history persistence

**Features:**
- One-on-one conversations
- Message threading
- File attachments
- Push notifications

### 7. Verification System

**Verification Types:**
1. **Email Verification**: Token-based confirmation
2. **Phone Verification**: SMS OTP (Twilio)
3. **Identity Verification**: Document upload & validation
4. **Background Checks**: Integration with Checkr API

**Verification Status:**
- Unverified
- Email Verified
- Phone Verified
- Identity Verified
- Background Checked

### 8. Match Management

**Features:**
- View recommendations
- Accept/decline matches
- Mutual match notifications
- Match expiration
- Match history

**Match States:**
- Pending
- Mutual (both accepted)
- Declined
- Expired

### 9. Notifications System

**Notification Types:**
- New matches
- New messages
- Profile views
- Listing updates
- Verification confirmations
- System alerts

**Delivery Channels:**
- In-app notifications
- Email
- SMS (optional)

### 10. Admin Dashboard

**Capabilities:**
- User management
- Content moderation
- Analytics and reporting
- System health monitoring
- Feature flags

---

## Data Models

### Core Entities

#### 1. User
```python
- id: UUID (PK)
- email: String (unique, indexed)
- phone: String (optional)
- password_hash: String
- user_type: Enum (SEEKER, PROVIDER, AGENT, ADMIN)
- first_name: String
- last_name: String
- date_of_birth: DateTime
- bio: Text
- profile_image_url: String
- verification_status: JSON
- profile_completion_score: Integer
- preferences: JSON
- lifestyle_data: JSON
- is_active: Boolean
- is_verified_email: Boolean
- is_verified_phone: Boolean
- is_verified_identity: Boolean
- is_background_checked: Boolean
- created_at: DateTime (indexed)
- updated_at: DateTime
- last_active: DateTime
```

#### 2. Listing
```python
- id: UUID (PK)
- user_id: UUID (FK → User)
- listing_type: Enum (ROOM, ROOMMATE_WANTED)
- status: Enum (ACTIVE, PAUSED, FILLED, EXPIRED)
- title: String
- description: Text
- location: Geography(POINT, 4326)  # PostGIS
- address: String
- city: String
- state: String
- zip_code: String
- country: String
- price_min: Decimal
- price_max: Decimal
- price_range: JSON
- property_details: JSON
- lifestyle_preferences: JSON
- images: JSON (array of URLs)
- available_from: DateTime
- available_until: DateTime
- view_count: Integer
- contact_count: Integer
- created_at: DateTime (indexed)
- updated_at: DateTime
- expires_at: DateTime
```

#### 3. Match
```python
- id: UUID (PK)
- user_id: UUID (FK → User)
- matched_user_id: UUID (FK → User)
- status: Enum (PENDING, MUTUAL, DECLINED, EXPIRED)
- compatibility_score: Float
- match_reasons: JSON
- user_action: String (null, accept, decline)
- matched_user_action: String
- created_at: DateTime
- updated_at: DateTime
- expires_at: DateTime
```

#### 4. Conversation
```python
- id: UUID (PK)
- created_by: UUID (FK → User)
- listing_id: UUID (FK → Listing, optional)
- created_at: DateTime
- updated_at: DateTime

# Many-to-many relationship with users
conversation_participants:
- conversation_id: UUID
- user_id: UUID
- joined_at: DateTime
```

#### 5. Message
```python
- id: UUID (PK)
- conversation_id: UUID (FK → Conversation)
- sender_id: UUID (FK → User)
- content: Text
- message_type: Enum (TEXT, IMAGE, FILE)
- is_read: Boolean
- read_at: DateTime
- created_at: DateTime (indexed)
```

#### 6. UserEmbedding
```python
- id: UUID (PK)
- user_id: UUID (FK → User)
- embedding_type: Enum (PREFERENCES, PROFILE, BEHAVIOR)
- embedding: Vector  # pgvector
- created_at: DateTime
- updated_at: DateTime
```

#### 7. ListingEmbedding
```python
- id: UUID (PK)
- listing_id: UUID (FK → Listing)
- embedding_type: Enum (LISTING, DESCRIPTION)
- embedding: Vector  # pgvector
- created_at: DateTime
- updated_at: DateTime
```

#### 8. Notification
```python
- id: UUID (PK)
- user_id: UUID (FK → User)
- type: Enum (NEW_MATCH, NEW_MESSAGE, etc.)
- title: String
- message: Text
- data: JSON
- is_read: Boolean
- read_at: DateTime
- created_at: DateTime
```

### Database Indexes

**Performance-critical indexes:**
- `users.email` (unique)
- `users.created_at`
- `listings.city, listings.status`
- `listings.created_at`
- `listings.location` (GiST index for geographic queries)
- `matches.user_id, matches.status`
- `messages.conversation_id, messages.created_at`
- `user_embeddings.user_id`
- `listing_embeddings.listing_id`

### Vector Search Indexes

```sql
CREATE INDEX ON user_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX ON listing_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

---

## API Architecture

### API Versioning
- Base URL: `/api/v1`
- Version included in URL path
- Backward compatibility maintained

### Endpoint Structure

```
/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /refresh
│   └── POST /logout
├── /users
│   ├── GET /me
│   ├── PUT /me
│   ├── GET /{user_id}
│   └── /verification
│       ├── POST /email/send
│       ├── POST /email/confirm
│       ├── POST /phone/send
│       ├── POST /phone/confirm
│       └── POST /identity
├── /listings
│   ├── GET /
│   ├── POST /
│   ├── GET /{listing_id}
│   ├── PUT /{listing_id}
│   ├── DELETE /{listing_id}
│   └── GET /search
├── /matches
│   ├── GET /recommendations
│   ├── POST /{user_id}/action
│   └── GET /history
├── /conversations
│   ├── GET /
│   ├── POST /
│   ├── GET /{conversation_id}
│   ├── POST /{conversation_id}/messages
│   └── WS /ws/{user_id}
├── /agent
│   ├── POST /query
│   └── POST /query/{thread_id}
├── /notifications
│   ├── GET /
│   ├── PUT /{notification_id}/read
│   └── POST /mark-all-read
└── /admin
    ├── GET /users
    ├── GET /analytics
    └── POST /moderate
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-03T12:00:00Z",
    "request_id": "uuid"
  }
}
```

**Error Response:**
```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "meta": {
    "timestamp": "2026-01-03T12:00:00Z",
    "request_id": "uuid"
  }
}
```

### Rate Limiting

- **Auth endpoints**: 5 requests/minute
- **General API**: 100 requests/minute
- **Search endpoints**: 50 requests/minute
- **WebSocket**: No rate limit (connection-based)

---

## Security & Authentication

### Authentication Flow

1. User registers → Credentials validated → Password hashed
2. User logs in → Credentials verified → JWT tokens issued
3. Access token (short-lived: 24 hours)
4. Refresh token (long-lived: 30 days)
5. Token included in Authorization header for protected routes

### Security Measures

**1. Password Security:**
- bcrypt hashing (12 rounds)
- Minimum password requirements enforced
- Password reset with email verification

**2. JWT Security:**
- HS256 algorithm
- Secret key rotation capability
- Token expiration
- Refresh token rotation

**3. Input Validation:**
- Pydantic schema validation
- SQL injection prevention (ORM)
- XSS protection
- CSRF protection (SameSite cookies)

**4. CORS Configuration:**
- Whitelist approved origins
- Credential support enabled
- Preflight request handling

**5. Rate Limiting:**
- Redis-based rate limiting
- Per-user and per-IP limits
- Gradual backoff

**6. Data Encryption:**
- HTTPS/TLS encryption in transit
- Sensitive data encrypted at rest
- Environment variables for secrets

**7. Middleware Stack:**
```python
1. TrustedHostMiddleware
2. CORSMiddleware
3. PerformanceMiddleware (custom)
4. AuthenticationMiddleware
5. RateLimitMiddleware
```

---

## Infrastructure & Deployment

### Current Deployment: Hostinger VPS

**Server Specifications:**
- **OS**: Ubuntu 22.04 LTS
- **Server**: Nginx (reverse proxy)
- **Container Runtime**: Docker + Docker Compose
- **Database**: PostgreSQL 15 (containerized)
- **Cache**: Redis 7 (containerized)
- **Application**: FastAPI + React (containerized)

### Container Architecture

```yaml
services:
  postgres:
    image: Custom (postgis/postgis + pgvector)
    ports: 127.0.0.1:5432:5432
    volumes: postgres_data

  redis:
    image: redis:7-alpine
    ports: 127.0.0.1:6379:6379
    volumes: redis_data

  app:
    build: Multi-stage Dockerfile
    ports: 127.0.0.1:8000:8000
    depends_on: [postgres, redis]
```

### Multi-Stage Docker Build

**Stage 1: Frontend Builder**
```dockerfile
FROM node:18-alpine
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
```

**Stage 2: Backend + Static Files**
```dockerfile
FROM python:3.10-slim
COPY backend/ /app/
COPY --from=frontend-builder /app/frontend/dist /app/static
RUN pip install -r requirements.txt
CMD uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/TLS Configuration

- **Certificate**: Let's Encrypt (Certbot)
- **Auto-renewal**: Systemd timer
- **Protocols**: TLS 1.2, TLS 1.3
- **Ciphers**: Strong cipher suites only

### Backup Strategy

**Database Backups:**
```bash
# Daily automated backups
docker exec paired-postgres pg_dump -U paired_user paired_db > backup_$(date +%Y%m%d).sql

# Retention: 7 daily, 4 weekly, 3 monthly
```

**Volume Backups:**
- Docker volumes backed up nightly
- Stored in separate location
- Encrypted at rest

### Monitoring & Logging

**Application Logs:**
- Structured logging (structlog)
- Log rotation (logrotate)
- Centralized via Docker logging driver

**Error Tracking:**
- Sentry SDK integration
- Real-time error alerts
- Performance monitoring

**Health Checks:**
- `/api/v1/health` endpoint
- Database connection check
- Redis connection check

### Scaling Considerations

**Horizontal Scaling (Future):**
- Load balancer (Nginx/HAProxy)
- Multiple app containers
- Shared PostgreSQL instance
- Redis cluster

**Vertical Scaling:**
- Increase VPS resources
- Optimize database queries
- Implement caching layers

---

## Performance Requirements

### Response Time Targets

| Endpoint Type | Target | Maximum |
|---------------|--------|---------|
| Authentication | <200ms | 500ms |
| User Profile | <150ms | 400ms |
| Listing Search | <300ms | 800ms |
| AI Query | <2s | 5s |
| Match Recommendations | <500ms | 1.5s |
| WebSocket Messages | <100ms | 300ms |

### Database Performance

- **Query Optimization**: All queries < 100ms
- **Index Usage**: 95%+ query coverage
- **Connection Pooling**: Max 20 connections
- **Query Caching**: Redis for frequently accessed data

### Caching Strategy

**Redis Cache:**
- User sessions: 24-hour TTL
- API responses: 5-minute TTL (vary by endpoint)
- Rate limit counters: 1-minute window
- Match recommendations: 1-hour TTL

### CDN & Static Assets

- Static files served by Nginx
- Image optimization (WebP, compression)
- Browser caching headers
- Future: CloudFlare CDN integration

---

## Future Roadmap

### Phase 2 (Q1 2026)

**Features:**
- [ ] Mobile applications (React Native)
- [ ] Video chat integration
- [ ] Advanced filtering options
- [ ] Save searches & alerts
- [ ] Roommate compatibility quiz

**Technical:**
- [ ] GraphQL API implementation
- [ ] ElasticSearch for advanced search
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline (GitHub Actions)

### Phase 3 (Q2 2026)

**Features:**
- [ ] Group roommate matching
- [ ] Lease management tools
- [ ] Payment integration (rent splitting)
- [ ] Review & rating system
- [ ] Virtual property tours

**Technical:**
- [ ] Microservices architecture
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Service mesh (Istio)
- [ ] Multi-region deployment

### Phase 4 (Q3-Q4 2026)

**Features:**
- [ ] Property management portal
- [ ] Landlord features
- [ ] Legal document templates
- [ ] Smart recommendations (behavior learning)
- [ ] Integration with property platforms

**Technical:**
- [ ] Machine learning pipeline automation
- [ ] A/B testing framework
- [ ] Real-time analytics dashboard
- [ ] Advanced fraud detection

---

## Appendix

### Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET_KEY=your-secret-key
GOOGLE_API_KEY=your-google-api-key
OPENAI_API_KEY=your-openai-key
```

**Optional:**
```bash
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASSWORD=...
```

### API Documentation URLs

- **Swagger UI**: `http://your-domain.com/docs`
- **ReDoc**: `http://your-domain.com/redoc`
- **OpenAPI JSON**: `http://your-domain.com/openapi.json`

### Support & Maintenance

**Maintenance Windows:**
- Weekly: Sunday 2:00 AM - 4:00 AM UTC
- Monthly: First Sunday of month (extended window)

**Support Channels:**
- GitHub Issues
- Email: support@paired.com
- Documentation: docs.paired.com

---

**Document Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-03 | System | Initial PRD creation |

---

*This document is maintained as part of the Paired project documentation and should be updated with each major release or architectural change.*



# Paired Backend Service

Backend API for Paired - An intelligent roommate and room-sharing platform powered by AI-driven matching, comprehensive verification, and natural language agent interactions.

## Features

- **User Management & Authentication**: JWT-based authentication with role-based access control
- **Intelligent Listing Management**: Room rentals and roommate requests with geospatial search
- **AI-Powered Matching Engine**: Compatibility scoring using machine learning algorithms
- **Conversational AI Agent**: Natural language processing with PydanticAI and LangGraph
- **Secure Messaging**: End-to-end encrypted messaging system
- **Verification & Safety**: Multi-stage identity verification and background checks

## Tech Stack

- **Framework**: FastAPI with async/await support
- **Database**: PostgreSQL with PostGIS and pgvector extensions
- **AI/ML**: PydanticAI, LangGraph, Google Gemini 2.5 Flash
- **Caching**: Redis for session management and caching
- **Authentication**: JWT tokens with bcrypt password hashing
- **Deployment**: Docker Compose for development

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- PostgreSQL 15+ with PostGIS and pgvector extensions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd paired-v2/backend
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration values

4. Start the services:
```bash
docker-compose up -d
```

5. The API will be available at `http://localhost:8000`

### Development Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start PostgreSQL and Redis:
```bash
docker-compose up postgres redis -d
```

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User profiles with verification status and preferences
- **listings**: Room and roommate listings with geospatial data
- **matches**: Compatibility matches between users
- **conversations**: Message threads with encryption support
- **user_embeddings**: Vector embeddings for similarity matching

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user profile

### Listings (Coming Soon)
- `GET /api/v1/listings/` - Get listings
- `POST /api/v1/listings/` - Create listing

### Matches (Coming Soon)
- `GET /api/v1/matches/` - Get matches

### Conversations (Coming Soon)
- `GET /api/v1/conversations/` - Get conversations

### AI Agent (Coming Soon)
- `POST /api/v1/agent/query` - Natural language queries

## Environment Variables

Key environment variables (see `env.example` for complete list):

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/paired_db
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your-secret-key
GOOGLE_API_KEY=your-google-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Development Roadmap

### Phase 1 (Months 1-3) - MVP
- [x] Core database schema with PostGIS and pgvector
- [x] FastAPI application structure
- [x] JWT authentication system
- [x] Basic user model and registration
- [ ] User profile management
- [ ] Basic listing management
- [ ] Simple search functionality
- [ ] Fundamental matching algorithm
- [ ] PydanticAI agent setup
- [ ] Basic LangGraph workflows
- [ ] Google Gemini API integration
- [ ] Basic messaging system

### Phase 2 (Months 4-6) - Enhanced Features
- [ ] Machine learning pipeline
- [ ] Advanced matching algorithms
- [ ] Third-party verification
- [ ] Enhanced AI agent capabilities
- [ ] Mobile API optimization

### Phase 3 (Months 7-12) - Advanced Features
- [ ] Microservices architecture
- [ ] Advanced analytics
- [ ] Enterprise security
- [ ] International expansion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is proprietary software. All rights reserved. 
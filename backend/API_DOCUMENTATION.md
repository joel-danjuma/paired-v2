# Paired Backend API Documentation

## Overview

The Paired Backend API provides endpoints for an intelligent roommate matching platform with AI-driven recommendations, comprehensive verification, and real-time messaging capabilities.

**Base URL**: `http://localhost:8000/api/v1`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "seeker",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 86400
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## User Management

### GET /users/me
Get current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "seeker",
  "is_verified_email": true,
  "profile_completion_score": 75,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### PUT /users/me
Update current user's profile.

**Request Body:**
```json
{
  "first_name": "John",
  "bio": "Looking for a clean and quiet roommate",
  "preferences": {
    "budget": 1200,
    "lifestyle": "quiet"
  }
}
```

### GET /users/{user_id}
Get a user's public profile.

## Listings

### POST /listings/
Create a new listing.

**Request Body:**
```json
{
  "listing_type": "room",
  "title": "Spacious room in downtown apartment",
  "description": "Beautiful room with great natural light",
  "city": "New York",
  "price_min": 1000,
  "price_max": 1200,
  "property_details": {
    "bedrooms": 1,
    "bathrooms": 1,
    "amenities": ["wifi", "parking"]
  }
}
```

### GET /listings/search
Search for listings with filters.

**Query Parameters:**
- `lat`: Latitude for location search
- `lon`: Longitude for location search
- `radius`: Search radius in meters (default: 10000)
- `listing_type`: Type of listing (room/roommate_wanted)
- `min_price`: Minimum price
- `max_price`: Maximum price
- `skip`: Number of results to skip (pagination)
- `limit`: Maximum number of results (default: 20)

### GET /listings/{listing_id}
Get a specific listing by ID.

## Matches

### GET /matches/recommendations
Get personalized match recommendations.

**Response:**
```json
[
  {
    "user": {
      "id": "uuid",
      "first_name": "Jane",
      "user_type": "provider",
      "is_verified_identity": true
    },
    "compatibility_score": 0.85
  }
]
```

### POST /matches/{user_id}/action
Perform an action on a match (accept/decline).

**Request Body:**
```json
{
  "action": "accept"
}
```

## Conversations

### POST /conversations/
Start a new conversation.

**Request Body:**
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "listing_id": "optional_listing_id"
}
```

### GET /conversations/
Get all conversations for current user.

### GET /conversations/{conversation_id}
Get conversation with messages.

### POST /conversations/{conversation_id}/messages
Send a message in a conversation.

**Request Body:**
```json
{
  "content": "Hi! I'm interested in your listing.",
  "message_type": "text"
}
```

### WebSocket /conversations/ws/{user_id}
Real-time messaging WebSocket endpoint.

## AI Agent

### POST /agent/query
Process natural language query.

**Request Body:**
```json
{
  "query": "I need a roommate in Brooklyn under $1200 who's clean and quiet"
}
```

**Response:**
```json
{
  "preferences": {
    "city": "Brooklyn",
    "max_budget": 1200,
    "cleanliness": "very clean",
    "social_habits": ["quiet"]
  },
  "original_query": "I need a roommate in Brooklyn under $1200 who's clean and quiet",
  "response_text": "I found 3 potential matches based on your preferences."
}
```

### POST /agent/query/{thread_id}
Continue existing conversation thread.

## Verification

### GET /users/me/verification
Get verification status.

### POST /users/me/verification/email/send
Send email verification.

### POST /users/me/verification/email/confirm
Confirm email verification.

**Request Body:**
```json
{
  "token": "verification_token"
}
```

### POST /users/me/verification/identity
Upload identity document for verification.

**Request Body:**
```json
{
  "document_type": "drivers_license",
  "document_number": "D123456789",
  "name": "John Doe",
  "date_of_birth": "1990-01-01"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "detail": "Error description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## Headers

All responses include:
- `X-Process-Time`: Request processing time in seconds
- `Content-Type`: Response content type

## Development

### Running Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 
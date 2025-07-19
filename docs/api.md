# Paired API Documentation

Welcome to the Paired API documentation. This document provides a detailed overview of all the available API endpoints.

## Base URL

The base URL for all API endpoints is `/api/v1`.

## Authentication

Most endpoints require authentication using a JWT token. The token should be included in the `Authorization` header of your requests as a Bearer token:

`Authorization: Bearer <your_jwt_token>`

## Endpoints

### 🤖 Agent

Endpoints for interacting with the AI agent.

*   **POST** `/agent/preferences`
    *   **Description:** Extracts roommate preferences from a natural language query.
    *   **Authentication:** Required
    *   **Request Body:**
        ```json
        {
          "query": "I'm looking for a clean and quiet roommate in New York with a budget of $1500."
        }
        ```
    *   **Response:**
        ```json
        {
          "city": "New York",
          "budget": 1500,
          "cleanliness": "clean",
          "social_habits": "quiet"
        }
        ```

### 🔑 Auth

Endpoints for user authentication and authorization.

*   **POST** `/auth/register`
    *   **Description:** Registers a new user.
*   **POST** `/auth/login`
    *   **Description:** Authenticates a user and returns a JWT token.
*   **POST** `/auth/logout`
    *   **Description:** Logs out the currently authenticated user.

### 💬 Conversations

Endpoints for managing conversations and messages.

*   **GET** `/conversations`
*   **GET** `/conversations/{conversation_id}/messages`
*   **POST** `/conversations/{conversation_id}/messages`

### 🏠 Listings

Endpoints for managing roommate listings.

*   **GET** `/listings`
*   **POST** `/listings`
*   **GET** `/listings/{listing_id}`
*   **PUT** `/listings/{listing_id}`
*   **DELETE** `/listings/{listing_id}`

### ❤️ Matches

Endpoints for managing user matches.

*   **GET** `/matches`
*   **POST** `/matches/accept/{match_id}`
*   **POST** `/matches/reject/{match_id}`

### 🧠 ML

Endpoints for interacting with the machine learning models.

*   **POST** `/ml/recommendations`

### 👤 Users

Endpoints for managing user profiles.

*   **GET** `/users/me`
*   **PUT** `/users/me`

### ✅ Verification

Endpoints for user verification.

*   **POST** `/verification/send`
*   **POST** `/verification/verify` 
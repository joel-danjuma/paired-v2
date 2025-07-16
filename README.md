# Paired - Your AI-Powered Roommate Matching Platform

Paired is a modern web application designed to help you find the perfect roommate. Our intelligent platform uses AI to understand your preferences and match you with compatible individuals, making the search for a roommate seamless and efficient.

## ✨ Features

*   **AI-Powered Matching:** Our advanced AI agent extracts your preferences from natural language and matches you with the most compatible roommates.
*   **Detailed User Profiles:** Create a comprehensive profile with your lifestyle habits, preferences, and what you're looking for in a roommate.
*   **Secure Authentication:** Secure user authentication and management.
*   **Real-time Chat:** Communicate with potential roommates in real-time.
*   **Listing Management:** Easily create, edit, and manage your roommate listings.

## 🚀 Tech Stack

### Frontend

*   **Framework:** React with Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with shadcn/ui
*   **State Management:** React Context API
*   **Routing:** React Router

### Backend

*   **Framework:** FastAPI
*   - **Language:** Python
*   **Database:** PostgreSQL with pgvector for vector similarity search
*   **Async Support:** SQLAlchemy with asyncpg
*   **AI/ML:** LangChain and Google Generative AI
*   **Caching:** Redis

### DevOps

*   **Containerization:** Docker
*   **Deployment:** Render

## 🏁 Getting Started

### Prerequisites

*   Docker and Docker Compose
*   Node.js and npm
*   Python and pip
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/paired.git
    cd paired
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying the `env.example` file and filling in the required values.

3.  **Build and run the application with Docker:**
    ```bash
    docker-compose up --build
    ```

The application will be available at `http://localhost:3000`.

## ⚙️ Configuration

The application's configuration is managed through environment variables. You can find all the configurable options in `backend/app/core/config.py`.

## 🚀 Deployment

This application is configured for deployment on Render. The `render.yaml` file in the root directory defines the services and deployment configuration.

## 📚 API Documentation

For detailed information about the API endpoints, please see the [API Documentation](docs/api.md). 

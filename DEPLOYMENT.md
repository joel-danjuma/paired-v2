# Paired Application Deployment Guide

This guide provides step-by-step instructions for deploying the Paired application to Render using the provided Docker configuration.

## Prerequisites

- A [Render](https://render.com/) account.
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed on your local machine.
- A [Docker Hub](https://hub.docker.com/) account.
- Your project code pushed to a GitHub repository.

## Deployment Steps

### Step 1: Build and Push the Docker Image

The project includes a multi-stage `Dockerfile` that builds the frontend, and then copies the static assets into the final backend image.

1.  **Log in to Docker Hub:**
    ```bash
    docker login
    ```

2.  **Build the Docker image:**
    From the root of the project directory, run the following command. Replace `your-dockerhub-username` with your Docker Hub username and `paired-app` with your desired image name.
    ```bash
    docker build -t your-dockerhub-username/paired-app:latest .
    ```

3.  **Push the image to Docker Hub:**
    ```bash
    docker push your-dockerhub-username/paired-app:latest
    ```

### Step 2: Set Up Services on Render

We will use a "Blueprint" on Render to define and deploy our services using the `render.yaml` file.

1.  **Navigate to the Render Dashboard:**
    Go to your [Render Dashboard](https://dashboard.render.com/).

2.  **Create a New Blueprint Instance:**
    - Click on **New +** and select **Blueprint**.
    - Connect the GitHub repository containing your project.
    - Render will automatically detect the `render.yaml` file.

3.  **Configure the Services:**
    - Render will display the services defined in `render.yaml`: `paired-app` (web service), `paired-postgres` (database), and `paired-redis` (Redis instance).
    - You may need to provide names and regions for the services if they are not already defined.

4.  **Add Environment Variables:**
    - In the `paired-app` service configuration, navigate to the **Environment** tab.
    - The `DATABASE_URL` and `REDIS_URL` are automatically configured by Render.
    - You must add any other required environment variables from your `.env.example` file (e.g., `GOOGLE_API_KEY`, `JWT_SECRET_KEY`).
    - **Important:** Do not commit secret keys directly to your `render.yaml` file. Use the Render dashboard to set secret environment variables.

### Step 3: Deploy the Application

1.  **Approve the Blueprint:**
    Once you have configured the services and environment variables, click **Approve** or **Create New Services**.

2.  **Monitor the Deployment:**
    - Render will begin building and deploying your services.
    - You can monitor the progress in the **Deployments** tab for your `paired-app` service.
    - Render will pull the Docker image you pushed to Docker Hub and start the service.

3.  **Access Your Application:**
    - Once the deployment is complete, Render will provide you with a public URL for your `paired-app` service (e.g., `https://paired-app.onrender.com`).
    - You can now access your live Paired application at this URL.

## Post-Deployment

### Health Checks
Render will use the `/api/v1/health` endpoint to monitor the health of your web service. If this endpoint does not return a `200 OK` status, Render may automatically restart your service.

### Database Migrations
The current setup initializes the database schema on startup. For more complex database migrations in the future, you may want to add a pre-deploy script to your `render.yaml` to run `alembic upgrade head`.

### Custom Domains
You can configure a custom domain for your application in the **Settings** tab of your `paired-app` service on Render.

## Troubleshooting

-   **Deployment Fails:** Check the deployment logs on Render for any error messages. Common issues include incorrect environment variables or problems with the Docker image.
-   **Application Errors:** Check the application logs in the **Logs** tab of your `paired-app` service to debug any runtime errors.
-   **Docker Build Fails:** Ensure that you can successfully build the Docker image locally before pushing it to Docker Hub. 
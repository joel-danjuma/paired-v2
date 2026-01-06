# VPS Deployment Guide

This guide provides step-by-step instructions for deploying the Paired application to a VPS (Hostinger, DigitalOcean, AWS EC2, etc.) using Ubuntu and Docker.

## Prerequisites

- A VPS running Ubuntu 20.04 or later
- Root or sudo access to the VPS
- A domain name (optional, but recommended for SSL)
- SSH access to your VPS

## Step 1: Initial VPS Setup

### 1.1 Create a Non-Root User

```bash
# SSH into your VPS as root
ssh root@your-vps-ip

# Create a new user (replace 'deploy' with your preferred username)
adduser deploy

# Add user to sudo group
usermod -aG sudo deploy

# Switch to the new user
su - deploy
```

### 1.2 Set Up SSH Key Authentication (Recommended)

On your local machine:
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy the public key to your VPS
ssh-copy-id deploy@your-vps-ip
```

## Step 2: Install Docker and Docker Compose

```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to the docker group
sudo usermod -aG docker $USER

# Apply the new group membership
newgrp docker

# Verify installation
docker --version
docker compose version
```

## Step 3: Install Git and Clone the Repository

```bash
# Install git
sudo apt install -y git

# Clone your repository
cd ~
git clone https://github.com/your-username/paired-v2.git
cd paired-v2
```

## Step 4: Configure Environment Variables

```bash
# Create .env file from example
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

Update the following variables in `.env`:
```env
# Database
DATABASE_URL=postgresql+asyncpg://paired_user:your_secure_password@postgres:5432/paired_db
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://redis:6379

# JWT Secret (generate a strong random string)
JWT_SECRET_KEY=your_jwt_secret_key_here

# API Keys
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key

# CORS Origins (update with your domain/IP)
CORS_ORIGINS=["http://your-vps-ip","http://your-domain.com","https://your-domain.com"]

# Trusted Hosts (update with your domain/IP)
TRUSTED_HOSTS=["your-vps-ip","your-domain.com","www.your-domain.com"]

# Frontend API URL
VITE_API_URL=http://your-vps-ip

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password
```

**Important Security Notes:**
- Use strong, unique passwords
- Keep JWT_SECRET_KEY secret and random (use `openssl rand -hex 32` to generate)
- Never commit `.env` file to version control
- Admin password must be 72 characters or less (bcrypt limitation)

## Step 5: Build and Start the Application

```bash
# Make sure you're in the project directory
cd ~/paired-v2

# Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# Check if containers are running
docker ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Step 6: Install and Configure Nginx

### 6.1 Install Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Configure Nginx

```bash
# Copy the nginx configuration file
sudo cp nginx.conf /etc/nginx/sites-available/paired

# Update server_name in the config (if you have a domain)
sudo nano /etc/nginx/sites-available/paired
# Change 'server_name _;' to 'server_name your-domain.com www.your-domain.com;'

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/paired /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

## Step 8: Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 9: Set Up Auto-Restart

Create a systemd service to automatically start containers on boot:

```bash
# Create systemd service file
sudo nano /etc/systemd/system/paired-app.service
```

Add the following content:
```ini
[Unit]
Description=Paired App Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/deploy/paired-v2
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=deploy

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable paired-app.service
sudo systemctl start paired-app.service
```

## Updating the Application

```bash
# Navigate to project directory
cd ~/paired-v2

# Pull latest changes
git pull origin main  # or dev branch

# Rebuild and restart containers
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# View logs to ensure everything started correctly
docker compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Check Container Logs
```bash
# View all container logs
docker compose -f docker-compose.prod.yml logs -f

# View specific container logs
docker logs paired-app
docker logs paired-postgres
docker logs paired-redis
```

### Check Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Test Backend Directly
```bash
# Test from the VPS itself
curl -X GET http://127.0.0.1:8000/api/v1/health

# Test registration endpoint
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","full_name":"Test User"}'
```

### Restart Services
```bash
# Restart Docker containers
docker compose -f docker-compose.prod.yml restart

# Restart Nginx
sudo systemctl restart nginx

# Restart all
sudo systemctl restart paired-app.service
sudo systemctl restart nginx
```

### Database Issues
```bash
# Access PostgreSQL container
docker exec -it paired-postgres psql -U paired_user -d paired_db

# Run migrations manually
docker exec -it paired-app alembic upgrade head

# Reset database (WARNING: Destroys all data)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

## Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH Keys Only** - Disable password authentication
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

3. **Regular Backups**
   ```bash
   # Backup database
   docker exec paired-postgres pg_dump -U paired_user paired_db > backup.sql
   ```

4. **Monitor Logs Regularly**
   ```bash
   docker compose -f docker-compose.prod.yml logs --tail=100
   ```

5. **Use Strong Passwords** - For database, admin user, and JWT secret

6. **Enable Fail2Ban** - Protect against brute force attacks
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Monitoring

### Check Resource Usage
```bash
# Docker container stats
docker stats

# System resources
htop
```

### Health Checks
```bash
# Check application health
curl http://your-domain.com/api/v1/health

# Check all services
docker compose -f docker-compose.prod.yml ps
```

## Support

For issues or questions:
- Check the logs first
- Review the troubleshooting section
- Open an issue on GitHub
- Contact support team



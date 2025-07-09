#!/usr/bin/env bash
# Exit on error
set -o errexit

# -- Frontend Build --
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# -- Backend Build --
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete." 
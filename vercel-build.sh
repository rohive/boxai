#!/bin/bash

# Install frontend dependencies
cd frontend
npm install

# Build the frontend
npm run build

# Go back to root
cd ..

# Install backend dependencies
cd backend-node
npm install

# Build the backend
npm run build

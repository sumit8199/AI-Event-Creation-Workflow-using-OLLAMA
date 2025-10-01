#!/bin/bash

echo "Starting Event Flyer Generator API..."
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your configuration before running the server."
    echo
fi

# Build the project
echo "Building TypeScript project..."
npm run build
echo

# Start the server
echo "Starting server..."
npm start

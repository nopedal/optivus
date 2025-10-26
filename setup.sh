#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
node_version=$(node -v)
echo "Node.js version: $node_version"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your actual values"
fi

# Build the project
echo "Building project..."
npm run build

echo "Setup complete! You can now run 'npm run dev' to start the development server"
#!/bin/bash

# Quick Start Script for POC Project
# This script sets up the database and starts the development server

set -e

echo "🚀 POC Project Quick Start"
echo "=========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "Please install PostgreSQL first:"
    echo "  Ubuntu/Debian: sudo apt install postgresql"
    echo "  macOS: brew install postgresql@15"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please update .env with your database credentials"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Ask user if they want to setup database
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Setting up database..."
    npm run db:setup
    echo "✅ Database setup complete"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 Starting development server..."
echo "   Server will run on http://localhost:3000/api"
echo ""
echo ""

# Start development server
npm run dev

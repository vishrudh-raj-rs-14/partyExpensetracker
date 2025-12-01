#!/bin/bash

# Quick Deploy Script for Expense Tracker
# This script helps you deploy to Vercel quickly

echo "🚀 Expense Tracker - Quick Deploy Script"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with:"
    echo "  VITE_APPWRITE_ENDPOINT=your_endpoint"
    echo "  VITE_APPWRITE_PROJECT_ID=your_project_id"
    echo "  VITE_APPWRITE_DATABASE_ID=your_database_id"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""

read -p "Deploy to production? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo "📖 For more details, see DEPLOYMENT.md"


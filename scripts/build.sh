#!/bin/bash
# Build script for electron-dsm-client monorepo

echo "Building electron-dsm-client monorepo..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build shared package
echo "Building shared package..."
cd shared
npm run build
cd ..

# Build each app
echo "Building DSM app..."
cd apps/dsm
npm run build
cd ../..

echo "Building Audio app..."
cd apps/audio
npm run build
cd ../..

echo "Building Photos app..."
cd apps/photos
npm run build
cd ../..

echo "All applications built successfully!"
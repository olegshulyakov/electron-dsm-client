#!/bin/bash
# Distribution script for electron-dsm-client monorepo

echo "Building distribution packages for electron-dsm-client monorepo..."

# Build all apps
./scripts/build.sh

# Create distribution packages
echo "Creating distribution packages..."

echo "Building DSM distribution..."
cd apps/dsm
npm run dist
cd ../..

echo "Building Audio distribution..."
cd apps/audio
npm run dist
cd ../..

echo "Building Photos distribution..."
cd apps/photos
npm run dist
cd ../..

echo "Distribution packages created successfully!"
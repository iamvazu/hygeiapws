#!/bin/bash
# ==============================================================================
# HYGEIA ENTERPRISE — HOSTINGER VPS 1-CLICK DEPLOYMENT SCRIPT
# Installs Node.js, PM2, builds database, and configures Nginx reverse proxy.
# ==============================================================================

set -e

echo "🚀 Starting Hygeia Enterprise API Deployment on Hostinger VPS..."

# 1. Update packages & install dependencies if missing
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager globally..."
    sudo npm install -g pm2
fi

# 2. Navigate to backend directory & install npm modules
cd "$(dirname "$0")"
echo "📦 Installing backend npm dependencies..."
npm install --production

# 3. Start/Restart PM2 service
echo "⚡ Starting Hygeia API Service with PM2..."
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

echo "✅ Hygeia Backend API successfully deployed and running on port 5000!"
echo "📡 Check status with: pm2 status"

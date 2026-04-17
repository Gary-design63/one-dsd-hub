#!/bin/bash
# One DSD COS — One-Command Cloud Deploy
# Run this on your machine: bash deploy.sh
set -e

echo "╔══════════════════════════════════════════╗"
echo "║  One DSD COS — Cloud Deployment Script  ║"
echo "╚══════════════════════════════════════════╝"

# Check for Node.js
node --version > /dev/null 2>&1 || { echo "ERROR: Node.js required. Install from nodejs.org"; exit 1; }

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
  echo "→ Installing Railway CLI..."
  npm install -g @railway/cli
fi

echo ""
echo "→ Logging into Railway (browser will open)..."
railway login

echo ""
echo "→ Creating Railway project..."
railway init --name "one-dsd-cos"

echo ""
echo "→ Setting environment variables..."
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_SECRET=$(node -e "require('crypto').randomBytes(64).toString('hex')")"
railway variables --set "ANTHROPIC_API_KEY=your-anthropic-api-key-here"

echo ""
echo "→ Deploying to Railway..."
railway up --detach

echo ""
echo "→ Getting deployment URL..."
railway domain

echo ""
echo "✅ Deployment complete!"
echo "   Check status: railway status"
echo "   View logs:    railway logs"

#!/bin/bash

echo ""
echo "  ==================================="
echo "   FORGE FITNESS - Setup Script"
echo "  ==================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install it from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Backend
echo ""
echo "[1/3] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend install failed"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"

# Frontend
echo ""
echo "[2/3] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend install failed"
    exit 1
fi
cd ..
echo "✅ Frontend dependencies installed"

echo ""
echo "============================================"
echo " ✅ SETUP COMPLETE!"
echo "============================================"
echo ""
echo " NEXT STEPS:"
echo ""
echo " 1. Edit backend/.env and add your keys:"
echo "    - MONGODB_URI  (free at mongodb.com/atlas)"
echo "    - ANTHROPIC_API_KEY  (free at console.anthropic.com)"
echo ""
echo " 2. Open TWO terminals:"
echo ""
echo "    Terminal 1 (Backend):"
echo "      cd backend && npm start"
echo ""
echo "    Terminal 2 (Frontend):"
echo "      cd frontend && npm start"
echo ""
echo " 3. Open http://localhost:3000 🚀"
echo ""
echo " See README.md for full deployment guide!"
echo ""

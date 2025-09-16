#!/bin/bash

# Kreeda Setup Script
# This script sets up the entire project by creating a Python virtual environment and installing dependencies using pip for Python components and npm for the mobile app.

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv || { echo "Failed to create virtual environment"; exit 1; }
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip to the latest version
echo "Upgrading pip..."
pip install --upgrade pip || { echo "Failed to upgrade pip"; exit 1; }

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r backend/requirements.txt || { echo "Failed to install backend dependencies"; exit 1; }

# Install overlay dependencies if present
if [ -f overlay/requirements.txt ]; then
    echo "Installing overlay dependencies..."
    pip install -r overlay/requirements.txt || { echo "Failed to install overlay dependencies"; exit 1; }
else
    echo "No overlay/requirements.txt found. Skipping overlay setup."
fi

# Install dashboard dependencies if present
if [ -f dashboard/requirements.txt ]; then
    echo "Installing dashboard dependencies..."
    pip install -r dashboard/requirements.txt || { echo "Failed to install dashboard dependencies"; exit 1; }
else
    echo "No dashboard/requirements.txt found. Skipping dashboard setup."
fi

# Install mobile dependencies
if [ -d "mobile" ]; then
    echo "Installing mobile dependencies..."
    cd mobile || { echo "Failed to change directory to mobile"; exit 1; }
    npm install --legacy-peer-deps || { echo "Failed to install mobile dependencies"; exit 1; }
    cd ..
else
    echo "Mobile directory not found. Skipping mobile setup."
fi

# Output instructions
echo "\nSetup complete!"
echo "\nTo run the backend, execute:"
echo "  source venv/bin/activate && cd backend && uvicorn app.main:app --reload"
echo "\nTo run the dashboard, execute:"
echo "  source venv/bin/activate && cd dashboard && streamlit run dashboard.py"
echo "\nTo run the mobile app, navigate to the mobile folder and run:"
echo "  npx react-native run-android   # or   npx react-native run-ios"

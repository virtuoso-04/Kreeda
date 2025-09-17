#!/bin/bash

# Navigate to the project directory
cd /Users/tshreek/Kreeda/mobile

# Install dependencies if needed
npm install --legacy-peer-deps

# Open Xcode workspace
cd ios
open KreedaApp.xcworkspace

echo "Please run the app from Xcode by selecting the 'tempProject' scheme and a simulator, then click the play button."

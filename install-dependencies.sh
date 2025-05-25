#!/bin/bash

cd /home/hamza/Documents/project/VDapp/project

# Remove any existing chart.js packages
npm uninstall chart.js

# Install chart.js with the correct version
npm install chart.js@4.4.1

# Restart the development server
echo "Dependencies installed. Please restart your development server with 'npm run dev'"

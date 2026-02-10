#!/bin/bash

echo "==================================="
echo "Building Dashboard Infrastructure"
echo "==================================="

# Stop and remove existing containers
echo "Stopping existing containers..."
sudo docker-compose down -v

# Build with no cache to ensure fresh build using docker-compose
echo "Building Docker image..."
sudo docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "Starting containers..."
    sudo docker-compose up -d
    
    echo ""
    echo "==================================="
    echo "✅ Deployment Complete!"
    echo "==================================="
    echo ""
    echo "Access your dashboard at: http://localhost:3000"
    echo "Setup page: http://localhost:3000/setup"
    echo ""
    echo "View logs: sudo docker-compose logs -f dashboard"
    echo "==================================="
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi

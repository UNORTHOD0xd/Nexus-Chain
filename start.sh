#!/bin/bash

# NexusChain - Start Application with Docker
echo "Starting NexusChain application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start containers
docker-compose up -d --build

# Wait a moment for services to start
sleep 3

# Show status
echo ""
echo "NexusChain is starting up!"
echo "Checking container status..."
docker-compose ps

echo ""
echo "Services are available at:"
echo "  Backend API:  http://localhost:3000"
echo "  Frontend:     http://localhost:3001"
echo ""
echo "To view logs, run:    docker-compose logs -f"
echo "To stop services:     docker-compose down"

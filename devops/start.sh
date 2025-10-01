#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine the project root (works whether script is run from root or devops/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ "$SCRIPT_DIR" == */devops ]]; then
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
    PROJECT_ROOT="$SCRIPT_DIR"
fi

# Ensure we're in the project root for consistent paths
cd "$PROJECT_ROOT"

# Check if required commands exist
if ! command_exists php; then
    echo -e "${RED}PHP is not installed. Please run ./devops/install.sh first.${NC}"
    exit 1
fi
if ! command_exists pnpm; then
    echo -e "${RED}pnpm is not installed. Please run ./devops/install.sh first.${NC}"
    exit 1
fi

# Check if backend and frontend directories exist
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend/ directory not found in $PROJECT_ROOT${NC}"
    exit 1
fi
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: frontend/ directory not found in $PROJECT_ROOT${NC}"
    exit 1
fi

# Clear any existing .pids file
if [ -f ".pids" ]; then
    rm .pids
fi

# Start PHP server in the background
echo -e "${YELLOW}Starting PHP backend server on localhost:8000...${NC}"
cd backend
php -S localhost:8000 backend.php &
PHP_PID=$!
if ! ps -p $PHP_PID > /dev/null; then
    echo -e "${RED}Failed to start PHP server${NC}"
    exit 1
fi
echo $PHP_PID > ../.pids
cd "$PROJECT_ROOT"

# Start Next.js dev server in the background
echo -e "${YELLOW}Starting Next.js frontend server on localhost:3000...${NC}"
cd frontend
pnpm run dev &
DEV_PID=$!
if ! ps -p $DEV_PID > /dev/null; then
    echo -e "${RED}Failed to start Next.js server${NC}"
    exit 1
fi
echo $DEV_PID >> ../.pids
cd "$PROJECT_ROOT"

echo -e "${GREEN}Servers started successfully!${NC}"
echo -e "Backend: http://localhost:8000"
echo -e "Frontend: http://localhost:3000"

# Optional: Keep script running to monitor processes
wait $PHP_PID $DEV_PID

#!/bin/bash

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Determine the project root (works whether script is run from root or devops/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ "$SCRIPT_DIR" == */devops ]]; then
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
    PROJECT_ROOT="$SCRIPT_DIR"
fi

# Ensure we're in the project root
cd "$PROJECT_ROOT"

# Check if .pids file exists
if [ ! -f .pids ]; then
    echo -e "${YELLOW}No .pids file found. No running processes to stop.${NC}"
    exit 0
fi

# Read PIDs from .pids file
readarray -t PIDS < .pids

# Check if PIDs array is empty
if [ ${#PIDS[@]} -eq 0 ]; then
    echo -e "${YELLOW}.pids file is empty. No processes to stop.${NC}"
    rm -f .pids
    exit 0
fi

# Attempt to stop each process
STOPPED=0
for PID in "${PIDS[@]}"; do
    if [ -n "$PID" ] && ps -p "$PID" > /dev/null; then
        kill "$PID" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Stopped process with PID $PID${NC}"
            ((STOPPED++))
        else
            echo -e "${RED}Failed to stop process with PID $PID${NC}"
        fi
    else
        echo -e "${YELLOW}Process with PID $PID is not running${NC}"
    fi
done

# Clean up .pids file
if [ $STOPPED -gt 0 ]; then
    rm -f .pids
    echo -e "${GREEN}Cleaned up .pids file${NC}"
else
    echo -e "${YELLOW}No processes were stopped${NC}"
fi

echo -e "${GREEN}Stop script completed${NC}"

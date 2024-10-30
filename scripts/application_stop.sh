#!/bin/bash

# Stopping existing node servers
echo "Stopping any existing node servers"

# Check for running node processes
PIDS=$(pgrep -f 'node')

if [ -z "$PIDS" ]; then
    echo "No node processes found."
else
    echo "Found node processes with PIDs: $PIDS"
    
    # Attempt to kill the node processes with sudo
    sudo pkill -f 'node'
    
    # Check if pkill was successful
    if [ $? -eq 0 ]; then
        echo "Successfully stopped node processes."
    else
        echo "Failed to stop node processes. Please check permissions."
        exit 1
    fi
fi

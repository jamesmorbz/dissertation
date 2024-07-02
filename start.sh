#!/bin/bash

# Function to handle cleanup
cleanup() {
    echo "Stopping services..."
    # Kill all child processes of the current shell
    kill $(jobs -p)
    wait # Wait for all background processes to exit
    echo "Services stopped."
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Function to check if a directory exists and navigate to it
function navigate_to_directory {
    if [ -d "$1" ]; then
        cd "$1" || { echo "Failed to navigate to $1 directory"; exit 1; }
    else
        echo "Directory $1 does not exist"
        exit 1
    fi
}

# Navigate to the frontend directory and start the frontend service
navigate_to_directory "frontend"
npm start &

# Navigate to the backend directory and start the backend service
navigate_to_directory "../backend"
if [ -d "../venv" ]; then
    source ../venv/bin/activate
else
    echo "Virtual environment directory ../venv does not exist"
    exit 1
fi
uvicorn main:app &

## Run the database writer
python write_mqtt_to_influx.py &

# Wait for background processes to complete
wait
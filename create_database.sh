#!/bin/bash

# Function to check if a directory exists and navigate to it
function navigate_to_directory {
    if [ -d "$1" ]; then
        cd "$1" || { echo "Failed to navigate to $1 directory"; exit 1; }
    else
        echo "Directory $1 does not exist"
        exit 1
    fi
}

# Navigate to the backend directory
navigate_to_directory "backend"

## Run the database creation process sqlite is included in python by defaul so no need for venv
python create_database.py

#!/bin/bash

# Check if NVM is already installed
if [ -d "$HOME/.nvm" ]; then
    echo "NVM is already installed."
else
    # Download and install the latest version of NVM
    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    echo "NVM installed successfully."
fi

# Load NVM into the current shell session
. ~/.nvm/nvm.sh  

# Install a specific version of Node.js (update the version as necessary)
nvm install node  # or specify a version like nvm install 16.15.0

# Create our working directory if it doesn't exist
DIR="/home/ec2-user/express-app"
if [ -d "$DIR" ]; then
    echo "${DIR} exists"
else
    echo "Creating ${DIR} directory"
    mkdir -p ${DIR}  # Use -p to create parent directories as needed
fi

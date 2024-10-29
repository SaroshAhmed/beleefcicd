#!/bin/bash

# Grant necessary permissions to the express-app directory
sudo chmod -R 755 /home/ec2-user/express-app

# Navigate into the working directory
cd /home/ec2-user/express-app

# Add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install dependencies
npm install

# Install pm2 globally if not already installed
npm install -g pm2

# Start the application with pm2
pm2 start server.js --name my-express-app

# Enable pm2 to restart on boot
pm2 startup
pm2 save

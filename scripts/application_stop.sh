# #!/bin/bash
# #Stopping existing node servers
# echo "Stopping any existing node servers"
# pkill node

#!/bin/bash
# Stopping existing node servers
echo "Stopping any existing node servers"

# Attempt to kill the Node.js processes with sudo
if sudo pkill -f node; then
    echo "Successfully stopped existing node servers."
else
    echo "Failed to stop existing node servers. Please check permissions."
    exit 1
fi

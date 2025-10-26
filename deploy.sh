#!/bin/bash

# Build the Next.js application
echo "Building the application..."
npm run build

# Create a production directory
echo "Creating production directory..."
mkdir -p production
cp -r .next package.json package-lock.json production/

# Compress the production directory
echo "Compressing files..."
tar -czf deploy.tar.gz production/

# Upload to VM
echo "Uploading to VM..."
scp deploy.tar.gz samekhk@oracle:/home/samekhk/

# SSH into VM and deploy
echo "Deploying on VM..."
ssh samekhk@oracle << 'EOF'
  cd /home/samekhk
  tar xzf deploy.tar.gz
  cd production
  npm install --production
  # Start the application using PM2
  pm2 restart optivus || pm2 start npm --name "optivus" -- start
EOF

echo "Deployment complete!"
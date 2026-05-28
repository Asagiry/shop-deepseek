#!/bin/bash
set -e

echo "=== E-Commerce Merch Shop Deployment ==="

SSH_KEY="./id_ed25519"
SSH_USER="base-ubuntu"
SSH_IP="192.168.1.178"
REMOTE_DIR="/home/base-ubuntu/shop"

echo "[1/6] Copying project to VM..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r ./* "$SSH_USER@$SSH_IP:$REMOTE_DIR/" 2>/dev/null || ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "cd $REMOTE_DIR && git pull origin main"

echo "[2/6] Installing backend dependencies..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "cd $REMOTE_DIR && npm install"

echo "[3/6] Running migrations and seeding..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "cd $REMOTE_DIR && npm run build && node dist/db/migrate.js && node dist/db/seed.js"

echo "[4/6] Installing frontend dependencies and building..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "cd $REMOTE_DIR/client && npm install && npm run build"

echo "[5/6] Configuring PM2..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "cd $REMOTE_DIR && pm2 delete shop 2>/dev/null; sudo pm2 start dist/server.js --name shop -- --port 80 || pm2 start dist/server.js --name shop -- --port 3000"

echo "[6/6] Saving PM2 process list..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_IP" "pm2 save"

echo ""
echo "=== Deployment Complete ==="
echo "App should be available at http://deepseek-shop.voimaxgm.online"
echo "Or at http://$SSH_IP"
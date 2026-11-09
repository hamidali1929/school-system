#!/bin/bash
set -e

echo "=== 1. Checking Directory & Dependencies ==="
cd /home/ubuntu/whatsapp-go
pwd
ls -la

echo "=== 2. Stopping Old Node.js Baileys Backend in PM2 ==="
pm2 stop wa-backend || true
pm2 delete wa-backend || true
pm2 save || true

echo "=== 3. Compiling Pure Golang WhatsApp Gateway ==="
export PATH=$PATH:/usr/local/bin:/snap/bin
go version
go mod tidy
CGO_ENABLED=0 go build -ldflags="-s -w" -o whatsapp-server main.go
ls -lh whatsapp-server

echo "=== 4. Setting up /opt/whatsapp-gateway Directory ==="
sudo mkdir -p /opt/whatsapp-gateway
sudo cp whatsapp-server /opt/whatsapp-gateway/whatsapp-server
sudo chmod +x /opt/whatsapp-gateway/whatsapp-server
sudo cp whatsapp-gateway.service /etc/systemd/system/whatsapp-gateway.service

echo "=== 5. Enabling & Starting Systemd 24/7 Service ==="
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-gateway
sudo systemctl restart whatsapp-gateway

echo "=== 6. Checking Service Status ==="
sleep 2
sudo systemctl status whatsapp-gateway --no-pager

echo "=== 7. Testing Local HTTP Status ==="
curl -s http://127.0.0.1:3001/status || true

echo "=== COMPLETED SUCCESSFULLY ==="

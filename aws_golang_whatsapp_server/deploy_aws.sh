#!/bin/bash
# ==============================================================================
# Ultra-Fast Golang WhatsApp Gateway - 1-Click AWS EC2 Automated Deployment
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Installing Ultra-Fast Golang WhatsApp Gateway on AWS EC2"
echo "=========================================================="

# 1. Update OS and install dependencies
echo "📦 Updating packages..."
sudo apt-get update -y
sudo apt-get install -y curl git tar build-essential

# 2. Install Go 1.22+ if not installed
if ! command -v go &> /dev/null || [[ $(go version | awk '{print $3}') < "go1.22" ]]; then
    echo "⚡ Installing latest Golang binary..."
    GO_TAR="go1.22.8.linux-amd64.tar.gz"
    # Check if ARM64
    ARCH=$(uname -m)
    if [ "$ARCH" = "aarch64" ]; then
        GO_TAR="go1.22.8.linux-arm64.tar.gz"
    fi

    wget -q "https://go.dev/dl/${GO_TAR}" -O /tmp/go.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf /tmp/go.tar.gz
    rm /tmp/go.tar.gz

    export PATH=$PATH:/usr/local/go/bin
    if ! grep -q "/usr/local/go/bin" ~/.bashrc; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    fi
fi

echo "✅ Golang version: $(go version)"

# 3. Setup Target Directory
INSTALL_DIR="/opt/whatsapp-gateway"
echo "📁 Setting up installation directory at $INSTALL_DIR..."
sudo mkdir -p $INSTALL_DIR

# 4. Stop existing service if running
if systemctl is-active --quiet whatsapp-gateway; then
    echo "Stopping existing whatsapp-gateway service..."
    sudo systemctl stop whatsapp-gateway
fi

# 5. Build optimized single binary
echo "🔨 Compiling high-performance Golang binary..."
go mod tidy
CGO_ENABLED=0 go build -ldflags="-s -w" -o whatsapp-server main.go

echo "🚚 Installing binary and assets..."
sudo cp whatsapp-server $INSTALL_DIR/whatsapp-server
sudo chmod +x $INSTALL_DIR/whatsapp-server

# 6. Install systemd service
echo "⚙️ Configuring 24/7 systemd background service..."
sudo cp whatsapp-gateway.service /etc/systemd/system/whatsapp-gateway.service
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-gateway
sudo systemctl restart whatsapp-gateway

echo "=========================================================="
echo "✅ WHATSAPP GOLANG GATEWAY IS NOW LIVE 24/7 ON AWS EC2!"
echo "=========================================================="
echo "Port: 3001"
echo "Status URL: http://localhost:3001/status"
echo "QR URL:     http://localhost:3001/qr"
echo "Send API:   http://localhost:3001/send-message"
echo "=========================================================="
echo ""
echo "📱 Showing live QR Code (Scan with your phone's WhatsApp):"
echo "Press Ctrl+C anytime to exit live log view (service will keep running in background)."
echo ""
sleep 2

# Tail logs to display terminal ASCII QR code
sudo journalctl -u whatsapp-gateway -n 30 -f

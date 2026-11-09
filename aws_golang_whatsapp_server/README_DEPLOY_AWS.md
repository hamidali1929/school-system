# 🚀 Ultra-Fast Golang WhatsApp Gateway on AWS EC2 (Zero Node.js, Zero Baileys)

Bhai, yeh hamara **100% Go (Golang) + whatsmeow** par mushtamil official high-performance WhatsApp gateway hai. 

Ismein:
- **Zero Node.js** aur **Zero Baileys**
- **Single Compiled Binary** (RAM sirf ~18MB vs purane Node.js ke 300MB+)
- **Microsecond Latency** (Instant message delivery)
- **SQLite Session Persistence** (Server reboot ho ya connection drop ho, session drop nahi hota)
- **24/7 Background Systemd Service** (AWS EC2 par hamesha active rehta hai)

---

## 🛠️ Folder Structure
```
aws_golang_whatsapp_server/
├── main.go                     # Complete High-Performance Go Server
├── go.mod                      # Go Dependencies (whatsmeow, sqlite, qrcode)
├── whatsapp-gateway.service    # Linux 24/7 systemd background service
├── deploy_aws.sh               # 1-Click Automated Build & Install Script
└── README_DEPLOY_AWS.md        # Complete Urdu / English deployment guide
```

---

## 📋 AWS EC2 Par Deploy Karne Ka 1-Click Tareeqa

### Step 1: Apne AWS EC2 Server Mein SSH Login Karein
Apne computer ke terminal / PowerShell se apne AWS EC2 instance par connect karein:
```bash
ssh -i "your-aws-key.pem" ubuntu@16.16.124.14
```
*(Agar root user ho toh `root@16.16.124.14`)*

---

### Step 2: Purane Node.js Server Ko Stop Karein
Agar pehle se koi purana Node.js ya PM2 process chal raha hai, toh use stop kar dein:
```bash
# Agar PM2 chal raha hai:
pm2 stop all
pm2 delete all

# Agar systemd service chal rahi thi:
sudo systemctl stop whatsapp-server 2>/dev/null || true
```

---

### Step 3: Server Par Directory Banayein aur Files Copy Karein
AWS EC2 terminal par:
```bash
mkdir -p ~/whatsapp-go
cd ~/whatsapp-go
```

Ab `aws_golang_whatsapp_server` folder ki tamam files (`main.go`, `go.mod`, `whatsapp-gateway.service`, `deploy_aws.sh`) ko apne EC2 server par transfer ya create kar lein.

---

### Step 4: 1-Click Automated Script Chalayein
Ab sirf yeh command execute karein:
```bash
chmod +x deploy_aws.sh
./deploy_aws.sh
```

**Yeh script automatically:**
1. Latest Golang environment install karega.
2. High-performance single binary compile karega (`whatsapp-server`).
3. Binary ko `/opt/whatsapp-gateway/` mein install karega.
4. `whatsapp-gateway.service` configure karega jo server reboot hone par bhi automatically start hogi.
5. Service start karke **terminal ke andar hi live ASCII QR Code** display kar dega!

---

### Step 5: WhatsApp Connect Karein
1. Apne mobile phone par WhatsApp open karein.
2. **Settings** -> **Linked Devices** -> **Link a Device** par tap karein.
3. Terminal mein nazar aane wala QR Code scan karein.
4. Jaise hi scan hoga, terminal par aayega:
   ```
   [WHATSAPP] Gateway connected to WhatsApp Multi-Device network!
   ```

---

## 🌐 Endpoints & API Reference (Port 3001)

Hamara frontend (`src/utils/whatsapp.ts`) inhi endpoints par connect hota hai:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Health check & uptime status |
| `/status` | `GET` | Returns `{"status": "ACTIVE", "connected": true, "user": "92300..."}` |
| `/qr` | `GET` | Returns raw pairing QR and base64 PNG data URL |
| `/send-message` | `POST` | Sends text message or PDF fee voucher attachment |
| `/groups` | `GET` | Fetches list of all joined school groups |
| `/logout` | `POST` | Disconnects session and triggers fresh pairing QR |

### Example cURL Request:
```bash
curl -X POST http://localhost:3001/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "923001234567",
    "message": "Assalam-o-Alaikum! Pioneer Superior School fee voucher alert."
  }'
```

---

## 🛡️ Service Management Commands

```bash
# Service status check
sudo systemctl status whatsapp-gateway

# Live real-time logs dekhna
sudo journalctl -u whatsapp-gateway -f

# Service restart
sudo systemctl restart whatsapp-gateway

# Service stop
sudo systemctl stop whatsapp-gateway
```

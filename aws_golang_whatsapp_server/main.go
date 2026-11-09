package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	qrcode "github.com/skip2/go-qrcode"
	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"
	_ "modernc.org/sqlite" // Pure Go SQLite driver (Zero CGO)
)

var (
	container  *sqlstore.Container
	client     *whatsmeow.Client
	clientLog  waLog.Logger
	qrCodeRaw  string
	qrCodeLock sync.RWMutex
	qrChanLock sync.Mutex
	startTime  = time.Now()
)

func startQRListener() {
	qrChanLock.Lock()
	defer qrChanLock.Unlock()

	if client == nil {
		return
	}

	if client.IsLoggedIn() {
		return
	}

	if client.IsConnected() {
		client.Disconnect()
	}

	// If device store has an ID but is not logged in, delete it so GetQRChannel can succeed
	if client.Store != nil && client.Store.ID != nil {
		log.Printf("[PAIRING] Resetting unauthenticated device %s to get fresh QR code...\n", client.Store.ID.User)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		_ = client.Store.Delete(ctx)
		cancel()

		if container != nil {
			newDevice := container.NewDevice()
			client = whatsmeow.NewClient(newDevice, clientLog)
			client.AddEventHandler(eventHandler)
		}
	}

	qrChan, err := client.GetQRChannel(context.Background())
	if err != nil {
		log.Printf("[PAIRING] QR channel notice: %v\n", err)
		return
	}

	err = client.Connect()
	if err != nil {
		log.Printf("[PAIRING] Connect error: %v\n", err)
		return
	}

	go func() {
		for evt := range qrChan {
			if evt.Event == "code" {
				qrCodeLock.Lock()
				qrCodeRaw = evt.Code
				qrCodeLock.Unlock()

				log.Println("==================================================")
				log.Println("★ SCAN THIS QR CODE IN WHATSAPP LINKED DEVICES ★")
				log.Println("==================================================")
				q, err := qrcode.New(evt.Code, qrcode.Medium)
				if err == nil {
					fmt.Println(q.ToSmallString(false))
				}
			} else if evt.Event == "timeout" {
				log.Println("[PAIRING] QR code timed out. Ready to re-generate on demand.")
				qrCodeLock.Lock()
				qrCodeRaw = ""
				qrCodeLock.Unlock()
			} else if evt.Event == "success" {
				log.Println("[PAIRING] WhatsApp successfully paired and authenticated!")
				qrCodeLock.Lock()
				qrCodeRaw = ""
				qrCodeLock.Unlock()
			} else {
				log.Printf("[PAIRING] QR Channel Event: %s\n", evt.Event)
			}
		}
	}()
}

// Set CORS Headers for all incoming requests
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// Clean and normalize Pakistani & International phone numbers
func normalizeNumber(num string) string {
	var cleaned strings.Builder
	for _, ch := range num {
		if ch >= '0' && ch <= '9' {
			cleaned.WriteRune(ch)
		}
	}
	s := cleaned.String()
	if strings.HasPrefix(s, "0") && len(s) == 11 {
		s = "92" + s[1:]
	} else if len(s) == 10 {
		s = "92" + s
	}
	return s
}

// Handle Root / Health Check
func handleRoot(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	isConnected := client != nil && client.IsConnected() && client.IsLoggedIn()
	userJid := ""
	if isConnected && client.Store.ID != nil {
		userJid = client.Store.ID.User
	}

	status := "INACTIVE"
	if isConnected {
		status = "ONLINE"
	} else {
		qrCodeLock.RLock()
		if qrCodeRaw != "" {
			status = "QR_READY"
		}
		qrCodeLock.RUnlock()
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":        status,
		"engine":        "whatsmeow-golang-ultra-fast",
		"message":       "School WhatsApp High-Performance Golang Microservice is running 24/7 on AWS EC2",
		"authenticated": isConnected,
		"user":          userJid,
		"uptime_sec":    time.Since(startTime).Seconds(),
	})
}

// Handle Status Endpoint
func handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	isConnected := client != nil && client.IsConnected() && client.IsLoggedIn()
	userJid := ""
	if isConnected && client.Store.ID != nil {
		userJid = client.Store.ID.User
	}

	statusText := "DISCONNECTED"
	if isConnected {
		statusText = "ACTIVE"
	} else {
		qrCodeLock.RLock()
		if qrCodeRaw != "" {
			statusText = "QR"
		}
		qrCodeLock.RUnlock()
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    statusText,
		"connected": isConnected,
		"user":      userJid,
	})
}

// Handle QR Code Retrieval
func handleQR(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	isConnected := client != nil && client.IsConnected() && client.IsLoggedIn()
	if isConnected {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "CONNECTED",
			"connected": true,
			"message":   "WhatsApp session is already authenticated and active.",
		})
		return
	}

	qrCodeLock.RLock()
	currentQR := qrCodeRaw
	qrCodeLock.RUnlock()

	if currentQR == "" {
		go startQRListener()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":    "INITIALIZING",
			"connected": false,
			"qr":        nil,
			"message":   "QR Code is being refreshed by WhatsApp engine, please retry in 1-2 seconds.",
		})
		return
	}

	// Generate PNG Base64 for easy inline display
	pngBytes, err := qrcode.Encode(currentQR, qrcode.Medium, 256)
	var qrImageBase64 string
	if err == nil {
		qrImageBase64 = "data:image/png;base64," + base64.StdEncoding.EncodeToString(pngBytes)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "QR",
		"connected": false,
		"qr":        currentQR,
		"qr_image":  qrImageBase64,
	})
}

type SendMessageRequest struct {
	To       string `json:"to"`
	Message  string `json:"message"`
	Media    string `json:"media,omitempty"`    // Base64 or URL
	Filename string `json:"filename,omitempty"` // e.g. FeeVoucher.pdf
}

// Handle Send Message (Text & Document/PDF)
func handleSendMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != "POST" {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	if client == nil || !client.IsConnected() || !client.IsLoggedIn() {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "WhatsApp client is not connected. Please scan QR code in School Dashboard first.",
		})
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid JSON payload: " + err.Error(),
		})
		return
	}

	var targetJID types.JID
	if strings.Contains(req.To, "@g.us") || strings.Contains(req.To, "@s.whatsapp.net") {
		var err error
		targetJID, err = types.ParseJID(req.To)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   "Invalid JID: " + err.Error(),
			})
			return
		}
	} else {
		cleanTo := normalizeNumber(req.To)
		if len(cleanTo) < 9 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   "Invalid phone number format",
			})
			return
		}
		targetJID = types.NewJID(cleanTo, types.DefaultUserServer)
	}

	targetStr := targetJID.String()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// 1. Text Message Dispatch
	if req.Media == "" {
		msg := &waProto.Message{
			Conversation: proto.String(req.Message),
		}

		resp, err := client.SendMessage(ctx, targetJID, msg)
		if err != nil {
			log.Printf("[SEND ERROR] Failed to send to %s: %v", targetStr, err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   err.Error(),
			})
			return
		}

		log.Printf("[SEND SUCCESS] Text sent to %s (ID: %s)", targetStr, resp.ID)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":   true,
			"messageId": resp.ID,
			"timestamp": resp.Timestamp.Unix(),
		})
		return
	}

	// 2. Media Dispatch (e.g. PDF Fee Voucher or Image)
	mediaData, mimeType, err := extractMediaBytes(req.Media)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Could not process media: " + err.Error(),
		})
		return
	}

	filename := req.Filename
	if filename == "" {
		if strings.Contains(mimeType, "pdf") {
			filename = "FeeVoucher.pdf"
		} else {
			filename = "attachment"
		}
	}

	uploaded, err := client.Upload(ctx, mediaData, whatsmeow.MediaDocument)
	if err != nil {
		log.Printf("[UPLOAD ERROR] Failed to upload media for %s: %v", targetStr, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "WhatsApp media upload failed: " + err.Error(),
		})
		return
	}

	docMsg := &waProto.Message{
		DocumentMessage: &waProto.DocumentMessage{
			URL:           proto.String(uploaded.URL),
			DirectPath:    proto.String(uploaded.DirectPath),
			MediaKey:      uploaded.MediaKey,
			FileEncSHA256: uploaded.FileEncSHA256,
			FileSHA256:    uploaded.FileSHA256,
			FileLength:    proto.Uint64(uint64(len(mediaData))),
			Mimetype:      proto.String(mimeType),
			Title:         proto.String(filename),
			FileName:      proto.String(filename),
			Caption:       proto.String(req.Message),
		},
	}

	resp, err := client.SendMessage(ctx, targetJID, docMsg)
	if err != nil {
		log.Printf("[SEND ERROR] Failed to send document to %s: %v", targetStr, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	log.Printf("[SEND SUCCESS] Document sent to %s (ID: %s)", targetStr, resp.ID)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"messageId": resp.ID,
		"filename":  filename,
		"timestamp": resp.Timestamp.Unix(),
	})
}

// Extract bytes and mimeType from Base64 or direct URL
func extractMediaBytes(media string) ([]byte, string, error) {
	if strings.HasPrefix(media, "data:") {
		parts := strings.SplitN(media, ",", 2)
		if len(parts) != 2 {
			return nil, "", fmt.Errorf("malformed data URI")
		}
		mime := "application/octet-stream"
		metaParts := strings.Split(parts[0], ";")
		if len(metaParts) > 0 {
			mime = strings.TrimPrefix(metaParts[0], "data:")
		}
		data, err := base64.StdEncoding.DecodeString(parts[1])
		return data, mime, err
	}

	if strings.HasPrefix(media, "http://") || strings.HasPrefix(media, "https://") {
		resp, err := http.Get(media)
		if err != nil {
			return nil, "", err
		}
		defer resp.Body.Close()
		data, err := io.ReadAll(resp.Body)
		mime := resp.Header.Get("Content-Type")
		if mime == "" {
			mime = "application/pdf"
		}
		return data, mime, err
	}

	// Plain base64
	data, err := base64.StdEncoding.DecodeString(media)
	return data, "application/pdf", err
}

// Handle List Groups
func handleGroups(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if client == nil || !client.IsConnected() || !client.IsLoggedIn() {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"groups":  []interface{}{},
			"error":   "WhatsApp not connected",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	groups, err := client.GetJoinedGroups(ctx)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"groups":  []interface{}{},
			"error":   err.Error(),
		})
		return
	}

	type GroupItem struct {
		ID           string `json:"id"`
		Name         string `json:"name"`
		Subject      string `json:"subject"`
		Topic        string `json:"topic,omitempty"`
		Participants int    `json:"participants"`
	}

	var groupList []GroupItem
	for _, g := range groups {
		pCount := g.ParticipantCount
		if pCount == 0 && len(g.Participants) > 0 {
			pCount = len(g.Participants)
		}
		groupName := g.Name
		if groupName == "" {
			groupName = "Unnamed Group"
		}
		groupList = append(groupList, GroupItem{
			ID:           g.JID.String(),
			Name:         groupName,
			Subject:      groupName,
			Topic:        g.Topic,
			Participants: pCount,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"groups":  groupList,
	})
}

// Handle Logout / Session Reset
func handleLogout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if client != nil {
		if client.IsLoggedIn() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			_ = client.Logout(ctx)
			cancel()
		}
		client.Disconnect()
		if client.Store != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			_ = client.Store.Delete(ctx)
			cancel()
		}
		if container != nil {
			newDevice := container.NewDevice()
			client = whatsmeow.NewClient(newDevice, clientLog)
			client.AddEventHandler(eventHandler)
		}
	}
	qrCodeLock.Lock()
	qrCodeRaw = ""
	qrCodeLock.Unlock()

	go func() {
		time.Sleep(500 * time.Millisecond)
		startQRListener()
	}()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "WhatsApp session logged out. New QR code ready to scan.",
	})
}

func eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *events.Connected:
		log.Println("[WHATSAPP] Gateway connected to WhatsApp Multi-Device network!")
		qrCodeLock.Lock()
		qrCodeRaw = ""
		qrCodeLock.Unlock()
	case *events.LoggedOut:
		log.Println("[WHATSAPP] Session logged out by device.")
		qrCodeLock.Lock()
		qrCodeRaw = ""
		qrCodeLock.Unlock()
	case *events.Receipt:
		// Optional: Delivery receipts
	case *events.Message:
		// Optional: Incoming message logger
	default:
		_ = v
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	dbFile := os.Getenv("DB_FILE")
	if dbFile == "" {
		dbFile = "file:whatsapp_session.db?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)"
	}

	ctx := context.Background()
	dbLog := waLog.Stdout("Database", "ERROR", true)
	var err error
	container, err = sqlstore.New(ctx, "sqlite", dbFile, dbLog)
	if err != nil {
		log.Fatalf("Failed to initialize SQLite session storage: %v", err)
	}

	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		log.Fatalf("Failed to fetch primary device from store: %v", err)
	}

	clientLog = waLog.Stdout("WhatsApp", "INFO", true)
	client = whatsmeow.NewClient(deviceStore, clientLog)
	client.AddEventHandler(eventHandler)

	// Automatic Session Initialization & QR Generation
	if client.Store.ID == nil {
		startQRListener()
	} else {
		// Already paired device: Connect directly using stored SQLite session keys
		log.Printf("[WHATSAPP] Found existing SQLite session for JID: %s. Reconnecting...", client.Store.ID.User)
		err = client.Connect()
		if err != nil {
			log.Printf("[WARNING] Reconnection attempt failed: %v", err)
		}
	}

	// Setup HTTP Handlers
	mux := http.NewServeMux()
	mux.HandleFunc("/", enableCORS(handleRoot))
	mux.HandleFunc("/status", enableCORS(handleStatus))
	mux.HandleFunc("/qr", enableCORS(handleQR))
	mux.HandleFunc("/send-message", enableCORS(handleSendMessage))
	mux.HandleFunc("/groups", enableCORS(handleGroups))
	mux.HandleFunc("/logout", enableCORS(handleLogout))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	// Graceful shutdown listener
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 Ultra-Fast Golang WhatsApp Gateway running on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	<-stopChan
	log.Println("Shutting down WhatsApp Gateway gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if client != nil && client.IsConnected() {
		client.Disconnect()
	}
	_ = server.Shutdown(shutdownCtx)
	log.Println("Gateway stopped cleanly.")
}

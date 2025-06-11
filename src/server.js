const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase init
admin.initializeApp({
  credential: admin.credential.cert(require("../config/firebase-key.json")),
  databaseURL: "https://wishes-f897a-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// CORS config
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes with error handling
app.post("/api/messages", async (req, res) => {
  try {
    const { name, type, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = {
      name: name.trim(),
      type: type || "general",
      message: message.trim(),
      timestamp: Date.now()
    };

    const ref = db.ref("messages").push();
    await ref.set(newMessage);
    res.status(201).json({ id: ref.key, ...newMessage });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({
      error: "Failed to save message",
      details: err.message
    });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const snapshot = await db.ref("messages").once("value");
    const data = snapshot.val() || {};
    const messages = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Lỗi đọc dữ liệu", details: err.toString() });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

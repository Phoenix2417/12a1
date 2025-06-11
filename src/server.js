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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.post("/api/messages", async (req, res) => {
  const { name, type, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Thiếu dữ liệu!" });
  }

  const newMessage = {
    name: name.trim(),
    type: type || "general",
    message: message.trim(),
    timestamp: Date.now()
  };

  try {
    const ref = db.ref("messages").push();
    await ref.set(newMessage);
    res.status(201).json({ id: ref.key, ...newMessage });
  } catch (err) {
    res.status(500).json({ error: "Lỗi ghi dữ liệu", details: err.toString() });
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Lỗi server nội bộ", details: err.toString() });
});

app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));

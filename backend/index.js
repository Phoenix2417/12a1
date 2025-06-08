// Sử dụng Firebase Admin SDK để lấy/gửi lời chúc thay vì file hệ thống

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
const PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wishes-f897a-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(bodyParser.json());

// Gửi lời chúc (lưu vào Firebase)
app.post("/api/messages", async (req, res) => {
  const { name, type, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: "Thiếu dữ liệu!" });

  const newMessage = {
    name: name.trim(),
    type: type || 'general',
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

// Lấy tất cả lời chúc từ Firebase
app.get("/api/messages", async (req, res) => {
  try {
    const snapshot = await db.ref("messages").once("value");
    const data = snapshot.val() || {};
    const messages = Object.entries(data).map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Lỗi đọc dữ liệu", details: err.toString() });
  }
});

// Xử lý lỗi server nội bộ
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Lỗi server nội bộ", details: err.toString() });
});

// Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));

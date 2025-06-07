const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.txt');

// Đảm bảo thư mục và file tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(WISHES_FILE)) fs.writeFileSync(WISHES_FILE, '', 'utf8');

// Sửa lỗi "Failed to fetch" bằng cách đảm bảo các headers và CORS đúng
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(express.static(__dirname)); // phục vụ file tĩnh

let messages = []; // nếu bạn chưa dùng database, tạm lưu trong RAM

// API lưu lời chúc vào RAM và file
app.post("/api/messages", (req, res) => {
  const { name, type, message } = req.body;
  if (!name || !message) {
    res.status(400).json({ error: "Thiếu dữ liệu!" });
    return;
  }
  const newMessage = { id: Date.now(), name, type, message, timestamp: Date.now() };
  messages.push(newMessage);
  try {
    fs.appendFileSync(WISHES_FILE, JSON.stringify(newMessage) + '\n', 'utf8');
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Lỗi ghi dữ liệu", details: err.toString() });
  }
});

// API lấy danh sách lời chúc từ RAM (ưu tiên RAM, nếu rỗng thì lấy từ file)
app.get("/api/messages", (req, res) => {
  if (messages.length === 0 && fs.existsSync(WISHES_FILE)) {
    messages = fs.readFileSync(WISHES_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean);
  }
  // Sắp xếp mới nhất lên đầu
  const sorted = [...messages].sort((a, b) => b.timestamp - a.timestamp);
  res.json(sorted);
});

// Giữ lại API cũ cho frontend cũ nếu cần
app.post('/save-wish', (req, res) => {
    const { name, type, message } = req.body;
    if (!name || name.trim().length < 2 || !message || message.trim().length < 5) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }
    const wish = {
        name: name.trim(),
        type: type || 'general',
        message: message.trim(),
        timestamp: Date.now()
    };
    try {
        fs.appendFileSync(WISHES_FILE, JSON.stringify(wish) + '\n', 'utf8');
        messages.push(wish);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Không thể lưu lời chúc' });
    }
});

app.get('/wishes.txt', (req, res) => {
    res.type('text/plain').sendFile(WISHES_FILE);
});

// Đảm bảo API trả về JSON cho mọi lỗi và mọi phương thức
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Lỗi server nội bộ", details: err.toString() });
});

// Đảm bảo fallback cho route không tồn tại (tránh lỗi CORS preflight hoặc fetch)
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Khởi động server
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));

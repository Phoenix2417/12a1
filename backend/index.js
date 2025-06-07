const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, '..', 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.txt');

// Đảm bảo thư mục và file tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(WISHES_FILE)) fs.writeFileSync(WISHES_FILE, '', 'utf8');

app.use(cors());
app.use(bodyParser.json());

// Gửi lời chúc (lưu vào file)
app.post("/api/messages", (req, res) => {
  const { name, type, message } = req.body;
  if (!name || !message) return res.status(400).json({ error: "Thiếu dữ liệu!" });

  const newMessage = {
    id: Date.now(),
    name,
    type,
    message,
    timestamp: Date.now()
  };

  try {
    fs.appendFileSync(WISHES_FILE, JSON.stringify(newMessage) + '\n', 'utf8');
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Lỗi ghi dữ liệu", details: err.toString() });
  }
});

// Lấy tất cả lời chúc (từ file)
app.get("/api/messages", (req, res) => {
  try {
    const lines = fs.readFileSync(WISHES_FILE, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: "Lỗi đọc dữ liệu", details: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});

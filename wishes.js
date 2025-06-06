const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.txt');

// Đảm bảo thư mục và file tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(WISHES_FILE)) fs.writeFileSync(WISHES_FILE, '', 'utf8');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // phục vụ file tĩnh

// API lưu lời chúc
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
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Không thể lưu lời chúc' });
    }
});

// API lấy danh sách lời chúc (file txt)
app.get('/wishes.txt', (req, res) => {
    res.type('text/plain').sendFile(WISHES_FILE);
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

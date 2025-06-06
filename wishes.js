const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.txt');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

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
    fs.appendFileSync(WISHES_FILE, JSON.stringify(wish) + '\n', 'utf8');
    res.json({ success: true });
});

// API lấy danh sách lời chúc (file txt)
app.get('/wishes.txt', (req, res) => {
    if (!fs.existsSync(WISHES_FILE)) return res.send('');
    res.sendFile(WISHES_FILE);
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

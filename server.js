const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const WISHES_FILE = path.join(__dirname, 'wishes.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Thư mục chứa file HTML

// Đọc dữ liệu từ file JSON
function readWishes() {
    try {
        const data = fs.readFileSync(WISHES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Nếu file không tồn tại, tạo file mới
            fs.writeFileSync(WISHES_FILE, JSON.stringify([], null, 2));
            return [];
        }
        console.error('Lỗi khi đọc file:', err);
        return [];
    }
}

// Ghi dữ liệu vào file JSON
function writeWishes(wishes) {
    try {
        fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));
    } catch (err) {
        console.error('Lỗi khi ghi file:', err);
    }
}

// API endpoints
app.get('/api/wishes', (req, res) => {
    const wishes = readWishes();
    res.json(wishes);
});

app.post('/api/wishes', (req, res) => {
    const wishes = readWishes();
    const newWish = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: Date.now()
    };
    
    wishes.unshift(newWish);
    writeWishes(wishes);
    
    res.status(201).json(newWish);
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

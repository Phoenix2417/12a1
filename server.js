const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const WISHES_FILE = path.join(__dirname, 'data', 'wishes.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Đọc dữ liệu từ file JSON
function readWishes() {
    try {
        const data = fs.readFileSync(WISHES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Nếu file không tồn tại, tạo file mới với dữ liệu mẫu
            const defaultWishes = [
                {
                    id: "sample1",
                    name: "Huy Hoàng",
                    message: "Chúc cả lớp luôn vui vẻ, hạnh phúc và thành công trong mọi việc! 💖",
                    type: "general",
                    timestamp: Date.now() - 3600000
                }
            ];
            fs.writeFileSync(WISHES_FILE, JSON.stringify(defaultWishes, null, 2));
            return defaultWishes;
        }
        console.error('Lỗi khi đọc file:', err);
        return [];
    }
}

// Ghi dữ liệu vào file JSON
function writeWishes(wishes) {
    try {
        fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2));
        return true;
    } catch (err) {
        console.error('Lỗi khi ghi file:', err);
        return false;
    }
}

// Validate dữ liệu lời chúc
function validateWish(wish) {
    const errors = [];
    
    if (!wish.name || wish.name.trim().length < 2) {
        errors.push('Tên phải có ít nhất 2 ký tự');
    }
    
    if (!wish.message || wish.message.trim().length < 10) {
        errors.push('Lời chúc phải có ít nhất 10 ký tự');
    }
    
    if (wish.name && wish.name.length > 50) {
        errors.push('Tên không được quá 50 ký tự');
    }
    
    if (wish.message && wish.message.length > 1000) {
        errors.push('Lời chúc không được quá 1000 ký tự');
    }
    
    // Kiểm tra loại lời chúc hợp lệ
    const validTypes = ['general', 'love', 'friendship', 'encouragement', 'memory'];
    if (!validTypes.includes(wish.type)) {
        errors.push('Loại lời chúc không hợp lệ');
    }
    
    return errors.length === 0 ? null : errors;
}

// API endpoints
app.get('/api/wishes', (req, res) => {
    try {
        const wishes = readWishes();
        // Sắp xếp theo thời gian mới nhất
        const sortedWishes = wishes.sort((a, b) => b.timestamp - a.timestamp);
        // Giới hạn số lượng trả về (tối đa 50)
        const limitedWishes = sortedWishes.slice(0, 50);
        res.json(limitedWishes);
    } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi tải lời chúc' });
    }
});

app.post('/api/wishes', (req, res) => {
    try {
        const validationErrors = validateWish(req.body);
        if (validationErrors) {
            return res.status(400).json({ errors: validationErrors });
        }

        const wishes = readWishes();
        const newWish = {
            id: Date.now().toString(),
            name: req.body.name.trim(),
            message: req.body.message.trim(),
            type: req.body.type,
            timestamp: Date.now()
        };
        
        // Thêm vào đầu mảng
        wishes.unshift(newWish);
        
        // Giới hạn số lượng lưu trữ (tối đa 50)
        const limitedWishes = wishes.slice(0, 50);
        
        if (writeWishes(limitedWishes)) {
            res.status(201).json(newWish);
        } else {
            res.status(500).json({ error: 'Không thể lưu lời chúc' });
        }
    } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lưu lời chúc' });
    }
});

// Xử lý 404
app.use((req, res) => {
    res.status(404).send('Không tìm thấy trang');
});

// Xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã xảy ra lỗi!');
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server API đang chạy tại http://localhost:${PORT}`);
    console.log(`Bạn có thể truy cập các endpoint:`);
    console.log(`- GET /api/wishes - Lấy danh sách lời chúc`);
    console.log(`- POST /api/wishes - Gửi lời chúc mới`);
});

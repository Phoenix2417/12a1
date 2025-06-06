const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Đọc danh sách lời chúc từ file
function getWishes() {
    if (!fs.existsSync(WISHES_FILE)) return [];
    try {
        const raw = fs.readFileSync(WISHES_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch {
        return [];
    }
}

// Thêm lời chúc mới vào file
function addNewWish(wish) {
    const errors = [];
    if (!wish.name || wish.name.trim().length < 2) errors.push('Tên phải có ít nhất 2 ký tự.');
    if (!wish.message || wish.message.trim().length < 5) errors.push('Lời chúc phải có ít nhất 5 ký tự.');
    if (errors.length > 0) return { success: false, errors };

    const wishes = getWishes();
    const newWish = {
        ...wish,
        timestamp: Date.now()
    };
    wishes.unshift(newWish);
    fs.writeFileSync(WISHES_FILE, JSON.stringify(wishes, null, 2), 'utf8');
    return { success: true, wish: newWish };
}

// Thêm lời chúc mới
const result = addNewWish({
    name: "Tên người gửi",
    message: "Nội dung lời chúc",
    type: "general"
});

if (result.success) {
    console.log("Thêm lời chúc thành công!");
} else {
    console.log("Lỗi:", result.errors || result.error);
}

// Lấy danh sách lời chúc
const allWishes = getWishes();
console.log("Danh sách lời chúc:", allWishes);

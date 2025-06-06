const fs = require('fs');
const path = require('path');

const WISHES_FILE = path.join(__dirname, 'data', 'wishes.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

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

// Hàm thêm lời chúc mới
function addNewWish(wishData) {
    const validationErrors = validateWish(wishData);
    if (validationErrors) {
        console.error('Lỗi validate:', validationErrors);
        return { success: false, errors: validationErrors };
    }

    const wishes = readWishes();
    const newWish = {
        id: Date.now().toString(),
        name: wishData.name.trim(),
        message: wishData.message.trim(),
        type: wishData.type,
        timestamp: Date.now()
    };
    
    // Thêm vào đầu mảng
    wishes.unshift(newWish);
    
    // Giới hạn số lượng lưu trữ (tối đa 50)
    const limitedWishes = wishes.slice(0, 50);
    
    if (writeWishes(limitedWishes)) {
        return { success: true, wish: newWish };
    } else {
        return { success: false, error: 'Không thể lưu lời chúc' };
    }
}

// Hàm lấy danh sách lời chúc
function getWishes() {
    try {
        const wishes = readWishes();
        // Sắp xếp theo thời gian mới nhất
        const sortedWishes = wishes.sort((a, b) => b.timestamp - a.timestamp);
        // Giới hạn số lượng trả về (tối đa 50)
        return sortedWishes.slice(0, 50);
    } catch (error) {
        console.error('Lỗi khi đọc lời chúc:', error);
        return [];
    }
}

// Xuất các hàm để có thể sử dụng từ file khác
module.exports = {
    addNewWish,
    getWishes,
    validateWish
};

console.log('Module quản lý lời chúc đã sẵn sàng');
console.log('Bạn có thể sử dụng các hàm sau:');
console.log('- getWishes(): Lấy danh sách lời chúc');
console.log('- addNewWish(wishData): Thêm lời chúc mới');
console.log('- validateWish(wishData): Kiểm tra tính hợp lệ của lời chúc');

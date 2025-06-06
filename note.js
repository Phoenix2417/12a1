const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Đọc đường dẫn file wishes.txt trong thư mục data
const DATA_DIR = path.join(__dirname, 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.txt');

// Khởi tạo dữ liệu mẫu nếu file chưa tồn tại hoặc rỗng
function initWishesData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(WISHES_FILE) || fs.readFileSync(WISHES_FILE, 'utf8').trim() === '') {
    const sample = [
      {
        name: "Admin",
        type: "general",
        message: "Chào mừng bạn đến với LOVE 12A1! Hãy gửi lời chúc đầu tiên nhé!",
        timestamp: Date.now()
      }
    ];
    fs.writeFileSync(WISHES_FILE, sample.map(w => JSON.stringify(w)).join('\n') + '\n', 'utf8');
    console.log('Đã khởi tạo dữ liệu mẫu cho wishes.txt');
  } else {
    console.log('wishes.txt đã tồn tại và có dữ liệu.');
  }
}

// Tải dữ liệu từ web về file data.txt (hoặc tên file truyền vào)
async function fetchNoteToFile(filename = 'data.txt') {
  const path = `${__dirname}/${filename}`;
  const url = 'http://localhost:3000/data.txt'; // Đường dẫn localhost
  try {
    const res = await axios.get(url, { responseType: 'text' });
    fs.writeFileSync(path, res.data, 'utf8');
    console.log(`✅ Đã tải dữ liệu từ ${url} và lưu vào file: ${path}`);
  } catch (e) {
    console.error(`❌ Lỗi: ${e.toString()}`);
  }
}

// Ví dụ sử dụng: node note.js myfile.txt
if (require.main === module) {
  const filename = process.argv[2] || 'data.txt';
  fetchNoteToFile(filename);
  initWishesData();
}

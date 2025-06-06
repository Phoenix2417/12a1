const axios = require('axios');
const fs = require('fs');

// Tải dữ liệu từ web về file data.txt (hoặc tên file truyền vào)
async function fetchNoteToFile(filename = 'data.txt') {
  const path = `${__dirname}/${filename}`;
  const url = 'https://12a1.x10.bz/data.txt';
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
}

const wishesManager = require('./wishesManager');

// Thêm lời chúc mới
const result = wishesManager.addNewWish({
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
const allWishes = wishesManager.getWishes();
console.log("Danh sách lời chúc:", allWishes);

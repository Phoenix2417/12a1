const STORAGE_KEY = '12a1_wishes';

class WishesManager {
    loadWishes() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return Promise.resolve([]);
        try {
            return Promise.resolve(JSON.parse(data));
        } catch {
            return Promise.resolve([]);
        }
    }

    saveWish(wish) {
        return this.loadWishes().then(wishes => {
            const newWish = {
                ...wish,
                timestamp: Date.now()
            };
            wishes.unshift(newWish);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
            return newWish;
        });
    }

    validateWish(wish) {
        const errors = [];
        if (!wish.name || wish.name.trim().length < 2) errors.push('Tên phải có ít nhất 2 ký tự.');
        if (!wish.message || wish.message.trim().length < 5) errors.push('Lời chúc phải có ít nhất 5 ký tự.');
        return errors;
    }
}

// Đưa class ra global để index.html dùng được
window.WishesManager = WishesManager;

console.log('Module quản lý lời chúc đã sẵn sàng');
console.log('Bạn có thể sử dụng các hàm sau:');
console.log('- getWishes(): Lấy danh sách lời chúc');
console.log('- addNewWish(wishData): Thêm lời chúc mới');
console.log('- validateWish(wishData): Kiểm tra tính hợp lệ của lời chúc');

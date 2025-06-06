// Hàm hiển thị prompt nhập tên nếu chưa có
function promptForUsername() {
    let username = localStorage.getItem('12a1_username');
    if (!username) {
        username = prompt('Vui lòng nhập tên của bạn để gửi lời chúc:');
        if (username && username.trim().length >= 2) {
            localStorage.setItem('12a1_username', username.trim());
        } else {
            alert('Tên phải có ít nhất 2 ký tự!');
            return promptForUsername();
        }
    }
    return username;
}

// Hàm cho phép đổi tên người dùng
function changeUsername() {
    localStorage.removeItem('12a1_username');
    promptForUsername();
    // Tự động điền lại vào input nếu có
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = localStorage.getItem('12a1_username') || '';
}

// Khi trang load, tự động điền tên vào input
document.addEventListener('DOMContentLoaded', function() {
    const username = promptForUsername();
    const nameInput = document.getElementById('name');
    if (nameInput && username) {
        nameInput.value = username;
        // Khi người dùng đổi tên input, cập nhật lại localStorage
        nameInput.addEventListener('change', function() {
            if (nameInput.value.trim().length >= 2) {
                localStorage.setItem('12a1_username', nameInput.value.trim());
            }
        });
    }
    // Thêm nút đổi tên nếu muốn
    let btn = document.getElementById('change-username-btn');
    if (!btn && nameInput) {
        btn = document.createElement('button');
        btn.id = 'change-username-btn';
        btn.type = 'button';
        btn.textContent = 'Đổi tên';
        btn.style.marginLeft = '10px';
        btn.onclick = changeUsername;
        nameInput.parentNode.appendChild(btn);
    }
});

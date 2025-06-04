document.addEventListener('DOMContentLoaded', function() {
    const backgroundImages = [
        'assets/backgrounds/1.jpg',
        'assets/backgrounds/2.jpg',
        'assets/backgrounds/3.jpg',
        'assets/backgrounds/4.jpg',
        'assets/backgrounds/5.jpg',
        'assets/backgrounds/6.jpg',
        'assets/backgrounds/7.jpg'
    ];
    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');
    const wishesList = document.getElementById('wishes-list');
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    // Hàm thay đổi ảnh nền ngẫu nhiên
    function changeBackground() {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        const randomImage = backgroundImages[randomIndex];
        document.body.style.backgroundImage = `url('${randomImage}')`;
    }
    
    // Nút đổi ảnh nền
    const changeBgBtn = document.getElementById('change-bg');
    changeBgBtn.addEventListener('click', changeBackground);
    
    // Thay đổi ảnh nền ngẫu nhiên khi trang được tải
    changeBackground();
    
    // Tải dữ liệu từ JSON
    let wishes = [];
    
    // Khởi tạo nhạc nền
    const backgroundMusic = document.getElementById('background-music');
    backgroundMusic.volume = 0.3;
    
    // Tự động phát nhạc (có thể bị chặn bởi trình duyệt)
    function attemptAutoPlay() {
        const promise = backgroundMusic.play();
        
        if (promise !== undefined) {
            promise.catch(error => {
                // Nếu tự động phát bị chặn, hiển thị nút play
                musicToggle.style.display = 'block';
                musicToggle.textContent = '🔊 Bật nhạc';
            });
        }
    }
    
    // Thử phát nhạc khi trang tải
    attemptAutoPlay();
    
    // Xử lý bật/tắt nhạc
    musicToggle.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            this.textContent = '🔊 Tắt nhạc';
        } else {
            backgroundMusic.pause();
            this.textContent = '🔊 Bật nhạc';
        }
    });
    
    // Tải dữ liệu khi trang được tải
    loadWishes();
    
    // Xử lý sự kiện gửi lời chúc
    submitBtn.addEventListener('click', addWish);
    
    // Xử lý bật/tắt nhạc
    musicToggle.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });
    
    function loadWishes() {
        fetch('wishes.json')
            .then(response => response.json())
            .then(data => {
                wishes = data;
                displayWishes();
            })
            .catch(error => {
                console.error('Lỗi khi tải dữ liệu:', error);
                // Nếu file không tồn tại, tạo mảng rỗng
                wishes = [];
            });
    }
    
    function addWish() {
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !message) {
            alert('Vui lòng điền đầy đủ tên và lời chúc!');
            return;
        }
        
        const newWish = {
            id: Date.now(),
            name: name,
            message: message,
            date: new Date().toLocaleString('vi-VN')
        };
        
        wishes.unshift(newWish); // Thêm vào đầu mảng
        saveWishes();
        displayWishes();
        
        // Reset form
        nameInput.value = '';
        messageInput.value = '';
    }
    
    function saveWishes() {
        const data = JSON.stringify(wishes, null, 2);
        
        // Gửi dữ liệu đến server (trong môi trường thực tế)
        // Ở đây chúng ta giả lập bằng localStorage (chỉ hoạt động trên client)
        try {
            localStorage.setItem('wishesData', data);
            
            // Trong môi trường thực tế, bạn cần một server-side script
            // để lưu vào file JSON thực sự
            console.log('Trong môi trường thực tế, cần gửi dữ liệu đến server để lưu vào file JSON');
        } catch (e) {
            console.error('Lỗi khi lưu dữ liệu:', e);
        }
    }
    
    function displayWishes() {
        wishesList.innerHTML = '';
        
        if (wishes.length === 0) {
            wishesList.innerHTML = '<p>Chưa có lời chúc nào. Hãy là người đầu tiên!</p>';
            return;
        }
        
        wishes.forEach(wish => {
            const wishElement = document.createElement('div');
            wishElement.className = 'wish-card';
            wishElement.innerHTML = `
                <div class="wish-author">${wish.name}</div>
                <div class="wish-date">${wish.date}</div>
                <div class="wish-message">${wish.message}</div>
            `;
            wishesList.appendChild(wishElement);
        });
    }
});

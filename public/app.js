document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const heartsContainer = document.getElementById('hearts-container');
            const musicToggle = document.getElementById('music-toggle');
            const backgroundMusic = document.getElementById('background-music');
            const changeBgBtn = document.getElementById('change-bg');
            const refreshBtn = document.getElementById('refresh-btn');
            const submitBtn = document.getElementById('submit-btn');
            const confirmationModal = document.getElementById('confirmation-modal');
            const closeModalBtn = document.getElementById('close-modal');
            const shareModalBtn = document.getElementById('share-modal');
            const wishesListElement = document.getElementById('wishes-list');
            const totalWishesElement = document.getElementById('total-wishes');
            const backToTopBtn = document.getElementById('backToTop');

            // ========== XỬ LÝ MODAL ==========
            window.showAbout = function() {
                document.getElementById('aboutModal').classList.add('active');
            };

            window.hideAbout = function() {
                document.getElementById('aboutModal').classList.remove('active');
            };

            window.showContact = function() {
                document.getElementById('contactModal').classList.add('active');
            };

            window.hideContact = function() {
                document.getElementById('contactModal').classList.remove('active');
            };

            // Đóng modal khi click ra ngoài
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('info-modal')) {
                    document.querySelectorAll('.info-modal').forEach(modal => {
                        modal.classList.remove('active');
                    });
                }
            });

            // ========== XỬ LÝ NÚT VỀ ĐẦU TRANG ==========
            // Hiển thị/nấu nút khi cuộn
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });

            // Xử lý click nút về đầu trang
            backToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // Cải thiện hàm scrollToTop
            window.scrollToTop = function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            };

            // ========== XỬ LÝ SỰ KIỆN ==========
            // Tự động phát nhạc khi trang tải (nếu được phép)
            function tryPlayMusic() {
                if (backgroundMusic.paused) {
                    backgroundMusic.volume = 0.5;
                    backgroundMusic.play().catch(() => {});
                }
            }
            tryPlayMusic();
            document.body.addEventListener('click', tryPlayMusic, { once: true });
            document.body.addEventListener('touchstart', tryPlayMusic, { once: true });

            // Thay đổi hình nền
            const bgGradients = [
                'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                'linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)'
            ];
            let currentBg = 0;
            changeBgBtn.addEventListener('click', function() {
                currentBg = (currentBg + 1) % bgGradients.length;
                document.body.style.background = bgGradients[currentBg];
            });
            
            // Làm mới lời chúc
            refreshBtn.addEventListener('click', function() {
                loadAndDisplayWishes();
                createHearts(5);
            });
            
            // Gửi lời chúc
            submitBtn.addEventListener('click', async function() {
                const name = document.getElementById('name').value;
                const type = document.getElementById('type').value;
                const message = document.getElementById('message').value;

                // Validate
                const errors = [];
                if (!name || name.trim().length < 2) errors.push('Tên phải có ít nhất 2 ký tự.');
                if (!message || message.trim().length < 5) errors.push('Lời chúc phải có ít nhất 5 ký tự.');
                if (errors.length > 0) {
                    alert('Lỗi:\n' + errors.join('\n'));
                    return;
                }

                // Hiển thị loading
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading"></span> Đang gửi...';

                try {
                    // Gửi lời chúc lên server để lưu vào wishes.txt
                    await sendWish(name, type, message);

                    // Hiển thị modal xác nhận
                    confirmationModal.classList.add('active');

                    // Reset form
                    document.getElementById('name').value = localStorage.getItem('12a1_username') || '';
                    document.getElementById('message').value = '';

                    // Tải lại danh sách
                    await loadAndDisplayWishes();

                    // Hiệu ứng trái tim
                    createHearts(10);

                    // Chuyển hướng sang trang web xem lời chúc
                    setTimeout(function() {
                        window.location.href = 'http://localhost:3000';
                    }, 1200); // Đợi 1.2s để người dùng thấy modal xác nhận
                } catch (error) {
                    console.error('Lỗi khi gửi lời chúc:', error);
                    alert('Có lỗi xảy ra khi gửi lời chúc. Vui lòng thử lại!');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-heart"></i> Gửi Lời Chúc';
                }
            });
            
            // Đóng modal
            closeModalBtn.addEventListener('click', function() {
                confirmationModal.classList.remove('active');
            });
            
            // Chia sẻ
            shareModalBtn.addEventListener('click', function() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Lời chúc từ LOVE 12A1',
                        text: 'Tôi vừa gửi một lời chúc ngọt ngào trên trang LOVE 12A1!',
                        url: window.location.href
                    }).catch(err => {
                        console.log('Lỗi khi chia sẻ:', err);
                        copyToClipboard(window.location.href);
                        alert('Đã sao chép link vào clipboard!');
                    });
                } else {
                    // Fallback cho trình duyệt không hỗ trợ Web Share API
                    copyToClipboard(window.location.href);
                    alert('Đã sao chép link vào clipboard!');
                }
                confirmationModal.classList.remove('active');
            });

            // Tải và hiển thị lời chúc từ wishes.txt
            async function loadAndDisplayWishes() {
                try {
                    // Thêm tham số ngẫu nhiên để tránh cache
                    const res = await fetch('/wishes.txt?nocache=' + Date.now());
                    if (!res.ok) throw new Error('Không thể tải lời chúc');
                    const text = await res.text();
                    const wishes = text
                        .split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                            try { return JSON.parse(line); } catch { return null; }
                        })
                        .filter(Boolean);
                    displayWishes(wishes);
                    totalWishesElement.textContent = wishes.length;
                } catch (error) {
                    console.error('Lỗi khi tải lời chúc:', error);
                    wishesListElement.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Không thể tải lời chúc. Vui lòng thử lại sau!</p>
                        </div>
                    `;
                }
            }
            
            // Hiển thị lời chúc lên giao diện
            function displayWishes(wishes) {
                if (!wishes || wishes.length === 0) {
                    wishesListElement.innerHTML = `
                        <div class="empty-message">
                            <i class="far fa-comment-dots"></i>
                            <p>Chưa có lời chúc nào. Hãy là người đầu tiên nhé!</p>
                        </div>
                    `;
                    return;
                }
                
                const wishTypeNames = {
                    'general': 'Lời chúc chung',
                    'love': 'Lời yêu thương',
                    'friendship': 'Tình bạn',
                    'encouragement': 'Động viên',
                    'memory': 'Kỷ niệm'
                };
                
                const wishTypeColors = {
                    'general': '#ff6b8b',
                    'love': '#ff4757',
                    'friendship': '#2ed573',
                    'encouragement': '#1e90ff',
                    'memory': '#ffa502'
                };
                
                wishesListElement.innerHTML = wishes.map(wish => `
                    <div class="wish-card">
                        <span class="wish-type" style="background-color: ${wishTypeColors[wish.type] || '#ff6b8b'}">
                            ${wishTypeNames[wish.type] || 'Lời chúc'}
                        </span>
                        <h4>${escapeHtml(wish.name)}</h4>
                        <p>${formatMessage(wish.message)}</p>
                        <small>${formatDate(wish.timestamp)}</small>
                    </div>
                `).join('');
            }
            
            // Tạo hiệu ứng trái tim bay
            function createHearts(count) {
                for (let i = 0; i < count; i++) {
                    setTimeout(() => {
                        const heart = document.createElement('div');
                        heart.className = 'heart-float';
                        heart.innerHTML = '❤️';
                        
                        // Random vị trí và kích thước
                        const size = Math.random() * 2 + 1;
                        const left = Math.random() * 100;
                        const animationDuration = Math.random() * 4 + 3;
                        
                        heart.style.left = `${left}%`;
                        heart.style.fontSize = `${size}rem`;
                        heart.style.animationDuration = `${animationDuration}s`;
                        
                        heartsContainer.appendChild(heart);
                        
                        // Xóa sau khi animation kết thúc
                        setTimeout(() => {
                            heart.remove();
                        }, animationDuration * 1000);
                    }, i * 300);
                }
            }
            
            // Sao chép vào clipboard
            function copyToClipboard(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            
            // Định dạng ngày tháng
            function formatDate(timestamp) {
                if (!timestamp) return '';
                
                const date = new Date(timestamp);
                const now = new Date();
                const diffInSeconds = Math.floor((now - date) / 1000);
                
                if (diffInSeconds < 60) {
                    return 'Vừa xong';
                } else if (diffInSeconds < 3600) {
                    const mins = Math.floor(diffInSeconds / 60);
                    return `${mins} phút trước`;
                } else if (diffInSeconds < 86400) {
                    const hours = Math.floor(diffInSeconds / 3600);
                    return `${hours} giờ trước`;
                } else {
                    const days = Math.floor(diffInSeconds / 86400);
                    return `${days} ngày trước`;
                }
            }
            
            // Định dạng tin nhắn (giữ nguyên xuống dòng)
            function formatMessage(message) {
                if (!message) return '';
                return escapeHtml(message).replace(/\n/g, '<br>');
            }
            
            // Xử lý HTML để tránh XSS
            function escapeHtml(unsafe) {
                if (!unsafe) return '';
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            
            // ========== KHỞI TẠO BAN ĐẦU ==========
            
            // Tạo một vài trái tim khi trang load
            createHearts(3);
            
            // Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
            if (!navigator.share) {
                shareModalBtn.innerHTML = '<i class="fas fa-copy"></i> Sao chép link';
            }

            // Tải lời chúc khi trang vừa load
            loadAndDisplayWishes();
        });

        async function sendWish(name, type, message) {
          try {
            const response = await fetch("http://localhost:3000/api/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({ name, type, message })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to send wish');
            }

            return await response.json();
          } catch (err) {
            console.error("Error sending wish:", err);
            throw err;
          }
        }

        async function fetchWishes() {
          try {
            const response = await fetch("http://localhost:3000/api/messages");
            if (!response.ok) {
              throw new Error('Failed to fetch wishes');
            }
            return await response.json();
          } catch (err) {
            console.error("Error fetching wishes:", err);
            document.getElementById("messages-list").innerHTML = `
              <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Không thể tải lời chúc. Vui lòng thử lại sau!</p>
                <button onclick="fetchWishes()">Thử lại</button>
              </div>
            `;
            throw err;
          }
        }

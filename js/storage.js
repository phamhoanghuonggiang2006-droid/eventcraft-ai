/**
 * =========================================================================
 * EventCraft AI - Storage & Multi-Tab Synchronization (js/storage.js)
 * Manages registered users, real-time counters, and cross-tab storage events
 * =========================================================================
 */

let registeredUsers = [];
try {
    registeredUsers = JSON.parse(localStorage.getItem('vibe_users')) || [];
} catch (e) {
    registeredUsers = [];
}

/**
 * Cập nhật bộ đếm số lượng người tham dự (Real-time Counter)
 */
function updateCounter() {
    // Mặc định gốc là 384 + số lượng user đã đăng ký mới
    const currentCount = 384 + (registeredUsers ? registeredUsers.length : 0);
    const counterEl = document.getElementById('registrant-counter');
    if (counterEl) {
        counterEl.innerText = currentCount;
        // Hiệu ứng giật nhẹ khi số nhảy
        counterEl.classList.add('scale-125');
        setTimeout(() => counterEl.classList.remove('scale-125'), 300);
    }
    const oldCounter = document.getElementById('attendeeCounter');
    if (oldCounter) {
        oldCounter.innerText = currentCount;
    }
}

/**
 * Lắng nghe sự thay đổi của bộ nhớ trình duyệt từ các tab khác (Đồng bộ đa tab - TC03)
 */
window.addEventListener('storage', function(e) {
    if (e.key === 'vibe_users') {
        try {
            registeredUsers = JSON.parse(e.newValue) || [];
        } catch(err) {
            registeredUsers = [];
        }
        // Tự động nhảy số ngay lập tức trên các tab khác mà không cần F5
        if (typeof updateCounter === 'function') {
            updateCounter();
        }
    }
});

/**
 * Reset toàn bộ dữ liệu ứng dụng về mặc định
 */
function resetLandingPage() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đăng ký và làm lại từ đầu?")) {
        localStorage.clear(); // Xóa sạch sẽ toàn bộ data bao gồm cả vibe_lp_created
        registeredUsers = [];
        updateCounter();
        if (typeof updateHeroHeadline === 'function') {
            updateHeroHeadline("ORCHESTRATE THE FUTURE");
        }
        if (typeof showToast === 'function') {
            showToast("Đã reset trang. Tải lại trang để áp dụng...", "error");
        }
        setTimeout(() => location.reload(), 1500);
    }
}

// Global exports
if (typeof window !== 'undefined') {
    window.registeredUsers = registeredUsers;
    window.updateCounter = updateCounter;
    window.resetLandingPage = resetLandingPage;
}


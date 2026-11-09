/**
 * =========================================================================
 * EventCraft AI - Main Application Coordinator (js/app.js)
 * Coordinates UI navigation, setup screen lifecycle, and modals
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra trạng thái Setup Form: nếu chưa tạo thì bắt buộc hiện và khóa cuộn trang
    const setupScreen = document.getElementById('setup-screen');
    const isCreated = localStorage.getItem('vibe_lp_created');
    
    if (setupScreen) {
        if (isCreated !== 'true') {
            setupScreen.classList.remove('hidden', 'opacity-0');
            document.body.style.overflow = 'hidden';
        } else {
            setupScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // 2. Khởi tạo bộ đếm vé
    if (typeof updateCounter === 'function') {
        updateCounter();
    }

    // 3. Chuẩn hóa typography tiêu đề Hero
    const currentHeadline = document.getElementById('ai-headline') || document.getElementById('heroHeadline');
    if (currentHeadline && typeof updateHeroHeadline === 'function') {
        updateHeroHeadline(currentHeadline.innerText.trim());
    }

    // 4. Khởi tạo Lucide Icons nếu có
    if (window.lucide) {
        lucide.createIcons();
    }
});


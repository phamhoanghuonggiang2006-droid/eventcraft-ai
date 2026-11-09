/**
 * =========================================================================
 * EventCraft AI - AI Generator Engine (js/ai-generator.js)
 * Handles Setup Form validation, Mock AI synthesis, and adaptive typography
 * =========================================================================
 */

/**
 * Điều phối Typography Hero Headline thích ứng ngôn ngữ
 */
function updateHeroHeadline(text) {
    const headline = document.getElementById('ai-headline') || document.getElementById('heroHeadline');
    if (!headline || !text) return;

    headline.innerText = text;

    // Kiểm tra ký tự tiếng Việt có dấu
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/i.test(text);

    if (hasVietnamese) {
        // Font Roller Coaster không hỗ trợ dấu tiếng Việt -> Chuyển sang Inter Black chuẩn Dark Tech
        headline.classList.remove('font-roller', 'tracking-wider', 'leading-[0.92]', 'text-[4.5rem]', 'sm:text-[6rem]', 'md:text-[7.5rem]', 'lg:text-[8.5rem]');
        headline.classList.add('font-sans', 'font-black', 'tracking-tight', 'leading-[1.1]', 'text-3xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl');
        headline.style.fontFamily = "'Inter', sans-serif";
        headline.style.letterSpacing = "normal";
    } else {
        // Tiếng Anh (không dấu) -> Giữ nguyên font Roller Coaster phóng to chuẩn thiết kế
        headline.classList.remove('font-sans', 'font-black', 'tracking-tight', 'leading-[1.1]', 'text-3xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl');
        headline.classList.add('font-roller', 'tracking-wider', 'leading-[0.92]', 'text-[4.5rem]', 'sm:text-[6rem]', 'md:text-[7.5rem]', 'lg:text-[8.5rem]');
        headline.style.fontFamily = "";
        headline.style.letterSpacing = "";
    }
}

/**
 * 1. Hàm tạo Landing Page từ Form Setup Khởi Tạo
 */
function generateLandingPage() {
    const eventNameInput = document.getElementById('setup-eventName');
    const eventDateInput = document.getElementById('setup-date');
    const eventLocationInput = document.getElementById('setup-location');
    
    const eventName = eventNameInput ? eventNameInput.value.trim() : '';
    const eventDate = eventDateInput ? eventDateInput.value : '';
    const eventLocation = eventLocationInput ? eventLocationInput.value.trim() : '';
    
    // Xác thực theo kịch bản TC02
    if (!eventName) {
        if (typeof showToast === 'function') showToast("Vui lòng nhập Tên sự kiện", "error");
        return;
    }
    if (!eventDate || new Date(eventDate) <= new Date()) {
        if (typeof showToast === 'function') showToast("Thời gian sự kiện phải ở tương lai", "error");
        return;
    }
    if (!eventLocation) {
        if (typeof showToast === 'function') showToast("Vui lòng nhập Địa điểm", "error");
        return;
    }
    
    const btn = document.getElementById('btn-generate-lp');
    if (btn) {
        btn.innerHTML = `<svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> MOCK AI ĐANG PHÂN TÍCH...`;
        btn.disabled = true;
    }

    // Giả lập delay để AI "làm việc"
    setTimeout(() => {
        // Ẩn màn hình Setup Form
        const setupScreen = document.getElementById('setup-screen');
        if (setupScreen) {
            setupScreen.classList.add('opacity-0');
            setTimeout(() => setupScreen.classList.add('hidden'), 500);
        }

        // Lưu cờ vào localStorage để F5 không bị hiện lại màn hình setup
        localStorage.setItem('vibe_lp_created', 'true');
        if (typeof document !== 'undefined') document.body.style.overflow = 'auto';

        // Lưu cấu hình sự kiện đã nhập
        const speaker = document.getElementById('setup-speaker')?.value.trim() || '';
        const offer = document.getElementById('setup-offer')?.value.trim() || '';
        try {
            localStorage.setItem('vibe_event_config', JSON.stringify({ eventName, eventDate, eventLocation, speaker, offer }));
        } catch(e) {}

        // TRUYỀN DỮ LIỆU INPUT VÀO HÀM AI
        if (typeof mockAiGenerate === 'function') {
            mockAiGenerate(eventName, eventDate, eventLocation);
        }
        
        if (typeof showToast === 'function') showToast("Đã tạo Landing Page thành công!");
    }, 1500);
}

/**
 * 2. Hàm Mock AI Auto-Generate
 */
function mockAiGenerate(eventName = "VIBE-CODING", eventDate = null, eventLocation = "TP.HCM") {
    if (arguments.length === 0 || !eventName) {
        try {
            const savedConfig = JSON.parse(localStorage.getItem('vibe_event_config') || '{}');
            eventName = savedConfig.eventName || "VIBE-CODING";
            eventDate = eventDate || savedConfig.eventDate || null;
            eventLocation = eventLocation || savedConfig.eventLocation || "TP.HCM";
        } catch(e) {
            eventName = "VIBE-CODING";
            eventLocation = "TP.HCM";
        }
    }

    const btn = document.getElementById('btn-mock-ai');
    if (btn) {
        btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Đang sinh nội dung...`;
        btn.classList.add('opacity-50', 'pointer-events-none');
    }

    setTimeout(() => {
        // 1. Cập nhật Headline (Ép hiển thị tối đa 2 dòng - line-clamp-2 để chống vỡ layout)
        const headline = document.getElementById('ai-headline') || document.getElementById('heroHeadline');
        if (headline) {
            headline.innerText = eventName.toUpperCase();
            headline.className = "text-5xl md:text-7xl font-bold text-white mb-6 font-['Space_Grotesk'] leading-tight uppercase line-clamp-2 break-words";
        }

        // 2. Cập nhật Mô tả (Mix dữ liệu người dùng với văn phong AI)
        const desc = document.getElementById('ai-description') || document.getElementById('heroDescription');
        if (desc) {
            desc.innerText = `Sự kiện "${eventName}" tổ chức tại ${eventLocation}. Bứt phá giới hạn lập trình truyền thống, biến tư duy chiến lược và ý tưởng kinh doanh thành sản phẩm thực tế.`;
        }
        
        // 3. Cập nhật Lợi ích
        const bullet1 = document.getElementById('ai-bullet-1');
        if (bullet1) bullet1.innerText = `🚀 Khai phá sức mạnh công nghệ tại ${eventLocation}.`;

        // 4. Kích hoạt Đồng hồ đếm ngược động (Dynamic Countdown)
        if (eventDate) {
            startDynamicCountdown(eventDate);
        }

        if (btn) {
            btn.innerHTML = `Đã tạo xong!`;
            btn.classList.replace('bg-[#CCFF00]', 'bg-green-500');
            setTimeout(() => {
                btn.innerHTML = `AI Auto-Generate`;
                btn.classList.replace('bg-green-500', 'bg-[#CCFF00]');
                btn.classList.remove('opacity-50', 'pointer-events-none');
            }, 2000);
        }
    }, 1500);
}

// 5. HÀM CHẠY ĐỒNG HỒ ĐẾM NGƯỢC THỰC TẾ DỰA VÀO INPUT
let countdownInterval;
function startDynamicCountdown(targetDateString) {
    clearInterval(countdownInterval); // Xóa đồng hồ cũ nếu có
    if (typeof countdownTimerId !== 'undefined' && countdownTimerId) clearInterval(countdownTimerId);
    const targetDate = new Date(targetDateString).getTime();

    // Cập nhật nhãn ngày mục tiêu nếu có
    const targetLabel = document.getElementById('countdown-target-date');
    if (targetLabel && targetDateString) {
        const d = new Date(targetDateString);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            targetLabel.innerText = `${day}.${month}.${year} ${hours}:${minutes}`;
        }
    }

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const dEl = document.getElementById('days');
        const hEl = document.getElementById('hours');
        const mEl = document.getElementById('minutes');
        const sEl = document.getElementById('seconds');

        if (distance < 0) {
            clearInterval(countdownInterval);
            if (dEl) dEl.innerText = "00";
            if (hEl) hEl.innerText = "00";
            if (mEl) mEl.innerText = "00";
            if (sEl) sEl.innerText = "00";
            return;
        }

        if (dEl) dEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
        if (hEl) hEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        if (mEl) mEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        if (sEl) sEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// Global exports
if (typeof window !== 'undefined') {
    window.updateHeroHeadline = updateHeroHeadline;
    window.generateLandingPage = generateLandingPage;
    window.mockAiGenerate = mockAiGenerate;
    window.startDynamicCountdown = startDynamicCountdown;
}


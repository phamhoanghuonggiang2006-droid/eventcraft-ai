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

        // Tự động kích hoạt hàm Mock AI đã viết từ trước để thay thế text Landing Page
        if (typeof mockAiGenerate === 'function') {
            mockAiGenerate();
        }
        
        if (typeof showToast === 'function') showToast("Đã tạo Landing Page thành công!");
    }, 1500);
}

/**
 * 2. Hàm Mock AI Auto-Generate
 */
function mockAiGenerate() {
    const btn = document.getElementById('btn-mock-ai');
    if (!btn) return;

    // Hiệu ứng Loading
    const originalText = btn.innerHTML;
    btn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        Đang kết nối AI...
    `;
    btn.disabled = true;

    // Giả lập độ trễ kết nối API (1.5 giây)
    setTimeout(() => {
        // Cập nhật Hero Section với Typography thích ứng chống lỗi font
        updateHeroHeadline("KỶ NGUYÊN TỰ ĐỘNG HÓA VỚI AI AGENT ĐỘT PHÁ");
        const desc = document.getElementById('ai-description') || document.getElementById('heroDescription');
        if (desc) desc.innerText = "Nền tảng thi đấu lập trình trực tiếp quy tụ 500+ kỹ sư toàn cầu, kiến tạo giải pháp thông minh vượt qua ranh giới công nghệ truyền thống.";

        // Cập nhật 3 Thẻ Giá trị
        const b1 = document.getElementById('ai-bullet-1');
        const b2 = document.getElementById('ai-bullet-2');
        const b3 = document.getElementById('ai-bullet-3');
        if (b1) b1.innerText = "Trợ lý AI tự sinh mã nguồn và tối ưu hóa hệ thống backend theo thời gian thực.";
        if (b2) b2.innerText = "Môi trường phát triển sandbox bảo mật cao, kết nối trực tiếp với cụm GPU đám mây.";
        if (b3) b3.innerText = "Hệ thống chấm điểm tự động đa tiêu chí, trả kết quả chỉ trong 10 giây.";

        // Khôi phục trạng thái nút bấm
        btn.innerHTML = `
            <svg class="w-4 h-4 text-[#CCFF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Đã cập nhật nội dung!
        `;
        btn.classList.add('bg-black', 'text-[#CCFF00]', 'border', 'border-[#CCFF00]');
        btn.classList.remove('bg-[#CCFF00]', 'text-black');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-black', 'text-[#CCFF00]', 'border', 'border-[#CCFF00]');
            btn.classList.add('bg-[#CCFF00]', 'text-black');
            btn.disabled = false;
        }, 2000);
    }, 1500);
}

// Global exports
if (typeof window !== 'undefined') {
    window.updateHeroHeadline = updateHeroHeadline;
    window.generateLandingPage = generateLandingPage;
    window.mockAiGenerate = mockAiGenerate;
}


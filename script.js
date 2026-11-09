/**
 * SCRIPT.JS - Three's Vibe-Tech Academy Engine
 * Senior Fullstack Developer & UI/UX Expert
 * 
 * 1. HỆ MÀU SẮC ĐA SẮC & AMBIENT 3D DEPTH
 * 2. KỶ LUẬT TYPOGRAPHY (Roller Coaster cho H1 English & Số, lfneofolia cho Logo & VIP, Inter cho Tiếng Việt)
 * 3. TINH GỌN UI (Liquid Glass chuẩn: bg-[#1A2235]/60, viền border-white/10, bỏ over-glowing)
 * 4. LOGIC AI SCQA (Gemini API / Mock Data) & LOCALSTORAGE (registrations, attendeeCounter)
 * 5. YẾU TỐ WOW (Canvas Particles hút CTA qua OffscreenCanvas & VIP Easter Egg)
 */

// =============================================================================
// CẤU HÌNH HỆ THỐNG
// =============================================================================
const APP_CONFIG = {
    DEFAULT_EVENT_DATE: '2026-11-28T09:00:00',
    STORAGE_REGISTRATIONS_KEY: 'registrations',
    STORAGE_EVENT_KEY: 'threes_event_data',
    STORAGE_ATTENDEE_COUNT_KEY: 'threes_attendee_count',
    STORAGE_VIP_KEY: 'threes_vip_unlocked',
    GEMINI_MODEL: 'gemini-1.5-flash',
    GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models'
};

// =============================================================================
// 1. VI TƯƠNG TÁC CANVAS PARTICLES & MAGNETIC CTA (OFFSCREENCANVAS)
// =============================================================================

function initCanvasParticles() {
    const canvas = document.getElementById('matrixCanvas');
    const heroCtaBtn = document.getElementById('heroCtaBtn');
    if (!canvas) return;

    let worker = null;
    let fallbackAnimId = null;

    // Lấy tọa độ tâm nút CTA so với Viewport
    function getCtaCoordinates() {
        if (!heroCtaBtn) return { x: -9999, y: -9999 };
        const rect = heroCtaBtn.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    let lastMousePos = { x: -9999, y: -9999 };

    function sendMousePosition(x, y) {
        lastMousePos = { x, y };
        const cta = getCtaCoordinates();
        const distToCta = Math.hypot(x - cta.x, y - cta.y);
        const isNearCta = distToCta < 250; // Bán kính kích hoạt nam châm: 250px

        // Tương tác trực tiếp trên nút CTA
        if (heroCtaBtn) {
            if (isNearCta) {
                heroCtaBtn.classList.add('scale-[1.03]', 'shadow-[0_0_35px_rgba(204,255,0,0.6)]');
            } else {
                heroCtaBtn.classList.remove('scale-[1.03]', 'shadow-[0_0_35px_rgba(204,255,0,0.6)]');
            }
        }

        if (worker) {
            worker.postMessage({
                type: 'MOUSE_UPDATE',
                mouseX: x,
                mouseY: y,
                ctaX: cta.x,
                ctaY: cta.y,
                isNearCta: isNearCta,
                distToCta: distToCta
            });
        }
    }

    // Thử nghiệm khởi tạo OffscreenCanvas + Web Worker
    if ('transferControlToOffscreen' in canvas && typeof Worker !== 'undefined') {
        try {
            const offscreen = canvas.transferControlToOffscreen();
            worker = new Worker('js/particle-worker.js');

            worker.postMessage({
                type: 'INIT',
                canvas: offscreen,
                width: window.innerWidth,
                height: window.innerHeight
            }, [offscreen]);

            window.addEventListener('resize', () => {
                if (worker) {
                    worker.postMessage({
                        type: 'RESIZE',
                        width: window.innerWidth,
                        height: window.innerHeight
                    });
                }
            });

            window.addEventListener('pointermove', (e) => sendMousePosition(e.clientX, e.clientY), { passive: true });
            window.addEventListener('scroll', () => {
                if (lastMousePos.x > 0) sendMousePosition(lastMousePos.x, lastMousePos.y);
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                if (worker) worker.postMessage({ type: 'MOUSE_LEAVE' });
            });

            console.log('⚡ [WOW UX] OffscreenCanvas + Web Worker hoạt động ở 120Hz.');
            return;
        } catch (err) {
            console.warn('⚠️ Chuyển sang Fallback Canvas trên Main-Thread:', err);
        }
    }

    // FALLBACK CANVAS (NẾU TRÌNH DUYỆT KHÔNG HỖ TRỢ OFFSCREENCANVAS)
    initFallbackCanvas(canvas, heroCtaBtn);
}

function initFallbackCanvas(canvas, heroCtaBtn) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 100;
    const colors = ['#CCFF00', '#00E5FF', '#B026FF', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    let mouse = { x: -9999, y: -9999 };
    window.addEventListener('pointermove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function loop() {
        ctx.clearRect(0, 0, width, height);

        // Spotlight
        if (mouse.x > 0) {
            const radGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
            radGrad.addColorStop(0, 'rgba(204, 255, 0, 0.12)');
            radGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.04)');
            radGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 300, 0, Math.PI * 2);
            ctx.fill();
        }

        // Particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(loop);
    }
    loop();
}

// =============================================================================
// 2. VIP EASTER EGG (GÕ PHÍM "vip" -> CHỚP TRẮNG 1S + CONFETTI + MODAL LFNEOFOLIA)
// =============================================================================

function initVipEasterEgg() {
    let keyBuffer = [];
    let keyTimer = null;

    const flashOverlay = document.getElementById('flashOverlay');
    const vipModal = document.getElementById('vipModal');
    const closeVipBtn = document.getElementById('closeVipBtn');
    const applyVipBtn = document.getElementById('applyVipBtn');

    window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            return;
        }

        clearTimeout(keyTimer);
        keyTimer = setTimeout(() => { keyBuffer = []; }, 1000);

        const char = e.key.toLowerCase();
        if (char.length === 1) {
            keyBuffer.push(char);
            if (keyBuffer.length > 3) keyBuffer.shift();

            if (keyBuffer.join('') === 'vip') {
                keyBuffer = [];
                triggerVipReward();
            }
        }
    });

    function triggerVipReward() {
        // 1. Chớp màn hình trắng 1s
        if (flashOverlay) {
            flashOverlay.classList.remove('hidden');
            flashOverlay.style.opacity = '1';
            setTimeout(() => {
                flashOverlay.style.opacity = '0';
                setTimeout(() => flashOverlay.classList.add('hidden'), 1000);
            }, 60);
        }

        // 2. Bắn pháo hoa Confetti
        launchBrandConfetti();

        // 3. Lưu trạng thái VIP vào localStorage
        localStorage.setItem(APP_CONFIG.STORAGE_VIP_KEY, 'true');

        // 4. Hiển thị Modal VIP Glass
        if (vipModal) {
            vipModal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        }

        console.log('🎉 [Easter Egg] Bẻ khóa VIP thành công! Đã áp dụng mã vé 0đ.');
    }

    if (closeVipBtn && vipModal) {
        closeVipBtn.addEventListener('click', () => vipModal.classList.add('hidden'));
    }

    if (applyVipBtn && vipModal) {
        applyVipBtn.addEventListener('click', () => {
            vipModal.classList.add('hidden');
            const regSection = document.getElementById('register');
            if (regSection) {
                regSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const nameInput = document.getElementById('regFullName');
                if (nameInput) setTimeout(() => nameInput.focus(), 600);
            }
            showToast('Đặc quyền VIP 0đ đã sẵn sàng trên form đăng ký!', 'success');
        });
    }
}

function launchBrandConfetti() {
    const c = document.createElement('canvas');
    c.style.position = 'fixed';
    c.style.inset = '0';
    c.style.width = '100vw';
    c.style.height = '100vh';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '99999';
    document.body.appendChild(c);

    const ctx = c.getContext('2d');
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);

    const colors = ['#CCFF00', '#FFFFFF', '#00E5FF', '#B026FF'];
    const particles = [];
    for (let i = 0; i < 160; i++) {
        const fromLeft = i % 2 === 0;
        particles.push({
            x: fromLeft ? w * 0.2 : w * 0.8,
            y: h + 20,
            vx: fromLeft ? (Math.random() * 8 + 4) : -(Math.random() * 8 + 4),
            vy: -(Math.random() * 16 + 14),
            size: Math.random() * 7 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 15,
            drag: 0.98,
            gravity: 0.35,
            opacity: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        let alive = 0;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            if (p.vy > 0) p.opacity -= 0.008;

            if (p.opacity > 0 && p.y < h + 30) {
                alive++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
                ctx.restore();
            }
        }

        if (alive > 0) {
            requestAnimationFrame(animate);
        } else {
            if (c.parentNode) c.parentNode.removeChild(c);
        }
    }
    animate();
}

// =============================================================================
// 3. PROMPT ENGINE (SCQA FRAMEWORK) & GEMINI API / MOCK DATA
// =============================================================================

/**
 * Sinh nội dung cho Landing Page theo SCQA Framework
 * @param {Object} data - { eventName, eventTime, eventLocation, eventSpeakers, apiKey }
 */
async function generateEventContent(data = {}) {
    const eventName = data.eventName || "Three's Vibe-Tech Summit 2026";
    const eventTime = data.eventTime || "28/11/2026 - 08:30";
    const eventLocation = data.eventLocation || "Innovation Center & Online Stream";
    const eventSpeakers = data.eventSpeakers || "AI Specialists & Founder Three's";

    const apiKey = data.apiKey || 
                   (typeof window !== 'undefined' && (window.API_KEY || window.GEMINI_API_KEY)) || 
                   '';

    // Không có API Key -> Dùng Mock Data
    if (!apiKey || apiKey.trim() === '') {
        console.info('⚡ [SCQA Engine] Không có API Key -> Kích hoạt Mock Data chuẩn Luật Bảng B.');
        await new Promise(r => setTimeout(r, 700));
        const mock = getMockSCQA({ eventName, eventTime, eventLocation, eventSpeakers });
        mock.isMock = true;
        return mock;
    }

    const systemInstruction = `Đóng vai Giám đốc Marketing của tổ chức Three's (Three's Vibe-Tech Academy). Dựa vào dữ kiện đầu vào, hãy dùng framework SCQA viết nội dung cho Landing Page. BẮT BUỘC trả về JSON gồm:
+ headline: Tiêu đề chính cực ngắn, bùng nổ, 100% bằng TIẾNG ANH.
+ description: Đoạn mô tả ngắn bằng Tiếng Việt (Situation - Complication).
+ benefits: Mảng gồm 3 chuỗi Tiếng Việt ngắn gọn (Question - Answer) nêu giải pháp thực chiến.`;

    const userPrompt = `
DỮ LIỆU ĐẦU VÀO:
- Tên sự kiện: "${eventName}"
- Thời gian: "${eventTime}"
- Địa điểm: "${eventLocation}"
- Diễn giả: "${eventSpeakers}"

BẮT BUỘC TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON SAU:
{
  "headline": "DIRECT THE CODE. BUILD THE FUTURE.",
  "description": "Kỷ nguyên gõ code thủ công đã kết thúc... (Situation - Complication)",
  "benefits": [
    "Lợi ích 1 (Question - Answer)",
    "Lợi ích 2 (Question - Answer)",
    "Lợi ích 3 (Question - Answer)"
  ]
}
`.trim();

    const endpoint = `${APP_CONFIG.GEMINI_API_ENDPOINT}/${APP_CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: userPrompt }] }],
                generationConfig: { response_mime_type: 'application/json', temperature: 0.7 }
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(text);

        return {
            headline: (parsed.headline || "DIRECT THE CODE. BUILD THE FUTURE.").toUpperCase(),
            description: parsed.description || "",
            benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
            isMock: false
        };

    } catch (err) {
        console.warn('⚠️ Lỗi gọi Gemini API, chuyển sang Mock SCQA:', err);
        const fallback = getMockSCQA({ eventName, eventTime, eventLocation, eventSpeakers });
        fallback.isMock = true;
        return fallback;
    }
}

function getMockSCQA({ eventName, eventTime, eventLocation, eventSpeakers }) {
    return {
        headline: "DIRECT THE CODE. SHAPE THE REVOLUTION.",
        description: `Kỷ nguyên gõ từng dòng lệnh đơn lẻ đã khép lại khi làn sóng Generative AI tái định hình toàn bộ nền công nghiệp phần mềm (Situation). Tuy nhiên, đa số sinh viên và người trẻ tài năng vẫn đang bế tắc trong lối mòn lý thuyết, thiếu hụt tư duy điều phối công nghệ và chưa có cơ hội kết nối với các hệ sinh thái doanh nghiệp hàng đầu (Complication). Sự kiện "${eventName}" diễn ra vào ${eventTime} tại ${eventLocation} cùng các chuyên gia (${eventSpeakers}) được thiết kế để mở khóa hoàn toàn tiềm năng của bạn.`,
        benefits: [
            "Làm thế nào để bạn làm chủ AI thay vì bị thay thế? -> Đào tạo tư duy 'Nhạc trưởng AI' (AI Orchestrator): biến ý tưởng kinh doanh thành sản phẩm thực tế chỉ sau một buổi chiều.",
            "Làm sao để tiếp cận các cơ hội nghề nghiệp thực chiến? -> Kết nối trực tiếp vào mạng lưới hỗ trợ tuyển dụng từ Antigravity IDE, Google Gemini, Vercel, Product Hunt và Antler.",
            "Làm cách nào để nhận trọn bộ công cụ tăng tốc cá nhân? -> Nhận cẩm nang độc bản của Three's cùng phiên tư vấn định hướng 1-1 từ các cựu quán quân công nghệ."
        ]
    };
}

// =========================================================================
// HÀM ĐIỀU PHỐI TYPOGRAPHY HERO HEADLINE CHỐNG LỖI FONT TIẾNG VIỆT
// =========================================================================
function updateHeroHeadline(text) {
    const headline = document.getElementById('ai-headline') || document.getElementById('heroHeadline');
    if (!headline || !text) return;

    headline.innerText = text;

    // Kiểm tra xem chuỗi có chứa ký tự tiếng Việt có dấu hay không
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/i.test(text);

    if (hasVietnamese) {
        // Font Roller Coaster là font Latin display không có glyphs tiếng Việt có dấu (gây lỗi chữ chắp vá fallback)
        // Chuyển sang font-sans (Inter Black) chuẩn typography 100% tiếng Việt, tối ưu Dark Tech
        headline.classList.remove('font-roller', 'tracking-wider', 'leading-[0.92]', 'text-[4.5rem]', 'sm:text-[6rem]', 'md:text-[7.5rem]', 'lg:text-[8.5rem]');
        headline.classList.add('font-sans', 'font-black', 'tracking-tight', 'leading-[1.1]', 'text-3xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl');
        headline.style.fontFamily = "'Inter', sans-serif";
        headline.style.letterSpacing = "normal";
    } else {
        // Tiêu đề Tiếng Anh thuần (e.g. "ORCHESTRATE THE FUTURE"): Dùng font Roller Coaster phóng to chuẩn thiết kế
        headline.classList.remove('font-sans', 'font-black', 'tracking-tight', 'leading-[1.1]', 'text-3xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl');
        headline.classList.add('font-roller', 'tracking-wider', 'leading-[0.92]', 'text-[4.5rem]', 'sm:text-[6rem]', 'md:text-[7.5rem]', 'lg:text-[8.5rem]');
        headline.style.fontFamily = "";
        headline.style.letterSpacing = "";
    }
}

/**
 * Đổ dữ liệu AI vào đúng vị trí UI theo Kỷ luật Typography
 */
function updateUIWithContent(content) {
    if (!content) return;

    // 1. HEADLINE: TỰ ĐỘNG THÍCH ỨNG TYPOGRAPHY (ROLLER COASTER CHO ENGLISH, INTER BLACK CHO TIẾNG VIỆT)
    if (content.headline) {
        updateHeroHeadline(content.headline.toUpperCase());
    }

    // 2. DESCRIPTION: TIẾNG VIỆT (DÙNG FONT INTER)
    const descEl = document.getElementById('ai-description') || document.getElementById('heroDescription');
    if (descEl && content.description) {
        descEl.textContent = content.description;
    }

    const missionTextEl = document.getElementById('bentoMissionText');
    if (missionTextEl && content.description) {
        missionTextEl.textContent = content.description;
    }

    // 3. 3 BENEFITS: TIẾNG VIỆT (DÙNG FONT INTER)
    if (Array.isArray(content.benefits)) {
        content.benefits.forEach((benefit, index) => {
            const idx = index + 1;
            const descEl = document.getElementById(`bentoBenefitDesc${idx}`);
            const titleEl = document.getElementById(`bentoBenefitTitle${idx}`);

            if (typeof benefit === 'string') {
                if (descEl) descEl.textContent = benefit;
            } else if (typeof benefit === 'object' && benefit !== null) {
                if (titleEl && benefit.title) titleEl.textContent = benefit.title;
                if (descEl && (benefit.desc || benefit.description)) {
                    descEl.textContent = benefit.desc || benefit.description;
                }
            }
        });
    }

    // 4. NHÃN MINH BẠCH: NẰM Ở ĐÁY CÙNG CỦA FORM, DƯỚI NÚT SUBMIT
    const mockDisclaimer = document.getElementById('mockDataDisclaimer');
    if (mockDisclaimer) {
        if (content.isMock) {
            mockDisclaimer.textContent = 'Bản demo vòng loại - Dữ liệu mô phỏng AI';
            mockDisclaimer.classList.remove('hidden');
        } else {
            mockDisclaimer.classList.add('hidden');
        }
    }

    // Lưu trữ dữ liệu sự kiện vào localStorage
    try {
        localStorage.setItem(APP_CONFIG.STORAGE_EVENT_KEY, JSON.stringify(content));
    } catch (e) {
        console.warn('Không thể lưu event data:', e);
    }
}

// =============================================================================
// 4. ĐỒNG HỒ ĐẾM NGƯỢC (initCountdown) - FONT ROLLER CHO SỐ, INTER CHO NHÃN
// =============================================================================

let countdownTimerId = null;

function initCountdown(targetDateStr) {
    if (countdownTimerId) clearInterval(countdownTimerId);

    const targetTime = new Date(targetDateStr || APP_CONFIG.DEFAULT_EVENT_DATE).getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const regForm = document.getElementById('threesRegistrationForm');
    const regSubmitBtn = document.getElementById('regSubmitBtn');
    const regBtnText = document.getElementById('regBtnText');

    function update() {
        const now = Date.now();
        const diff = targetTime - now;

        // HẾT GIỜ -> VÔ HIỆU HÓA FORM ĐĂNG KÝ
        if (diff <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';

            clearInterval(countdownTimerId);
            countdownTimerId = null;

            if (regForm) {
                regForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
            }
            if (regSubmitBtn) {
                regSubmitBtn.disabled = true;
                regSubmitBtn.classList.add('opacity-40', 'cursor-not-allowed');
            }
            if (regBtnText) {
                regBtnText.textContent = 'SỰ KIỆN ĐÃ ĐÓNG ĐĂNG KÝ';
            }
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    countdownTimerId = setInterval(update, 1000);
}

// =============================================================================
// 5. TOAST NOTIFICATION SYSTEM
// =============================================================================

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col items-end space-y-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center space-x-3 px-5 py-3.5 rounded-2xl liquid-glass border text-sm font-sans shadow-xl transition-all duration-300 transform translate-y-3 opacity-0`;

    if (type === 'success') {
        toast.classList.add('border-cyberLime/40', 'text-white');
        toast.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-cyberLime/20 text-cyberLime flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="font-medium">${message}</span>
        `;
    } else {
        toast.classList.add('border-red-500/40', 'text-white');
        toast.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <span class="font-medium">${message}</span>
        `;
    }

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-3', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 4000);
}

// =============================================================================
// 6. QUẢN LÝ FORM ĐĂNG KÝ (LOCALSTORAGE 'registrations' & BỘ ĐẾM SĂN VÉ)
// =============================================================================

function setupRegistrationForm() {
    const regForm = document.getElementById('threesRegistrationForm');
    const teamNameInput = document.getElementById('reg-team') || document.getElementById('regTeamName');
    const nameInput = document.getElementById('reg-leader') || document.getElementById('regFullName');
    const birthYearSelect = document.getElementById('regBirthYear');
    const emailInput = document.getElementById('reg-email') || document.getElementById('regEmail');
    const phoneInput = document.getElementById('reg-phone') || document.getElementById('regPhone');
    const vibeCoderIdInput = document.getElementById('regVibeCoderId');
    const regionInput = document.getElementById('regRegion');
    const universityInput = document.getElementById('regUniversity');
    const memberCountSelect = document.getElementById('regMemberCount');
    const avatarInput = document.getElementById('teamAvatarInput');
    const avatarLabel = document.getElementById('avatarUploadLabel');
    const avatarDropArea = document.getElementById('avatarDropArea');
    const termsCheckbox = document.getElementById('regTerms');
    const cancelBtn = document.getElementById('regCancelBtn');
    const attendeeCounter = document.getElementById('attendeeCounter');
    const successCard = document.getElementById('regSuccessCard');
    const resetBtn = document.getElementById('resetFormBtn');

    if (!regForm) return;

    // Khởi tạo bộ đếm vé
    function getStoredAttendeeCount() {
        const raw = localStorage.getItem(APP_CONFIG.STORAGE_REGISTRATIONS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const base = 384;
        return base + list.length;
    }

    if (attendeeCounter) {
        attendeeCounter.textContent = getStoredAttendeeCount();
    }

    // Xử lý xem trước tên file Avatar khi chọn
    if (avatarInput && avatarLabel) {
        avatarInput.addEventListener('change', () => {
            if (avatarInput.files && avatarInput.files[0]) {
                const file = avatarInput.files[0];
                avatarLabel.textContent = `Đã chọn: ${file.name}`;
                avatarLabel.classList.add('text-[#CCFF00]');
                if (avatarDropArea) {
                    avatarDropArea.classList.remove('border-white/20');
                    avatarDropArea.classList.add('border-[#CCFF00]', 'bg-[#CCFF00]/5');
                }
            } else {
                avatarLabel.textContent = 'Tải avatar đội';
                avatarLabel.classList.remove('text-[#CCFF00]');
                if (avatarDropArea) {
                    avatarDropArea.classList.add('border-white/20');
                    avatarDropArea.classList.remove('border-[#CCFF00]', 'bg-[#CCFF00]/5');
                }
            }
        });
    }

    // Nút Hủy Bỏ (Cancel)
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            regForm.reset();
            if (avatarLabel) {
                avatarLabel.textContent = 'Tải avatar đội';
                avatarLabel.classList.remove('text-[#CCFF00]');
            }
            if (avatarDropArea) {
                avatarDropArea.classList.add('border-white/20');
                avatarDropArea.classList.remove('border-[#CCFF00]', 'bg-[#CCFF00]/5');
            }
            showToast('Đã làm mới thông tin biểu mẫu.', 'success');
            if (teamNameInput) teamNameInput.focus();
        });
    }

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Validate Tên đội thi
        const teamName = teamNameInput ? teamNameInput.value.trim() : '';
        if (!teamName) {
            showToast('Vui lòng nhập Tên đội thi (tối đa 20 ký tự).', 'error');
            if (teamNameInput) teamNameInput.focus();
            return;
        }
        if (teamName.length > 20) {
            showToast('Tên đội thi không được vượt quá 20 ký tự.', 'error');
            if (teamNameInput) teamNameInput.focus();
            return;
        }

        // 2. Validate Họ và tên trưởng nhóm
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name || name.length < 2) {
            showToast('Vui lòng nhập họ và tên trưởng nhóm (như trên CCCD).', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        // 3. Validate Năm sinh
        const birthYear = birthYearSelect ? birthYearSelect.value : '';
        if (!birthYear) {
            showToast('Vui lòng chọn năm sinh của trưởng nhóm.', 'error');
            if (birthYearSelect) birthYearSelect.focus();
            return;
        }

        // 4. Validate Email
        const email = emailInput ? emailInput.value.trim() : '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        // 5. Validate Số điện thoại
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) {
            showToast('Vui lòng nhập số điện thoại hợp lệ (10 chữ số).', 'error');
            if (phoneInput) phoneInput.focus();
            return;
        }

        // ID Định danh Vibe-Coder (Tùy chọn)
        const vibeCoderId = vibeCoderIdInput ? vibeCoderIdInput.value.trim() : '';

        // 7. Validate Khu vực sinh sống
        const region = regionInput ? regionInput.value.trim() : '';
        if (!region) {
            showToast('Vui lòng nhập khu vực sinh sống hiện tại.', 'error');
            if (regionInput) regionInput.focus();
            return;
        }

        // 8. Trường đại học (tùy chọn)
        const university = universityInput ? universityInput.value.trim() : '';

        // 9. Validate Số lượng thành viên
        const memberCount = memberCountSelect ? memberCountSelect.value : '';
        if (!memberCount) {
            showToast('Vui lòng chọn số lượng thành viên đội thi.', 'error');
            if (memberCountSelect) memberCountSelect.focus();
            return;
        }

        // 10. Avatar Đội
        let avatarName = '';
        if (avatarInput && avatarInput.files && avatarInput.files[0]) {
            avatarName = avatarInput.files[0].name;
        }

        // 11. Validate Cam kết điều khoản
        if (termsCheckbox && !termsCheckbox.checked) {
            showToast('Vui lòng tích chọn đồng ý với điều khoản Ban tổ chức.', 'error');
            termsCheckbox.focus();
            return;
        }

        try {
            // LƯU VÀO MẢNG 'registrations' TRONG LOCALSTORAGE
            const raw = localStorage.getItem(APP_CONFIG.STORAGE_REGISTRATIONS_KEY);
            const registrations = raw ? JSON.parse(raw) : [];

            const isVip = localStorage.getItem(APP_CONFIG.STORAGE_VIP_KEY) === 'true';
            const ticketId = `#THREES-${Math.floor(100000 + Math.random() * 900000)}`;

            const record = {
                teamName: teamName,
                leaderName: name,
                birthYear: birthYear,
                email: email,
                phone: phone,
                vibeCoderId: vibeCoderId,
                region: region,
                university: university,
                memberCount: memberCount,
                avatarName: avatarName,
                ticketCode: ticketId,
                isVip: isVip,
                timestamp: new Date().toISOString()
            };

            registrations.push(record);
            localStorage.setItem(APP_CONFIG.STORAGE_REGISTRATIONS_KEY, JSON.stringify(registrations));

            // Tự động tăng bộ đếm số người săn vé trên giao diện thêm 1
            if (attendeeCounter) {
                const updatedCount = getStoredAttendeeCount();
                attendeeCounter.textContent = updatedCount;
                attendeeCounter.classList.add('scale-125', 'text-white', 'transition-transform');
                setTimeout(() => attendeeCounter.classList.remove('scale-125', 'text-white'), 300);
            }

            // Hiển thị thông báo Toast
            showToast(`Đăng ký thành công! Chào mừng Đội ${teamName} (${name})!`, 'success');

            // Hiển thị Thẻ E-Ticket
            if (successCard) {
                const ticketTeam = document.getElementById('ticketTeamName');
                const ticketName = document.getElementById('ticketAttendeeName');
                const ticketEmail = document.getElementById('ticketAttendeeEmail');
                const ticketMembers = document.getElementById('ticketMemberCount');
                const ticketCode = document.getElementById('ticketCode');

                if (ticketTeam) ticketTeam.textContent = teamName;
                if (ticketName) ticketName.textContent = name;
                if (ticketEmail) ticketEmail.textContent = email;
                if (ticketMembers) ticketMembers.textContent = `${memberCount} thành viên`;
                if (ticketCode) ticketCode.textContent = ticketId;

                regForm.classList.add('hidden');
                successCard.classList.remove('hidden');
                if (window.lucide) window.lucide.createIcons();
                successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

        } catch (err) {
            console.error('Lỗi lưu trữ:', err);
            showToast('Không thể lưu trữ vào trình duyệt.', 'error');
        }
    });

    if (resetBtn && regForm && successCard) {
        resetBtn.addEventListener('click', () => {
            regForm.reset();
            if (avatarLabel) {
                avatarLabel.textContent = 'Tải avatar đội';
                avatarLabel.classList.remove('text-[#CCFF00]');
            }
            if (avatarDropArea) {
                avatarDropArea.classList.add('border-white/20');
                avatarDropArea.classList.remove('border-[#CCFF00]', 'bg-[#CCFF00]/5');
            }
            regForm.classList.remove('hidden');
            successCard.classList.add('hidden');
            if (teamNameInput) teamNameInput.focus();
        });
    }
}

// =============================================================================
// 7. QUẢN TRỊ FORM KHỞI TẠO SỰ KIỆN AI (EVENT CREATOR MODAL)
// =============================================================================

function setupEventCreatorModal() {
    const openBtn = document.getElementById('openAiModalBtn');
    const modal = document.getElementById('aiEventModal');
    const closeBtn = document.getElementById('closeAiModalBtn');
    const form = document.getElementById('aiEventForm');
    const loadingState = document.getElementById('aiLoadingState');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const eventName = document.getElementById('eventName')?.value.trim();
            const eventTime = document.getElementById('eventTime')?.value.trim();
            const eventLocation = document.getElementById('eventLocation')?.value.trim();
            const eventSpeakers = document.getElementById('eventSpeakers')?.value.trim();
            const apiKey = document.getElementById('apiKey')?.value.trim();

            form.classList.add('hidden');
            if (loadingState) loadingState.classList.remove('hidden');

            try {
                const content = await generateEventContent({
                    eventName,
                    eventTime,
                    eventLocation,
                    eventSpeakers,
                    apiKey
                });

                updateUIWithContent(content);

                if (modal) modal.classList.add('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                showToast(
                    content.isMock 
                        ? 'Đã cập nhật nội dung từ Mock Data (Luật Bảng B)!' 
                        : 'Đã cập nhật nội dung từ Gemini AI thành công!',
                    'success'
                );

            } catch (err) {
                console.error(err);
                showToast('Có lỗi xảy ra khi tạo sự kiện.', 'error');
            } finally {
                form.classList.remove('hidden');
                if (loadingState) loadingState.classList.add('hidden');
            }
        });
    }
}

// =============================================================================
// 8. ACCORDION AGENDA (INTERACTIVE TOGGLE)
// =============================================================================

function setupAccordion() {
    const triggers = document.querySelectorAll('.agenda-accordion-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            const icon = trigger.querySelector('.accordion-icon');
            const isOpen = !content.classList.contains('hidden');

            document.querySelectorAll('.agenda-accordion-content').forEach(c => c.classList.add('hidden'));
            document.querySelectorAll('.accordion-icon').forEach(ic => ic.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                content.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// =============================================================================
// 9. QUẢN LÝ THANH ĐIỀU HƯỚNG ZALO AI CUSTOM (SCROLLSPY & ACTIVE TABS)
// =============================================================================

// =============================================================================
// 9. QUẢN LÝ THANH ĐIỀU HƯỚNG ZALO AI CUSTOM (SCROLLSPY, TABS & OVERLAY NAVIGATION)
// =============================================================================

function setNavActiveTab(targetId) {
    const navItems = document.querySelectorAll('#zaloNavLinks li');
    if (!navItems.length) return;

    navItems.forEach(li => {
        const link = li.querySelector('a');
        if (!link) return;
        const text = link.textContent.trim().toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();

        let isActive = false;
        if (targetId === 'home' && (text === 'home' || href === '#home')) isActive = true;
        else if (targetId === 'challenges' && (text === 'challenges' || href === '#challenges')) isActive = true;
        else if (targetId === 'advisors' && (text === 'advisors' || href === '#advisors')) isActive = true;
        else if (targetId === 'timeline' && (text === 'timeline' || href === '#timeline')) isActive = true;
        else if ((targetId === 'portal-view' || targetId === 'portal-arena') && text === 'portal') isActive = true;
        else if ((targetId === 'portal' || targetId === 'register') && (text === 'register' || href === '#portal' || href === '#register')) isActive = true;
        else if (targetId === 'faq' && (text === 'faq' || href === '#faq')) isActive = true;
        else if (targetId === 'regulations' && text === 'regulations') isActive = true;

        if (isActive) {
            li.className = 'h-full flex items-center border-b-2 border-[#CCFF00] transition-colors';
            link.className = 'text-[#F5F5F7] font-bold text-xs sm:text-sm tracking-wide';
        } else {
            li.className = 'h-full flex items-center border-b-2 border-transparent hover:border-[#CCFF00]/50 transition-colors';
            link.className = 'text-gray-400 hover:text-[#F5F5F7] font-medium text-xs sm:text-sm tracking-wide';
        }
    });
}

function closeAllOverlays(instant = false) {
    if (typeof closeWorkspace === 'function') closeWorkspace(instant);
    if (typeof closePortal === 'function') closePortal(instant);
    if (typeof closeRegulations === 'function') closeRegulations(instant);

    // Đóng các modal nổi nếu đang mở
    const loginM = document.getElementById('loginModal');
    if (loginM && !loginM.classList.contains('hidden')) {
        loginM.classList.add('opacity-0', 'hidden');
        loginM.classList.remove('flex');
    }
    const egg = document.getElementById('easterEggModal');
    if (egg && !egg.classList.contains('hidden')) {
        egg.classList.add('opacity-0', 'hidden');
        egg.classList.remove('flex');
    }

    document.body.style.overflow = 'auto';
}

function navigateToSection(targetId, event) {
    if (event) {
        event.preventDefault();
    }

    // 1. Đóng toàn bộ các view/overlay toàn màn hình lập tức để không cản trở cuộn trang
    closeAllOverlays(true);

    // 2. Cập nhật hash URL
    try {
        if (window.history && window.history.pushState) {
            window.history.pushState(null, null, `#${targetId}`);
        } else {
            window.location.hash = targetId;
        }
    } catch (e) {}

    // 3. Highlight tab tương ứng trên Header
    setNavActiveTab(targetId);

    // 4. Cuộn mượt đến vị trí mục tiêu
    if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            const yOffset = -70; // Trừ chiều cao header (64px) + margin
            const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
}

function setupZaloNavbar() {
    const navItems = document.querySelectorAll('#zaloNavLinks li');
    if (!navItems.length) return;

    const sectionIds = ['home', 'challenges', 'benefits', 'advisors', 'timeline', 'portal', 'news', 'faq'];

    function getSections() {
        return sectionIds
            .map(id => ({ id, el: document.getElementById(id) }))
            .filter(item => item.el !== null)
            .sort((a, b) => a.el.offsetTop - b.el.offsetTop);
    }

    const sections = getSections();

    // Lắng nghe sự kiện scroll để kích hoạt ScrollSpy theo vị trí trang
    let isTicking = false;
    window.addEventListener('scroll', () => {
        // Nếu bất kỳ overlay toàn màn hình nào đang mở, tạm dừng ScrollSpy
        const ws = document.getElementById('workspace-view');
        const reg = document.getElementById('regulations-view');
        const portal = document.getElementById('portal-view');
        if ((ws && !ws.classList.contains('hidden')) || 
            (reg && !reg.classList.contains('hidden')) || 
            (portal && !portal.classList.contains('hidden'))) {
            return;
        }

        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const scrollPos = window.scrollY + 180;
                let currentId = 'home';

                for (let i = sections.length - 1; i >= 0; i--) {
                    if (sections[i].el.offsetTop <= scrollPos) {
                        currentId = sections[i].id;
                        break;
                    }
                }

                setNavActiveTab(currentId);
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });
}

// =============================================================================
// 10. KHỞI CHẠY TỔNG THỂ KHI DOM READY
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Canvas Particles (OffscreenCanvas / Fallback)
    initCanvasParticles();

    // 2. VIP Easter Egg ("vip" sequence listener)
    initVipEasterEgg();

    // 3. Countdown Timer Realtime
    initCountdown(APP_CONFIG.DEFAULT_EVENT_DATE);

    // 4. Registration Form & localStorage
    setupRegistrationForm();

    // 5. AI Event Creator Modal
    setupEventCreatorModal();

    // 6. Accordion Agenda
    setupAccordion();

    // 7. Zalo AI Custom Navbar (ScrollSpy)
    setupZaloNavbar();

    // Khôi phục nội dung sự kiện đã lưu trước đó nếu có
    try {
        const savedEvent = localStorage.getItem(APP_CONFIG.STORAGE_EVENT_KEY);
        if (savedEvent) {
            updateUIWithContent(JSON.parse(savedEvent));
        }
    } catch (e) {
        console.warn('Không thể đọc cached event:', e);
    }

    console.log("🚀 [Three's Vibe-Tech Academy] Single Page Application đã sẵn sàng.");
});

// =============================================================================
// 11. HỆ THỐNG PORTAL TOÀN MÀN HÌNH (COMPETITION ARENA VIEW & MULTI-TAB)
// =============================================================================

function openPortal(challengeId = 'insightminer') {
    if (typeof closeWorkspace === 'function') closeWorkspace(true);
    if (typeof closeRegulations === 'function') closeRegulations(true);

    const mainEl = document.querySelector('main');
    const portalEl = document.getElementById('portal-view');
    if (!portalEl) return;

    if (mainEl) mainEl.classList.add('hidden');
    portalEl.classList.remove('hidden');
    portalEl.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    // Cập nhật Tab Portal trên thanh Header chính
    setNavActiveTab('portal-view');

    switchPortalChallenge(challengeId);
    if (typeof switchTab === 'function') {
        switchTab('overview');
    }
}

function closePortal(instant = false) {
    const portalEl = document.getElementById('portal-view');
    const mainEl = document.querySelector('main');
    if (!portalEl) return;

    portalEl.classList.add('hidden');
    if (mainEl) mainEl.classList.remove('hidden');
    document.body.style.overflow = 'auto';

    if (!instant) {
        setNavActiveTab('home');
    }
}

function switchPortalChallenge(challengeId) {
    const btnInsight = document.getElementById('btnSwitchInsight');
    const btnSalebot = document.getElementById('btnSwitchSalebot');
    const headlineEng = document.getElementById('portalHeadlineEng');
    const headlineVie = document.getElementById('portalHeadlineVie');
    const subline = document.getElementById('portalSubline');
    const iconImg = document.getElementById('portalIconImg');
    const badge = document.getElementById('portalTrackBadge');
    const glow = document.getElementById('portalAmbientGlow');
    const contentInsight = document.getElementById('portal-content-insight');
    const contentSalebot = document.getElementById('portal-content-salebot');

    if (challengeId === 'salebot') {
        // Active SaleBot Button & Style
        if (btnSalebot) {
            btnSalebot.className = 'px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer bg-[#00E5FF] text-[#09090B] shadow-md shadow-[#00E5FF]/20';
        }
        if (btnInsight) {
            btnInsight.className = 'px-5 py-2 rounded-full font-sans font-semibold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10';
        }
        if (headlineEng) headlineEng.textContent = 'SALEBOT';
        if (headlineVie) {
            headlineVie.textContent = 'TỰ ĐỘNG HÓA CHỐT ĐƠN ĐA KÊNH';
            headlineVie.className = 'font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-wide mt-2 text-[#00E5FF]';
        }
        if (subline) subline.textContent = 'Thiết lập Agentic AI nhận diện ý định mua hàng, tra cứu tồn kho và tư vấn chéo (Cross-sell/Up-sell) để chốt đơn ngay trong luồng chat.';
        if (iconImg) iconImg.src = 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=400&auto=format&fit=crop';
        if (badge) {
            badge.className = 'px-3 py-1 bg-[#00E5FF]/20 text-[#00E5FF] text-xs rounded-full border border-[#00E5FF]/30 font-mono';
            badge.textContent = 'Track B: Commerce Agent';
        }
        if (glow) {
            glow.className = 'absolute inset-0 bg-gradient-to-tr from-[#00E5FF]/20 via-[#B026FF]/15 to-transparent blur-[90px] rounded-full scale-125 pointer-events-none transition-all duration-500';
        }
        if (contentInsight) contentInsight.classList.add('hidden');
        if (contentSalebot) contentSalebot.classList.remove('hidden');
    } else {
        // Active InsightMiner Button & Style
        if (btnInsight) {
            btnInsight.className = 'px-5 py-2 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer bg-[#CCFF00] text-[#09090B] shadow-md shadow-[#CCFF00]/20';
        }
        if (btnSalebot) {
            btnSalebot.className = 'px-5 py-2 rounded-full font-sans font-semibold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer bg-transparent border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/10';
        }
        if (headlineEng) headlineEng.textContent = 'INSIGHTMINER';
        if (headlineVie) {
            headlineVie.textContent = 'TRỢ LÝ THẤU HIỂU THỊ TRƯỜNG';
            headlineVie.className = 'font-sans text-xl sm:text-2xl lg:text-3xl font-extrabold uppercase tracking-wide mt-2 text-[#CCFF00]';
        }
        if (subline) subline.textContent = 'Hệ thống tự động đọc hiểu, phân loại cảm xúc (Sentiment Analysis) và bóc tách insight dữ liệu F&B.';
        if (iconImg) iconImg.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop';
        if (badge) {
            badge.className = 'px-3 py-1 bg-[#CCFF00]/20 text-[#CCFF00] text-xs rounded-full border border-[#CCFF00]/30 font-mono';
            badge.textContent = 'Track B: Economic';
        }
        if (glow) {
            glow.className = 'absolute inset-0 bg-gradient-to-tr from-[#CCFF00]/15 via-[#00E5FF]/10 to-transparent blur-[90px] rounded-full scale-125 pointer-events-none transition-all duration-500';
        }
        if (contentSalebot) contentSalebot.classList.add('hidden');
        if (contentInsight) contentInsight.classList.remove('hidden');
    }
}

// Hàm chuyển đổi 3 Tabs: Overview, Public Leaderboard, Public Submissions
function switchTab(tabName) {
    const tabKeys = ['overview', 'leaderboard', 'submissions'];
    tabKeys.forEach(key => {
        const contentEl = document.getElementById(`tab-${key}`);
        const btnEl = document.getElementById(`tabBtn-${key}`);
        if (contentEl) {
            if (key === tabName) {
                contentEl.classList.remove('hidden');
            } else {
                contentEl.classList.add('hidden');
            }
        }
        if (btnEl) {
            if (key === tabName) {
                btnEl.className = 'text-white border-b-2 border-[#CCFF00] pb-1 font-bold cursor-pointer transition-all';
            } else {
                btnEl.className = 'text-gray-400 hover:text-white pb-1 transition-all cursor-pointer border-b-2 border-transparent';
            }
        }
    });
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Hàm hỗ trợ mở Modal chung (Hỗ trợ Modal Thể lệ, Modal sự kiện, Portal)
function openModal(modalId) {
    if (modalId === 'modal-salebot' || modalId === 'salebot') {
        openPortal('salebot');
        return;
    }
    if (modalId === 'modal-insight' || modalId === 'modal-insightminer' || modalId === 'insightminer') {
        openPortal('insightminer');
        return;
    }
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('hidden');
    void modal.offsetWidth; // Trigger reflow để transition mượt mà
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
    document.body.style.overflow = 'hidden';
}

// Hàm đóng Modal chung
function closeModal(modalId) {
    if (!modalId || modalId === 'portal' || modalId === 'portal-view') {
        closePortal();
        return;
    }
    const modal = document.getElementById(modalId);
    if (!modal) {
        closePortal();
        return;
    }
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        const portal = document.getElementById('portal-view');
        const isPortalOpen = portal && !portal.classList.contains('hidden');
        if (!isPortalOpen) {
            document.body.style.overflow = 'auto';
        }
    }, 300);
}

function openChallengeModal() {
    openPortal('insightminer');
}

function closeChallengeModal() {
    closePortal();
}

// Hàm điều khiển Giao diện Regulations Toàn màn hình
function openRegulations() {
    if (typeof closeWorkspace === 'function') closeWorkspace(true);
    if (typeof closePortal === 'function') closePortal(true);

    const regView = document.getElementById('regulations-view');
    if (!regView) return;
    regView.classList.remove('hidden');
    void regView.offsetWidth; // Trigger reflow để transition mượt mà
    setTimeout(() => {
        regView.classList.remove('opacity-0');
        regView.classList.add('opacity-100');
    }, 10);
    regView.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    // Highlight tab Regulations trên thanh Header
    setNavActiveTab('regulations');
}

function closeRegulations(instant = false) {
    const regView = document.getElementById('regulations-view');
    if (!regView) return;
    document.body.style.overflow = 'auto';

    if (instant) {
        regView.classList.remove('opacity-100');
        regView.classList.add('opacity-0', 'hidden');
    } else {
        regView.classList.remove('opacity-100');
        regView.classList.add('opacity-0');
        setTimeout(() => {
            regView.classList.add('hidden');
        }, 250);
        setNavActiveTab('home');
    }
}

// Hàm chuyển đổi ngôn ngữ Thể lệ: Tiếng Việt (vi) / English (en)
function switchRegLang(lang) {
    const btnVi = document.getElementById('btnRegLangVi');
    const btnEn = document.getElementById('btnRegLangEn');
    const contentVi = document.getElementById('regContentVi');
    const contentEn = document.getElementById('regContentEn');
    const sidebar = document.getElementById('regSidebarLinks');

    if (lang === 'en') {
        if (btnEn) {
            btnEn.className = 'group flex items-center justify-center gap-3 px-7 py-3 rounded-2xl border border-[#B026FF]/40 bg-[#B026FF] text-white font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg shadow-[#B026FF]/20 hover:shadow-[0_0_25px_rgba(176,38,255,0.4)] cursor-pointer';
        }
        if (btnVi) {
            btnVi.className = 'group flex items-center justify-center gap-3 px-7 py-3 rounded-2xl border border-[#CCFF00]/40 bg-[#1A2235]/60 backdrop-blur-md text-[#CCFF00] hover:bg-[#CCFF00] hover:text-[#09090B] font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] cursor-pointer';
        }
        if (contentVi) contentVi.classList.add('hidden');
        if (contentEn) contentEn.classList.remove('hidden');

        // Cập nhật mục lục Sidebar sang tiếng Anh
        if (sidebar) {
            const enItems = [
                { id: '#reg-en-1', text: '1. General Info' },
                { id: '#reg-en-2', text: '2. Eligibility' },
                { id: '#reg-en-3', text: '3. Timeline' },
                { id: '#reg-en-4', text: '4. Challenges & Data' },
                { id: '#reg-en-5', text: '5. Submissions' },
                { id: '#reg-en-6', text: '6. Evaluation' },
                { id: '#reg-en-7', text: '7. Prizes' },
                { id: '#reg-en-8', text: '8. Integrity' },
                { id: '#reg-en-9', text: '9. Intellectual Property' },
                { id: '#reg-en-10', text: '10. Confidentiality' },
                { id: '#reg-en-11', text: '11. Amendments' },
                { id: '#reg-en-12', text: '12. Support' }
            ];
            const links = sidebar.querySelectorAll('a');
            links.forEach((a, i) => {
                if (enItems[i]) {
                    a.setAttribute('href', enItems[i].id);
                    a.textContent = enItems[i].text;
                }
            });
        }
    } else {
        if (btnVi) {
            btnVi.className = 'group flex items-center justify-center gap-3 px-7 py-3 rounded-2xl border border-[#CCFF00]/40 bg-[#CCFF00] text-[#09090B] font-sans font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg shadow-[#CCFF00]/20 hover:shadow-[0_0_25px_rgba(204,255,0,0.4)] cursor-pointer';
        }
        if (btnEn) {
            btnEn.className = 'group flex items-center justify-center gap-3 px-7 py-3 rounded-2xl border border-[#B026FF]/40 bg-[#1A2235]/60 backdrop-blur-md text-[#B026FF] hover:bg-[#B026FF] hover:text-white font-sans font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] cursor-pointer';
        }
        if (contentEn) contentEn.classList.add('hidden');
        if (contentVi) contentVi.classList.remove('hidden');

        // Cập nhật mục lục Sidebar sang tiếng Việt
        if (sidebar) {
            const viItems = [
                { id: '#reg-1', text: '1. Thông tin chung' },
                { id: '#reg-2', text: '2. Điều kiện tham gia' },
                { id: '#reg-3', text: '3. Hạng mục & Thời gian' },
                { id: '#reg-4', text: '4. Dữ liệu & Tài nguyên' },
                { id: '#reg-5', text: '5. Bài dự thi & Nộp bài' },
                { id: '#reg-6', text: '6. Tiêu chí đánh giá' },
                { id: '#reg-7', text: '7. Giải thưởng' },
                { id: '#reg-8', text: '8. Tính chính trực' },
                { id: '#reg-9', text: '9. Quyền sở hữu trí tuệ' },
                { id: '#reg-10', text: '10. Bảo mật thông tin' },
                { id: '#reg-11', text: '11. Khiếu nại & Tranh chấp' },
                { id: '#reg-12', text: '12. Kênh hỗ trợ' }
            ];
            const links = sidebar.querySelectorAll('a');
            links.forEach((a, i) => {
                if (viItems[i]) {
                    a.setAttribute('href', viItems[i].id);
                    a.textContent = viItems[i].text;
                }
            });
        }
    }
}

// Khởi tạo tương tác Sidebar cho Regulations View
document.addEventListener('DOMContentLoaded', () => {
    const regSidebar = document.getElementById('regSidebarLinks');
    if (regSidebar) {
        const links = regSidebar.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                links.forEach(l => {
                    l.className = 'text-gray-400 hover:text-white py-2 transition-all';
                });
                link.className = 'text-[#CCFF00] py-2 relative before:absolute before:left-[-18px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-[#CCFF00] before:rounded-r-md transition-all font-bold';
            });
        });
    }
});

// Lắng nghe phím ESC để đóng Modal Thể Lệ hoặc Portal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const loginM = document.getElementById('loginModal');
        if (loginM && !loginM.classList.contains('hidden')) {
            closeLoginModal();
            return;
        }
        const wsView = document.getElementById('workspace-view');
        if (wsView && !wsView.classList.contains('hidden')) {
            closeWorkspace();
            return;
        }
        const egg = document.getElementById('easterEggModal');
        if (egg && !egg.classList.contains('hidden')) {
            closeEasterEgg();
            return;
        }
        const regView = document.getElementById('regulations-view');
        if (regView && !regView.classList.contains('hidden')) {
            closeRegulations();
            return;
        }
        const portal = document.getElementById('portal-view');
        if (portal && !portal.classList.contains('hidden')) {
            closePortal();
            return;
        }
        ['vipModal', 'aiEventModal', 'eventModal'].forEach(id => {
            const m = document.getElementById(id);
            if (m && !m.classList.contains('hidden')) {
                m.classList.add('hidden');
            }
        });
    }
});

// =========================================================================
// EASTER EGG: BẮT CHUỖI PHÍM V-I-B-E (TERMINAL MẬT THƯ HACKER)
// =========================================================================
const secretCode = ['v', 'i', 'b', 'e'];
let keySequence = [];

document.addEventListener('keydown', (e) => {
    // Không bắt phím khi người dùng đang nhập liệu trong ô input / textarea
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        return;
    }

    // Chuyển phím bấm thành chữ thường và lưu vào mảng
    if (e.key && e.key.length === 1) {
        keySequence.push(e.key.toLowerCase());
        // Giữ độ dài mảng bằng với độ dài mã bí mật
        if (keySequence.length > secretCode.length) {
            keySequence.shift();
        }
        // Kiểm tra xem chuỗi phím có khớp với "vibe" không
        if (keySequence.join('') === secretCode.join('')) {
            triggerEasterEgg();
            keySequence = []; // Reset sau khi kích hoạt
        }
    }
});

function triggerEasterEgg() {
    const modal = document.getElementById('easterEggModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
}

function closeEasterEgg() {
    const modal = document.getElementById('easterEggModal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 400);
}

function closeEasterEggAndRegister() {
    closeEasterEgg();
    navigateToSection('portal');
}

// =========================================================================
// QUẢN LÝ ĐĂNG NHẬP & HỆ THỐNG THÍ SINH (WORKSPACE)
// =========================================================================
function openLoginModal() {
    const m = document.getElementById('loginModal');
    if (!m) return;
    m.classList.remove('hidden');
    m.classList.add('flex');
    setTimeout(() => m.classList.remove('opacity-0'), 10);
}

function closeLoginModal() {
    const m = document.getElementById('loginModal');
    if (!m) return;
    m.classList.add('opacity-0');
    setTimeout(() => {
        m.classList.add('hidden');
        m.classList.remove('flex');
    }, 300);
}

function executeLogin() {
    // Giả lập xử lý đăng nhập
    closeLoginModal();
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    if (guestMenu) guestMenu.classList.add('hidden');
    if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.classList.add('flex');
    }
    if (typeof showToast === 'function') {
        showToast('Đăng nhập thành công! Chào mừng Vibe Creators.', 'success');
    }
    try {
        localStorage.setItem('vibe_user_logged_in', 'true');
    } catch (e) {}

    // Tự động mở Workspace ngay khi đăng nhập thành công
    openWorkspace();
}

function executeLogout() {
    closeWorkspace(false);
    const guestMenu = document.getElementById('guest-menu');
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.add('hidden');
        userMenu.classList.remove('flex');
    }
    if (guestMenu) {
        guestMenu.classList.remove('hidden');
    }
    if (typeof showToast === 'function') {
        showToast('Đã đăng xuất khỏi hệ thống thí sinh.', 'info');
    }
    try {
        localStorage.removeItem('vibe_user_logged_in');
        localStorage.removeItem('vibe_coder_profile');
    } catch (e) {}
}

function openWorkspace() {
    // Đóng portal và regulations nếu đang mở (lập tức)
    if (typeof closePortal === 'function') closePortal(true);
    if (typeof closeRegulations === 'function') closeRegulations(true);

    const w = document.getElementById('workspace-view');
    if (!w) return;
    w.classList.remove('hidden');
    void w.offsetWidth;
    setTimeout(() => {
        w.classList.remove('opacity-0');
        w.classList.add('opacity-100');
    }, 10);
    w.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    // Ẩn AI Panel khi vào Workspace
    const aiPanel = document.getElementById('ai-control-panel');
    if (aiPanel) aiPanel.classList.add('hidden');

    // Bỏ highlight các tab trang chủ trên header vì đang ở Workspace
    setNavActiveTab('workspace');
}

function closeWorkspace(instant = false) {
    const w = document.getElementById('workspace-view');
    if (!w) return;
    document.body.style.overflow = 'auto';

    // Hiện lại AI Panel
    const aiPanel = document.getElementById('ai-control-panel');
    if (aiPanel) aiPanel.classList.remove('hidden');

    if (instant) {
        w.classList.remove('opacity-100');
        w.classList.add('opacity-0', 'hidden');
    } else {
        w.classList.remove('opacity-100');
        w.classList.add('opacity-0');
        setTimeout(() => {
            w.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
        setNavActiveTab('home');
    }
}

function switchWsTab(tabId, btnElement) {
    // 1. Ẩn tất cả các tab nội dung
    document.querySelectorAll('.ws-content-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // 2. Hiển thị tab được chọn
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // 3. Reset giao diện tất cả các nút trên sidebar về trạng thái màu xám không active
    document.querySelectorAll('.ws-tab-btn').forEach(btn => {
        btn.className = 'ws-tab-btn block w-full text-left py-2.5 px-4 text-gray-400 hover:text-white hover:bg-white/5 rounded transition cursor-pointer';
    });

    // 4. Thêm class Active (Màu Cyber Lime) cho nút vừa được click
    if (btnElement) {
        btnElement.className = 'ws-tab-btn block w-full text-left py-2.5 px-4 bg-[#CCFF00]/10 text-[#CCFF00] border-l-2 border-[#CCFF00] rounded-r cursor-pointer';
    }
}

// Tự động khôi phục trạng thái đăng nhập khi load trang
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (localStorage.getItem('vibe_user_logged_in') === 'true') {
            const guestMenu = document.getElementById('guest-menu');
            const userMenu = document.getElementById('user-menu');
            if (guestMenu) guestMenu.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                userMenu.classList.add('flex');
            }
        }
    } catch (e) {}

    // Khởi tạo kiểm tra API key input trong Workspace
    const apiKeyInput = document.getElementById('apiKeyInput');
    const copyApiBtn = document.getElementById('copyApiBtn');
    if (apiKeyInput && copyApiBtn) {
        apiKeyInput.addEventListener('input', () => {
            if (apiKeyInput.value.trim() === '') {
                copyApiBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                copyApiBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});

// 2. QUẢN LÝ ĐỘI THI: COPY MÃ MỜI
function copyInviteCode() {
    navigator.clipboard.writeText("TEAM-F4NZVN");
    showToast("Đã sao chép mã mời: TEAM-F4NZVN");
}

// 3. TRẠM THỬ THÁCH: COPY API KEY
function copyApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput && apiKeyInput.value.trim() !== '') {
        navigator.clipboard.writeText(apiKeyInput.value);
        showToast("Đã sao chép API Key!");
    }
}

// 4. CỔNG NỘP BÀI: ĐIỀU KIỆN CAM KẾT VÀ LUỒNG SUBMIT
function toggleSubmitBtn() {
    const checkbox = document.getElementById('submit-checkbox');
    const btn = document.getElementById('submit-btn');
    if (!checkbox || !btn) return;
    if (checkbox.checked) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

function executeSubmission() {
    const btn = document.getElementById('submit-btn');
    if (!btn) return;
    // Trạng thái Loading
    btn.innerHTML = `<svg class="w-5 h-5 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`;
    btn.classList.add('pointer-events-none');

    // Giả lập delay 2 giây chấm AI
    setTimeout(() => {
        // Phục hồi nút
        btn.innerHTML = 'NỘP BÀI THI';
        btn.classList.remove('pointer-events-none');
        const checkbox = document.getElementById('submit-checkbox');
        if (checkbox) checkbox.checked = false;
        toggleSubmitBtn();

        // Thông báo thành công
        showToast("Nộp bài thành công! Đang chuyển hướng...");

        // Chuyển sang Tab Lịch sử (Sidebar btn có id='btn-tab-history')
        const historyBtn = document.getElementById('btn-tab-history');
        if (historyBtn && typeof switchWsTab === 'function') {
            switchWsTab('ws-history', historyBtn);
        }

        // Chèn dòng dữ liệu mới vào Bảng Lịch sử
        const tbody = document.getElementById('history-table-body');
        if (tbody) {
            const newRow = document.createElement('tr');
            newRow.className = 'hover:bg-white/5 transition animate-fade-in bg-[#CCFF00]/5';
            newRow.innerHTML = `
                <td class="px-6 py-4 font-mono text-[#CCFF00]">#SUB-1046</td>
                <td class="px-6 py-4 text-white">Vừa xong</td>
                <td class="px-6 py-4"><span class="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs border border-gray-600 flex items-center gap-2 w-max"><svg class="w-3 h-3 animate-spin text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Processing</span></td>
                <td class="px-6 py-4 font-bold text-gray-500">--</td>
                <td class="px-6 py-4 text-gray-500">--</td>
                <td class="px-6 py-4 text-gray-500">--</td>
                <td class="px-6 py-4 font-bold text-gray-500">--</td>
            `;
            tbody.insertBefore(newRow, tbody.firstChild);
        }
    }, 2000);
}

// 5. TÀI NGUYÊN & HỖ TRỢ: GỬI TICKET
function sendTicket() {
    const title = document.getElementById('ticketTitle');
    const desc = document.getElementById('ticketDesc');
    
    if (!title || !desc || title.value.trim() === '' || desc.value.trim() === '') {
        showToast("Vui lòng điền đầy đủ thông tin hỗ trợ!", "error");
        return;
    }
    
    showToast("Yêu cầu đã được gửi đến BTC!");
    desc.value = '';
}

// =========================================================================
// 0. HÀM TẠO LANDING PAGE (TỪ SETUP FORM - FORM NHẬP LIỆU THÔNG MINH)
// =========================================================================
function generateLandingPage() {
    const eventNameInput = document.getElementById('setup-eventName');
    const eventDateInput = document.getElementById('setup-date');
    const eventLocationInput = document.getElementById('setup-location');
    
    const eventName = eventNameInput ? eventNameInput.value.trim() : '';
    const eventDate = eventDateInput ? eventDateInput.value : '';
    const eventLocation = eventLocationInput ? eventLocationInput.value.trim() : '';
    
    // Xác thực theo kịch bản TC02
    if(!eventName) { showToast("Vui lòng nhập Tên sự kiện", "error"); return; }
    if(!eventDate || new Date(eventDate) <= new Date()) { showToast("Thời gian sự kiện phải ở tương lai", "error"); return; }
    if(!eventLocation) { showToast("Vui lòng nhập Địa điểm", "error"); return; }
    
    const btn = document.getElementById('btn-generate-lp');
    const originalBtnText = btn ? btn.innerHTML : '';
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
        document.body.style.overflow = 'auto'; // Mở khóa cuộn trang

        // Lưu cấu hình sự kiện đã nhập
        const speaker = document.getElementById('setup-speaker')?.value.trim() || '';
        const offer = document.getElementById('setup-offer')?.value.trim() || '';
        try {
            localStorage.setItem('vibe_event_config', JSON.stringify({ eventName, eventDate, eventLocation, speaker, offer }));
        } catch(e) {}

        // Tự động kích hoạt hàm Mock AI đã viết từ trước để thay thế text Landing Page
        if(typeof mockAiGenerate === 'function') {
            mockAiGenerate();
        }
        
        showToast("Đã tạo Landing Page thành công!");
    }, 1500);
}

// =========================================================================
// 1. LOGIC MOCK AI GENERATE (CONTROL PANEL DÀNH CHO GIÁM KHẢO)
// =========================================================================
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

// =========================================================================
// 2. LOGIC REAL-TIME COUNTER QUA LOCALSTORAGE & ĐỒNG BỘ ĐA TAB
// =========================================================================
let registeredUsers = [];
try {
    registeredUsers = JSON.parse(localStorage.getItem('vibe_users')) || [];
} catch (e) {
    registeredUsers = [];
}

function updateCounter() {
    // Mặc định gốc là 384 + số lượng user đã đăng ký mới
    const currentCount = 384 + registeredUsers.length;
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

// LẮNG NGHE ĐỒNG BỘ ĐA TAB (Đáp ứng kịch bản TC03)
window.addEventListener('storage', function(e) {
    if (e.key === 'vibe_users') {
        // Cập nhật lại mảng dữ liệu từ tab khác
        try {
            registeredUsers = JSON.parse(e.newValue) || [];
        } catch(err) {
            registeredUsers = [];
        }
        // Chạy lại hàm updateCounter (đã có từ trước) để số nhảy tức thì không cần F5
        if(typeof updateCounter === 'function') updateCounter();
    }
});

// =========================================================================
// 3. LOGIC RESET LOCALSTORAGE (TẠO TRANG MỚI & KHÔI PHỤC SETUP FORM)
// =========================================================================
function resetLandingPage() {
    if(confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu đăng ký và làm lại từ đầu?")) {
        localStorage.clear(); 
        sessionStorage.clear();
        showToast("Đã reset trang. Tải lại trang để áp dụng...", "error");
        setTimeout(() => window.location.reload(true), 1000); // Reload hard
    }
}

// =========================================================================
// HÀM XỬ LÝ ĐĂNG KÝ VÀ LƯU LOCALSTORAGE VIBE USER (STRICT VALIDATION)
// =========================================================================
function executeRegistration() {
    // Lấy các giá trị từ form (Hỗ trợ linh hoạt các ID chuẩn hóa)
    const teamName = (document.getElementById('reg-teamname') || document.getElementById('reg-team') || document.getElementById('regTeamName'))?.value.trim();
    const leaderName = (document.getElementById('reg-leadername') || document.getElementById('reg-leader') || document.getElementById('regFullName'))?.value.trim();
    const email = (document.getElementById('reg-email') || document.getElementById('regEmail'))?.value.trim();
    const phone = (document.getElementById('reg-phone') || document.getElementById('regPhone'))?.value.trim();

    // 1. Kiểm tra rỗng
    if (!teamName || !leaderName || !email || !phone) {
        showToast("Vui lòng điền đầy đủ các trường bắt buộc!", "error");
        return;
    }

    // 2. Validate Email (Định dạng chuẩn)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Email không đúng định dạng!", "error");
        return;
    }

    // 3. Validate Số điện thoại (Chuẩn số ĐT Việt Nam: 10 số, đầu 03,05,07,08,09)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        showToast("Số điện thoại không hợp lệ!", "error");
        return;
    }

    // Nếu qua hết các vòng kiểm tra -> Lưu LocalStorage và cấp Team Code
    const teamCode = "TEAM-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const userData = { 
        teamName, 
        leaderName, 
        email, 
        phone, 
        teamCode,
        status: "ACCEPTED",
        registeredAt: new Date().toISOString()
    };

    // Lưu vào danh sách vibe_users và cập nhật counter
    const newUser = {
        team: teamName,
        leader: leaderName,
        email: email,
        phone: phone,
        code: teamCode,
        createdAt: new Date().toISOString()
    };
    registeredUsers.push(newUser);

    try {
        localStorage.setItem('vibe_users', JSON.stringify(registeredUsers));
        localStorage.setItem('vibe_user', JSON.stringify(userData));
        localStorage.setItem('vibe_coder_profile', JSON.stringify(userData));
        localStorage.setItem('vibe_user_logged_in', 'true');
    } catch (e) {
        console.warn('LocalStorage error:', e);
    }

    // Cập nhật ngay bộ đếm trên UI
    updateCounter();

    showToast("Đăng ký thành công! Mã đội của bạn là: " + teamCode);
    
    // Đổi giao diện Navbar (Giả lập đã login)
    document.getElementById('guest-menu')?.classList.add('hidden');
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.classList.add('flex');
    }

    // Cập nhật tên email trên Sidebar của Workspace (nếu có)
    const sidebarEmail = document.querySelector('#workspace-view .text-sm.text-gray-300.truncate');
    if (sidebarEmail) sidebarEmail.innerText = email;

    // Cập nhật mã mời trong Workspace tab Quản lý đội thi
    const teamCodeBadge = document.querySelector('#ws-team .font-mono.tracking-wider');
    if (teamCodeBadge) teamCodeBadge.innerText = teamCode;

    // Tự động mở Workspace sau 1.5 giây
    setTimeout(() => {
        openWorkspace();
    }, 1500);
}

// =========================================================================
// HÀM MỜI THÀNH VIÊN GHÉP ĐỘI QUA EMAIL (WORKSPACE)
// =========================================================================
function simulateTeamInvite() {
    const emailInput = document.getElementById('invite-email-input');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showToast("Vui lòng nhập email hợp lệ để mời!", "error");
        return;
    }

    // Giả lập gửi email thành công
    showToast(`Đã gửi email lời mời đến ${email}`);
    emailInput.value = ''; // Reset input

    // Thêm vào danh sách Pending (Chờ xác nhận)
    const pendingList = document.getElementById('pending-members-list');
    if (pendingList) {
        const newPending = document.createElement('div');
        newPending.className = 'flex items-center justify-between p-3 bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-lg animate-fade-in';
        newPending.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 font-bold">?</div>
                <div>
                    <p class="text-white text-sm font-medium">${email}</p>
                </div>
            </div>
            <span class="text-yellow-400 text-xs flex items-center gap-1 border border-yellow-400/30 px-2 py-1 rounded bg-yellow-400/10">
                <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> 
                Đã gửi Email (Chờ Accept)
            </span>
        `;
        pendingList.appendChild(newPending);
    }
}

// HÀM KHỞI CHẠY KHI TẢI TRANG (SETUP SCREEN, COUNTER & TRẠNG THÁI LOGIN)
document.addEventListener('DOMContentLoaded', () => {
    const setupScreen = document.getElementById('setup-screen');
    const isCreated = localStorage.getItem('vibe_lp_created');
    
    if(setupScreen) {
        if (isCreated !== 'true') {
            // Nếu chưa tạo, bắt buộc hiện Form và khóa cuộn trang
            setupScreen.classList.remove('hidden', 'opacity-0');
            document.body.style.overflow = 'hidden';
        } else {
            // Đã tạo thì ẩn đi
            setupScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Chạy counter nếu có
    if(typeof updateCounter === 'function') updateCounter();

    // Chuẩn hóa typography tiêu đề Hero ngay khi tải trang (tránh lỗi font nếu text tiếng Việt)
    const currentHeadline = document.getElementById('ai-headline') || document.getElementById('heroHeadline');
    if (currentHeadline) {
        updateHeroHeadline(currentHeadline.innerText.trim());
    }

    try {
        const savedUser = localStorage.getItem('vibe_user') || localStorage.getItem('vibe_coder_profile');
        if (savedUser) {
            // Nếu đã có data trong LocalStorage -> Đổi Navbar sang trạng thái đã đăng nhập
            const guestMenu = document.getElementById('guest-menu');
            const userMenu = document.getElementById('user-menu');
            if (guestMenu) guestMenu.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                userMenu.classList.add('flex');
            }
            
            // Cập nhật email / thông tin đội vào giao diện nếu cần
            const userData = JSON.parse(savedUser);
            const sidebarEmail = document.querySelector('#workspace-view .text-sm.text-gray-300.truncate');
            if (sidebarEmail && userData.email) sidebarEmail.innerText = userData.email;
            const teamCodeBadge = document.querySelector('#ws-team .font-mono.tracking-wider');
            if (teamCodeBadge && userData.teamCode) teamCodeBadge.innerText = userData.teamCode;
        }
    } catch (e) {
        console.warn('Lỗi đọc saved profile:', e);
    }
});

// Expose ra global để gọi từ inline onclick và kiểm thử
if (typeof window !== 'undefined') {
    window.setNavActiveTab = setNavActiveTab;
    window.closeAllOverlays = closeAllOverlays;
    window.navigateToSection = navigateToSection;
    window.generateLandingPage = generateLandingPage;
    window.generateEventContent = generateEventContent;
    window.updateUIWithContent = updateUIWithContent;
    window.updateHeroHeadline = updateHeroHeadline;
    window.initCountdown = initCountdown;
    window.showToast = showToast;
    window.openPortal = openPortal;
    window.closePortal = closePortal;
    window.switchPortalChallenge = switchPortalChallenge;
    window.switchTab = switchTab;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openChallengeModal = openChallengeModal;
    window.closeChallengeModal = closeChallengeModal;
    window.openRegulations = openRegulations;
    window.closeRegulations = closeRegulations;
    window.switchRegLang = switchRegLang;
    window.triggerEasterEgg = triggerEasterEgg;
    window.closeEasterEgg = closeEasterEgg;
    window.closeEasterEggAndRegister = closeEasterEggAndRegister;
    window.openLoginModal = openLoginModal;
    window.closeLoginModal = closeLoginModal;
    window.executeLogin = executeLogin;
    window.executeLogout = executeLogout;
    window.openWorkspace = openWorkspace;
    window.closeWorkspace = closeWorkspace;
    window.switchWsTab = switchWsTab;
    window.copyInviteCode = copyInviteCode;
    window.copyApiKey = copyApiKey;
    window.toggleSubmitBtn = toggleSubmitBtn;
    window.executeSubmission = executeSubmission;
    window.sendTicket = sendTicket;
    window.executeRegistration = executeRegistration;
    window.simulateTeamInvite = simulateTeamInvite;
    window.mockAiGenerate = mockAiGenerate;
    window.resetLandingPage = resetLandingPage;
    window.updateCounter = updateCounter;
}

/**
 * MAIN.JS - Three's Brand Experience & Micro-Interactions (High Visibility Engine)
 * Brand: Three's
 * Colors: Obsidian Black (#09090B), Cyber Lime (#CCFF00), Ice White (#F5F5F7)
 * Fonts: Roller Coaster (Numbers/English), lfneofolia (Logo/Headline/Easter Egg), Inter (Body)
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. VI TƯƠNG TÁC MẠNG LƯỚI HẠT ĐA LUỒNG & MAGNETIC CTA (120Hz WORKER)
    // =========================================================================
    const canvas = document.getElementById('matrixCanvas');
    const heroCtaBtn = document.getElementById('heroCtaBtn');
    let worker = null;

    // Helper tính toán tọa độ CTA so với Viewport
    function getCtaCoordinates() {
        if (!heroCtaBtn) return { x: -9999, y: -9999 };
        const rect = heroCtaBtn.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    let lastMousePos = { x: -9999, y: -9999 };

    function sendMouseToWorker(x, y) {
        lastMousePos = { x, y };
        const cta = getCtaCoordinates();
        const distToCta = Math.hypot(x - cta.x, y - cta.y);
        const isNearCta = distToCta < 250; // Bán kính kích hoạt hút nam châm: 250px

        // Hiệu ứng tương tác trực tiếp trên nút CTA (Glow & Breathing pulse)
        if (heroCtaBtn) {
            if (isNearCta) {
                heroCtaBtn.classList.add('shadow-[0_0_55px_#CCFF00]', 'scale-[1.04]', 'ring-4', 'ring-cyberLime/60');
            } else {
                heroCtaBtn.classList.remove('shadow-[0_0_55px_#CCFF00]', 'scale-[1.04]', 'ring-4', 'ring-cyberLime/60');
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

    if (canvas && 'transferControlToOffscreen' in canvas && typeof Worker !== 'undefined') {
        try {
            const offscreen = canvas.transferControlToOffscreen();
            worker = new Worker('js/particle-worker.js');

            worker.postMessage({
                type: 'INIT',
                canvas: offscreen,
                width: window.innerWidth,
                height: window.innerHeight
            }, [offscreen]);

            // Resize listener
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (worker) {
                        worker.postMessage({
                            type: 'RESIZE',
                            width: window.innerWidth,
                            height: window.innerHeight
                        });
                    }
                }, 100);
            });

            // Lắng nghe chuột
            window.addEventListener('pointermove', (e) => {
                sendMouseToWorker(e.clientX, e.clientY);
            }, { passive: true });

            // Lắng nghe cuộn trang để cập nhật lại tọa độ nút CTA
            window.addEventListener('scroll', () => {
                if (lastMousePos.x > 0) {
                    sendMouseToWorker(lastMousePos.x, lastMousePos.y);
                }
            }, { passive: true });

            document.addEventListener('mouseleave', () => {
                if (worker) worker.postMessage({ type: 'MOUSE_LEAVE' });
            });

            console.log('⚡ [Three\'s Engine] Web Worker + OffscreenCanvas đã kích hoạt mượt mà ở 120Hz.');
        } catch (err) {
            console.warn('OffscreenCanvas Worker fallback to Main Thread:', err);
            initMainThreadFallback(canvas, heroCtaBtn);
        }
    } else if (canvas) {
        initMainThreadFallback(canvas, heroCtaBtn);
    }

    // Fallback Canvas siêu rõ nét trên Main Thread nếu browser không hỗ trợ Worker/OffscreenCanvas
    function initMainThreadFallback(cv, ctaEl) {
        const ctx = cv.getContext('2d');
        let w = (cv.width = window.innerWidth);
        let h = (cv.height = window.innerHeight);

        window.addEventListener('resize', () => {
            w = cv.width = window.innerWidth;
            h = cv.height = window.innerHeight;
        });

        const particles = [];
        const count = Math.min(130, Math.floor((w * h) / 11000));
        let mouse = { x: -9999, y: -9999 };
        let isNearCta = false;
        let ctaTarget = { x: 0, y: 0 };
        let vortex = 0;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2.2 + 2.0,
                color: '#CCFF00',
                alpha: Math.random() * 0.4 + 0.6
            });
        }

        window.addEventListener('pointermove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (ctaEl) {
                const rect = ctaEl.getBoundingClientRect();
                ctaTarget.x = rect.left + rect.width / 2;
                ctaTarget.y = rect.top + rect.height / 2;
                const d = Math.hypot(e.clientX - ctaTarget.x, e.clientY - ctaTarget.y);
                isNearCta = d < 250;
            }
        }, { passive: true });

        function animateFallback() {
            ctx.clearRect(0, 0, w, h);

            // Magnetic Spotlight Rực Rỡ
            if (mouse.x > 0 && mouse.y > 0) {
                const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 360);
                grad.addColorStop(0, 'rgba(204, 255, 0, 0.22)');
                grad.addColorStop(0.3, 'rgba(204, 255, 0, 0.08)');
                grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);

                // Cyber cursor ring
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
                ctx.strokeStyle = '#CCFF00';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            vortex += 0.04;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (isNearCta && ctaTarget.x > 0) {
                    const dx = ctaTarget.x - p.x;
                    const dy = ctaTarget.y - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 550) {
                        const pull = (550 - dist) / 550;
                        p.x += (dx / (dist || 1)) * pull * 6.0;
                        p.y += (dy / (dist || 1)) * pull * 6.0;

                        if (dist < 300) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(ctaTarget.x, ctaTarget.y);
                            ctx.strokeStyle = `rgba(204, 255, 0, ${0.5 * (1 - dist / 300)})`;
                            ctx.lineWidth = 1.2;
                            ctx.stroke();
                        }
                    }
                } else if (mouse.x > 0) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 160) {
                        p.x += (dx / (dist || 1)) * 4.0;
                        p.y += (dy / (dist || 1)) * 4.0;
                    }
                }

                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#CCFF00';
                ctx.fill();
                ctx.restore();
            }
            requestAnimationFrame(animateFallback);
        }
        animateFallback();
    }

    // =========================================================================
    // 2. CHUYỂN ĐỔI KIỂU CHỮ TIÊU ĐỀ (GIẢI QUYẾT TRIỆT ĐỂ LỖI FONT TIẾNG VIỆT)
    // =========================================================================
    const heroHeadline = document.getElementById('heroHeadline');
    const fontModeLfneoBtn = document.getElementById('fontModeLfneo');
    const fontModeEnglishBtn = document.getElementById('fontModeEnglish');
    const fontModeRollerVnBtn = document.getElementById('fontModeRollerVn');

    if (fontModeLfneoBtn && heroHeadline) {
        fontModeLfneoBtn.addEventListener('click', () => {
            heroHeadline.className = "font-lfneo font-normal text-4xl sm:text-6xl lg:text-7xl text-cyberLime tracking-wide leading-[1.1] drop-shadow-[0_0_35px_rgba(204,255,0,0.35)] transition-all";
            heroHeadline.innerHTML = "BỨT PHÁ GIỚI HẠN: KHAI PHÓNG BẢN LĨNH CÙNG THREE'S";
            highlightActiveFontBtn(fontModeLfneoBtn);
        });
    }

    if (fontModeEnglishBtn && heroHeadline) {
        fontModeEnglishBtn.addEventListener('click', () => {
            heroHeadline.className = "font-roller font-normal text-5xl sm:text-7xl lg:text-8xl text-cyberLime tracking-wider leading-[1.05] drop-shadow-[0_0_35px_rgba(204,255,0,0.35)] transition-all";
            heroHeadline.innerHTML = "BREAK THE LIMITS // THREE'S 2026";
            highlightActiveFontBtn(fontModeEnglishBtn);
        });
    }

    if (fontModeRollerVnBtn && heroHeadline) {
        fontModeRollerVnBtn.addEventListener('click', () => {
            heroHeadline.className = "font-roller font-normal text-5xl sm:text-7xl lg:text-8xl text-cyberLime tracking-wider leading-[1.05] drop-shadow-[0_0_35px_rgba(204,255,0,0.35)] transition-all";
            heroHeadline.innerHTML = "BỨT PHÁ GIỚI HẠN: KHAI PHÓNG BẢN LĨNH CÙNG THREE'S";
            highlightActiveFontBtn(fontModeRollerVnBtn);
        });
    }

    function highlightActiveFontBtn(activeBtn) {
        [fontModeLfneoBtn, fontModeEnglishBtn, fontModeRollerVnBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-cyberLime', 'text-obsidian', 'border-cyberLime');
                btn.classList.add('bg-white/5', 'text-gray-300', 'border-white/10');
            }
        });
        if (activeBtn) {
            activeBtn.classList.remove('bg-white/5', 'text-gray-300', 'border-white/10');
            activeBtn.classList.add('bg-cyberLime', 'text-obsidian', 'border-cyberLime');
        }
    }

    // =========================================================================
    // 3. ĐỒNG HỒ ĐẾM NGƯỢC ĐẾN GIỜ G (Font Roller Coaster)
    // =========================================================================
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    let targetDate = new Date('2026-11-28T08:30:00+07:00');
    if (isNaN(targetDate.getTime()) || targetDate <= new Date()) {
        targetDate = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000);
    }

    function updateCountdown() {
        const diff = targetDate.getTime() - Date.now();
        if (diff <= 0) return;

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // =========================================================================
    // 4. ACCORDION AGENDA TRONG BENTO GRID
    // =========================================================================
    const accordionTriggers = document.querySelectorAll('.agenda-accordion-trigger');
    accordionTriggers.forEach(trigger => {
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

    // =========================================================================
    // 5. FORM ĐĂNG KÝ (INLINE) & REALTIME ATTENDEE COUNTER
    // Lưu ý: Logic submit và lưu localStorage đã được quản lý tập trung tại script.js
    // =========================================================================
    const registrationForm = document.getElementById('threesRegistrationForm');
    const inputFullName = document.getElementById('regFullName');
    const inputEmail = document.getElementById('regEmail');
    const attendeeCounterEl = document.getElementById('attendeeCounter');
    const successCard = document.getElementById('regSuccessCard');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (resetFormBtn && registrationForm && successCard) {
        resetFormBtn.addEventListener('click', () => {
            registrationForm.reset();
            registrationForm.classList.remove('hidden');
            successCard.classList.add('hidden');
            if (inputFullName) inputFullName.focus();
        });
    }

    function showSuccessTicket(ticket) {
        if (!successCard) return;
        document.getElementById('ticketCode').textContent = `#${ticket.id}`;
        document.getElementById('ticketAttendeeName').textContent = ticket.fullName;
        document.getElementById('ticketAttendeeEmail').textContent = ticket.email;
        document.getElementById('ticketBadgeType').textContent = ticket.type;

        registrationForm.classList.add('hidden');
        successCard.classList.remove('hidden');

        if (window.lucide) lucide.createIcons();
        successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            registrationForm.reset();
            registrationForm.classList.remove('hidden');
            successCard.classList.add('hidden');
            inputFullName.focus();
        });
    }

    // =========================================================================
    // 6. EASTER EGG "VIP" & PHÁO GIẤY CONFETTI CYBER LIME & TRẮNG
    // =========================================================================
    let keyBuffer = [];
    let keyTimer = null;
    const vipModal = document.getElementById('vipModal');
    const flashOverlay = document.getElementById('flashOverlay');
    const closeVipBtn = document.getElementById('closeVipBtn');
    const applyVipBtn = document.getElementById('applyVipBtn');
    const vipNoticePill = document.getElementById('vipNoticePill');

    if (localStorage.getItem('threes_vip_unlocked') === 'true') {
        if (vipNoticePill) vipNoticePill.classList.remove('hidden');
    }

    window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            return;
        }

        clearTimeout(keyTimer);
        keyTimer = setTimeout(() => {
            keyBuffer = [];
        }, 1000);

        const char = e.key.toLowerCase();
        if (char.length === 1) {
            keyBuffer.push(char);
            if (keyBuffer.length > 3) keyBuffer.shift();

            if (['v', 'i', 'p'].every((v, i) => v === keyBuffer[i])) {
                keyBuffer = [];
                triggerVipEasterEgg();
            }
        }
    });

    function triggerVipEasterEgg() {
        if (flashOverlay) {
            flashOverlay.classList.remove('hidden');
            flashOverlay.style.opacity = '1';
            setTimeout(() => {
                flashOverlay.style.opacity = '0';
                setTimeout(() => flashOverlay.classList.add('hidden'), 1000);
            }, 60);
        }

        launchCyberLimeConfetti();
        localStorage.setItem('threes_vip_unlocked', 'true');
        localStorage.setItem('threes_discount', '0Đ');

        if (vipModal) {
            vipModal.classList.remove('hidden');
            if (window.lucide) lucide.createIcons();
        }

        if (vipNoticePill) vipNoticePill.classList.remove('hidden');
    }

    if (closeVipBtn && vipModal) {
        closeVipBtn.addEventListener('click', () => vipModal.classList.add('hidden'));
    }

    if (applyVipBtn && vipModal) {
        applyVipBtn.addEventListener('click', () => {
            vipModal.classList.add('hidden');
            if (vipNoticePill) vipNoticePill.classList.remove('hidden');
            const regSection = document.getElementById('register');
            if (regSection) {
                regSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (inputFullName) setTimeout(() => inputFullName.focus(), 600);
            }
        });
    }

    function launchCyberLimeConfetti() {
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

        const CONFETTI_COLORS = ['#CCFF00', '#FFFFFF', 'rgba(204, 255, 0, 0.85)', '#DFFF4F'];
        const particles = [];
        const count = 170;

        for (let i = 0; i < count; i++) {
            const fromLeft = i % 2 === 0;
            particles.push({
                x: fromLeft ? w * 0.15 : w * 0.85,
                y: h + 15,
                vx: fromLeft ? (Math.random() * 8 + 4) : -(Math.random() * 8 + 4),
                vy: -(Math.random() * 16 + 14),
                size: Math.random() * 8 + 5,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 16,
                drag: 0.982,
                gravity: 0.36,
                opacity: 1
            });
        }

        let animId;
        function loop() {
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

                if (p.vy > 0) p.opacity -= 0.0075;

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
                animId = requestAnimationFrame(loop);
            } else {
                cancelAnimationFrame(animId);
                if (c.parentNode) c.parentNode.removeChild(c);
            }
        }
        loop();
    }

    // =========================================================================
    // 7. MODAL AI EVENT PROMPT ENGINE (UI TOGGLE)
    // Lưu ý: Logic SCQA, gọi Gemini API & Mock Data được thực thi tại script.js
    // =========================================================================
    const openAiModalBtn = document.getElementById('openAiModalBtn');
    const aiModal = document.getElementById('aiEventModal');
    const closeAiModalBtn = document.getElementById('closeAiModalBtn');

    if (openAiModalBtn && aiModal) {
        openAiModalBtn.addEventListener('click', () => {
            aiModal.classList.remove('hidden');
        });
    }

    if (closeAiModalBtn && aiModal) {
        closeAiModalBtn.addEventListener('click', () => {
            aiModal.classList.add('hidden');
        });
    }
});

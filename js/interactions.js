/**
 * INTERACTIONS.JS - Advanced Micro-Interactions
 * 1. Mạng lưới hạt đa luồng (OffscreenCanvas + Web Worker + Spatial Hash Grid)
 * 2. Cơ chế Easter Egg "VIP" & Pháo giấy Confetti (#00FFCC & #F86302)
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. MẠNG LƯỚI HẠT ĐA LUỒNG (MULTITHREADED PARTICLE MATRIX)
    // =========================================================================
    (function initMultithreadedMatrix() {
        const canvas = document.getElementById('matrixCanvas');
        if (!canvas) return;

        // Kiểm tra hỗ trợ OffscreenCanvas & Web Worker
        const isOffscreenSupported = 'transferControlToOffscreen' in canvas && typeof Worker !== 'undefined';

        if (isOffscreenSupported) {
            try {
                // Tách quyền điều khiển Canvas sang OffscreenCanvas
                const offscreen = canvas.transferControlToOffscreen();
                const worker = new Worker('js/particle-worker.js');

                // Gửi thông điệp khởi tạo cho Worker
                worker.postMessage({
                    type: 'INIT',
                    canvas: offscreen,
                    width: window.innerWidth,
                    height: window.innerHeight
                }, [offscreen]);

                // Lắng nghe resize cửa sổ (Throttle với requestAnimationFrame)
                let resizePending = false;
                window.addEventListener('resize', () => {
                    if (!resizePending) {
                        resizePending = true;
                        requestAnimationFrame(() => {
                            worker.postMessage({
                                type: 'RESIZE',
                                width: window.innerWidth,
                                height: window.innerHeight
                            });
                            resizePending = false;
                        });
                    }
                });

                // Lắng nghe tọa độ chuột và gửi sang Worker
                window.addEventListener('pointermove', (e) => {
                    worker.postMessage({
                        type: 'MOUSE_MOVE',
                        x: e.clientX,
                        y: e.clientY
                    });
                }, { passive: true });

                // Khi chuột rời khỏi màn hình
                document.addEventListener('mouseleave', () => {
                    worker.postMessage({ type: 'MOUSE_LEAVE' });
                });

                console.log('⚡ [Particle Matrix] Đã kích hoạt thành công trên Web Worker (OffscreenCanvas) + Spatial Hash Grid.');
                return;
            } catch (err) {
                console.warn('OffscreenCanvas Worker gặp trở ngại (có thể do môi trường sandbox/CORS), tự động chạy Fallback trên Main Thread:', err);
            }
        }

        // Fallback: Nếu trình duyệt cũ hoặc chạy file:/// bị chặn Worker, chạy Spatial Hash Grid trên Main Thread
        runMainThreadSpatialGrid(canvas);
    })();

    // Fallback Spatial Hash Grid trên Main Thread
    function runMainThreadSpatialGrid(canvas) {
        const ctx = canvas.getContext('2d');
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        const BRAND_COLORS = ['#00FFCC', '#F86302', '#38BDF8', '#FFFFFF'];
        const particles = [];
        const count = Math.min(80, Math.floor((w * h) / 18000));
        let mouse = { x: -9999, y: -9999, radius: 150 };

        window.addEventListener('pointermove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                radius: Math.random() * 1.8 + 0.8,
                color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
                baseAlpha: Math.random() * 0.5 + 0.3
            });
        }

        // Spatial Hash Grid local
        const cellSize = 120;
        function animate() {
            ctx.clearRect(0, 0, w, h);
            const grid = new Map();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const key = `${Math.floor(p.x / cellSize)}_${Math.floor(p.y / cellSize)}`;
                if (!grid.has(key)) grid.set(key, []);
                grid.get(key).push(i);
            }

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                const cCol = Math.floor(p1.x / cellSize);
                const cRow = Math.floor(p1.y / cellSize);

                for (let c = cCol - 1; c <= cCol + 1; c++) {
                    for (let r = cRow - 1; r <= cRow + 1; r++) {
                        const cell = grid.get(`${c}_${r}`);
                        if (cell) {
                            for (let k = 0; k < cell.length; k++) {
                                const j = cell[k];
                                if (i < j) {
                                    const p2 = particles[j];
                                    const dx = p1.x - p2.x;
                                    const dy = p1.y - p2.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    if (dist < 120) {
                                        ctx.beginPath();
                                        ctx.moveTo(p1.x, p1.y);
                                        ctx.lineTo(p2.x, p2.y);
                                        ctx.strokeStyle = `rgba(0, 255, 204, ${(1 - dist / 120) * 0.2})`;
                                        ctx.lineWidth = 0.6;
                                        ctx.stroke();
                                    }
                                }
                            }
                        }
                    }
                }
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    p.x += (dx / dist) * force * 2.5;
                    p.y += (dy / dist) * force * 2.5;
                }

                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.baseAlpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

    // =========================================================================
    // 2. CƠ CHẾ EASTER EGG "VIP" & LỢI ÍCH ẨN
    // =========================================================================
    (function initVipEasterEgg() {
        let keyBuffer = [];
        let keyTimer = null;
        const TARGET_SEQUENCE = ['v', 'i', 'p'];

        const vipModal = document.getElementById('vipEasterEggModal');
        const closeVipModalBtn = document.getElementById('closeVipModalBtn');
        const copyPromoBtn = document.getElementById('copyPromoBtn');
        const applyVipToFormBtn = document.getElementById('applyVipToFormBtn');
        const vipCodeText = document.getElementById('vipCodeText');
        const PROMO_CODE = 'VIP-SECRET-100';

        // Lắng nghe sự kiện phím trên window
        window.addEventListener('keydown', (e) => {
            // Không can thiệp nếu người dùng đang nhập vào ô input hoặc textarea
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                return;
            }

            // Sử dụng setTimeout để tự động xóa mảng tạm nếu ngừng thao tác quá 1 giây (Tránh rò rỉ bộ nhớ)
            clearTimeout(keyTimer);
            keyTimer = setTimeout(() => {
                keyBuffer = [];
            }, 1000);

            // Chỉ lấy các ký tự chữ cái thông thường
            const key = e.key.toLowerCase();
            if (key.length === 1) {
                keyBuffer.push(key);
                if (keyBuffer.length > TARGET_SEQUENCE.length) {
                    keyBuffer.shift();
                }

                // Kiểm tra khớp chính xác chuỗi ['v', 'i', 'p']
                const isMatch = TARGET_SEQUENCE.every((val, index) => val === keyBuffer[index]);
                if (isMatch) {
                    keyBuffer = [];
                    triggerVipPerk();
                }
            }
        });

        // Hàm kích hoạt Easter Egg
        function triggerVipPerk() {
            console.log('🎉 [Easter Egg Activated] Bẻ khóa thành công mã VIP!');

            // 1. Kích hoạt hiệu ứng pháo giấy Confetti (#00FFCC & #F86302)
            launchBrandConfetti();

            // 2. Lưu trạng thái đã nhận mã giảm giá vào localStorage
            localStorage.setItem('vibe_vip_unlocked', 'true');
            localStorage.setItem('vibe_discount_code', PROMO_CODE);

            // 3. Hiển thị ngay Modal ẩn (Liquid Glass Design)
            if (vipModal) {
                vipModal.classList.remove('hidden');
                if (window.lucide) {
                    lucide.createIcons();
                }
            }

            // 4. Áp dụng ngay quyền lợi VIP vào Form Đăng Ký
            applyVipPerkToUI();
        }

        // Đóng Modal VIP
        if (closeVipModalBtn && vipModal) {
            closeVipModalBtn.addEventListener('click', () => {
                vipModal.classList.add('hidden');
            });
        }

        if (vipModal) {
            vipModal.addEventListener('click', (e) => {
                if (e.target === vipModal) {
                    vipModal.classList.add('hidden');
                }
            });
        }

        // Nút Sao Chép Mã
        if (copyPromoBtn && vipCodeText) {
            copyPromoBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(PROMO_CODE).then(() => {
                    const originalText = copyPromoBtn.innerHTML;
                    copyPromoBtn.innerHTML = '<span class="text-neonCyan font-bold">ĐÃ SAO CHÉP!</span>';
                    setTimeout(() => {
                        copyPromoBtn.innerHTML = originalText;
                    }, 2000);
                });
            });
        }

        // Nút Áp dụng ngay vào Form & Cuộn xuống
        if (applyVipToFormBtn && vipModal) {
            applyVipToFormBtn.addEventListener('click', () => {
                vipModal.classList.add('hidden');
                applyVipPerkToUI();

                const registerSection = document.getElementById('register');
                if (registerSection) {
                    registerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const fullNameInput = document.getElementById('fullName');
                    if (fullNameInput) {
                        setTimeout(() => fullNameInput.focus(), 600);
                    }
                }
            });
        }

        // Cập nhật giao diện Form khi VIP được kích hoạt
        function applyVipPerkToUI() {
            const vipFormBadge = document.getElementById('vipFormBadge');
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');

            if (vipFormBadge) {
                vipFormBadge.classList.remove('hidden');
            }
            if (btnText) {
                btnText.textContent = 'XÁC NHẬN GIỮ VÉ VVIP ALL-ACCESS (MIỄN PHÍ)';
            }
            if (submitBtn) {
                submitBtn.classList.remove('btn-neon-cta');
                submitBtn.classList.add('bg-gradient-to-r', 'from-neonCyan', 'via-emerald-400', 'to-galaxyOrange', 'text-deepNavy', 'shadow-[0_0_35px_rgba(0,255,204,0.7)]');
            }
        }

        // Kiểm tra xem trước đó đã bẻ khóa VIP chưa (Persistence)
        if (localStorage.getItem('vibe_vip_unlocked') === 'true') {
            applyVipPerkToUI();
        }

        // =====================================================================
        // HIỆU ỨNG PHÁO GIẤY (CONFETTI) BẮN TỪ DƯỚI LÊN VỚI 2 MÀU THƯƠNG HIỆU
        // =====================================================================
        function launchBrandConfetti() {
            const confettiCanvas = document.createElement('canvas');
            confettiCanvas.id = 'confettiCanvas';
            confettiCanvas.style.position = 'fixed';
            confettiCanvas.style.inset = '0';
            confettiCanvas.style.width = '100vw';
            confettiCanvas.style.height = '100vh';
            confettiCanvas.style.pointerEvents = 'none';
            confettiCanvas.style.zIndex = '99999';
            document.body.appendChild(confettiCanvas);

            const ctx = confettiCanvas.getContext('2d');
            let w = (confettiCanvas.width = window.innerWidth);
            let h = (confettiCanvas.height = window.innerHeight);

            // 2 mã màu thương hiệu chủ đạo: Neon Cyan (#00FFCC) và Galaxy Orange (#F86302)
            const BRAND_CONFETTI_COLORS = [
                '#00FFCC', // Neon Cyan
                '#F86302', // Galaxy Orange
                '#FFFFFF', // Ice White
                '#00E5B8', // Emerald Cyan
                '#FF7A1A'  // Vivid Orange
            ];

            const particles = [];
            const count = 150;

            // Bắn từ 2 góc dưới màn hình lên cao
            for (let i = 0; i < count; i++) {
                const fromLeft = i % 2 === 0;
                particles.push({
                    x: fromLeft ? w * 0.15 : w * 0.85,
                    y: h + 15,
                    vx: fromLeft ? (Math.random() * 8 + 4) : -(Math.random() * 8 + 4),
                    vy: -(Math.random() * 16 + 14), // Vận tốc bắn thẳng lên cao
                    size: Math.random() * 9 + 5,
                    color: BRAND_CONFETTI_COLORS[Math.floor(Math.random() * BRAND_CONFETTI_COLORS.length)],
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 18,
                    drag: 0.982,
                    gravity: 0.36,
                    opacity: 1
                });
            }

            let animationId;
            function updateConfetti() {
                ctx.clearRect(0, 0, w, h);
                let aliveCount = 0;

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.vx *= p.drag;
                    p.vy *= p.drag;
                    p.vy += p.gravity;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += p.rotSpeed;

                    // Giảm dần độ trong suốt khi bắt đầu rơi xuống
                    if (p.vy > 0) {
                        p.opacity -= 0.007;
                    }

                    if (p.opacity > 0 && p.y < h + 30) {
                        aliveCount++;
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate((p.rotation * Math.PI) / 180);
                        ctx.globalAlpha = Math.max(0, p.opacity);
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
                        ctx.restore();
                    }
                }

                if (aliveCount > 0) {
                    animationId = requestAnimationFrame(updateConfetti);
                } else {
                    cancelAnimationFrame(animationId);
                    if (confettiCanvas.parentNode) {
                        confettiCanvas.parentNode.removeChild(confettiCanvas);
                    }
                }
            }
            updateConfetti();
        }
    })();
});


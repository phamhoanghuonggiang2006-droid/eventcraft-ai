/**
 * PARTICLE-WORKER.JS - Three's Ultra-High-Visibility 120Hz Background Engine
 * Công nghệ: OffscreenCanvas + Web Worker + Spatial Hash Grid
 * Tối ưu hoá hiển thị:
 * 1. Magnetic Spotlight: Quầng sáng Cyber Lime (#CCFF00) đa tầng cực rõ, bán kính 360px bám theo chuột
 * 2. Con trỏ năng lượng Cyber Ring: Vòng tròn phát quang tại vị trí chuột
 * 3. Magnetic Particles: 140 hạt phát sáng Cyber Lime & Ice White (2.5px - 4.5px) kèm glow shadow
 * 4. Magnetic CTA Attraction: Khi chuột < 250px quanh nút CTA, các hạt trong bán kính 600px
 *    bị hút mạnh về tâm nút bấm, tạo dòng xoáy năng lượng (vortex) và phóng tia laser Cyber Lime!
 */

class SpatialHashGrid {
    constructor(width, height, cellSize = 130) {
        this.cellSize = cellSize;
        this.grid = new Map();
        this.width = width;
        this.height = height;
    }

    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
    }

    clear() {
        this.grid.clear();
    }

    insert(particle, index) {
        const col = Math.floor(particle.x / this.cellSize);
        const row = Math.floor(particle.y / this.cellSize);
        const key = `${col}_${row}`;
        let cell = this.grid.get(key);
        if (!cell) {
            cell = [];
            this.grid.set(key, cell);
        }
        cell.push(index);
    }

    getNearby(particle) {
        const indices = [];
        const col = Math.floor(particle.x / this.cellSize);
        const row = Math.floor(particle.y / this.cellSize);

        for (let c = col - 1; c <= col + 1; c++) {
            for (let r = row - 1; r <= row + 1; r++) {
                const cell = this.grid.get(`${c}_${r}`);
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        indices.push(cell[i]);
                    }
                }
            }
        }
        return indices;
    }
}

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let particles = [];
let spatialGrid = null;

// Trạng thái chuột & CTA Magnetic Target
let mouse = { x: -9999, y: -9999, radius: 180 };
let ctaTarget = { x: -9999, y: -9999, isNear: false, dist: 9999 };
let vortexAngle = 0;

// Bảng màu Cyber Lime Three's rực rỡ
const COLORS = [
    '#CCFF00', // Cyber Lime chủ đạo
    '#DFFF4F', // Lime sáng
    '#FFFFFF', // Ice White
    '#00FFCC'  // Neon Cyan phụ
];

function initParticles() {
    particles = [];
    // Tăng mật độ hạt từ 50 lên 130-160 hạt để tạo hiệu ứng mạng lưới dày đặc, rõ nét
    const count = Math.min(160, Math.max(90, Math.floor((width * height) / 10000)));

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 2.2 + 2.0, // Kích thước lớn hơn rõ rệt (2.0px - 4.2px)
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.4 + 0.6,   // Độ đậm từ 0.6 - 1.0 (không bị mờ tàng hình)
            baseSpeed: Math.random() * 0.4 + 0.5
        });
    }

    spatialGrid = new SpatialHashGrid(width, height, 130);
}

function render() {
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const hasMouse = (mouse.x > 0 && mouse.y > 0 && mouse.x < width && mouse.y < height);

    // -------------------------------------------------------------
    // 1. VI TƯƠNG TÁC 1: MAGNETIC SPOTLIGHT RỰC RỠ BÁM THEO CHUỘT
    // -------------------------------------------------------------
    if (hasMouse) {
        // Quầng sáng đa tầng Cyber Lime (#CCFF00) bán kính lớn 380px
        const spotlightRadius = ctaTarget.isNear ? 460 : 360;
        const spotGrad = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, spotlightRadius
        );
        // Tăng độ đậm để quầng sáng nhìn rõ mồn một trên nền đen Obsidian (#09090B)
        spotGrad.addColorStop(0, ctaTarget.isNear ? 'rgba(204, 255, 0, 0.28)' : 'rgba(204, 255, 0, 0.18)');
        spotGrad.addColorStop(0.25, ctaTarget.isNear ? 'rgba(204, 255, 0, 0.12)' : 'rgba(204, 255, 0, 0.08)');
        spotGrad.addColorStop(0.65, 'rgba(204, 255, 0, 0.03)');
        spotGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');

        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);

        // Vòng tròn Cyber Ring phát quang tại tọa độ con trỏ chuột
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, ctaTarget.isNear ? 24 : 14, 0, Math.PI * 2);
        ctx.strokeStyle = ctaTarget.isNear ? 'rgba(204, 255, 0, 0.9)' : 'rgba(204, 255, 0, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#CCFF00';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#CCFF00';
        ctx.fill();
        ctx.restore();
    }

    // -------------------------------------------------------------
    // 2. PHÂN BỔ HẠT VÀO SPATIAL HASH GRID
    // -------------------------------------------------------------
    spatialGrid.clear();
    for (let i = 0; i < particles.length; i++) {
        spatialGrid.insert(particles[i], i);
    }

    // -------------------------------------------------------------
    // 3. VẼ MẠNG LƯỚI TƠ SÁNG LIÊN KẾT GIỮA CÁC HẠT (O(N))
    // -------------------------------------------------------------
    const maxLineDist = 130;
    const maxLineDistSq = maxLineDist * maxLineDist;

    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const nearby = spatialGrid.getNearby(p1);

        for (let j = 0; j < nearby.length; j++) {
            const neighborIdx = nearby[j];
            if (i < neighborIdx) {
                const p2 = particles[neighborIdx];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < maxLineDistSq) {
                    const dist = Math.sqrt(distSq);
                    const alpha = (1 - dist / maxLineDist) * 0.42; // Tăng alpha từ 0.2 lên 0.42
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(204, 255, 0, ${alpha})`;
                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }
            }
        }
    }

    // -------------------------------------------------------------
    // 4. HIỆU ỨNG VORTEX TẠI TÂM NÚT CTA (KHI CHUỘT GẦN CTA < 250px)
    // -------------------------------------------------------------
    vortexAngle += 0.04;
    if (ctaTarget.isNear && ctaTarget.x > 0 && ctaTarget.y > 0) {
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#CCFF00';

        // Vẽ 2 vòng năng lượng xoay quanh nút CTA
        for (let ring = 1; ring <= 2; ring++) {
            ctx.beginPath();
            const ringR = 60 * ring + Math.sin(vortexAngle * 2 + ring) * 8;
            ctx.arc(ctaTarget.x, ctaTarget.y, ringR, vortexAngle * ring, vortexAngle * ring + Math.PI * 1.4);
            ctx.strokeStyle = `rgba(204, 255, 0, ${0.4 / ring})`;
            ctx.lineWidth = 2.0;
            ctx.stroke();
        }
        ctx.restore();
    }

    // -------------------------------------------------------------
    // 5. VẬT LÝ HẠT & MAGNETIC SUCTION / REPULSION
    // -------------------------------------------------------------
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (hasMouse) {
            // NẾU CHUỘT TIẾN GẦN NÚT CTA (< 250px): ĐẢO NGƯỢC VECTOR -> HÚT MẠNH VỀ TÂM CTA
            if (ctaTarget.isNear && ctaTarget.x > 0 && ctaTarget.y > 0) {
                const dx = ctaTarget.x - p.x;
                const dy = ctaTarget.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Mở rộng bán kính hút lên 600px
                if (dist < 600) {
                    const pullFactor = (600 - dist) / 600;
                    // Lực hút mạnh hướng tâm
                    p.x += (dx / (dist || 1)) * pullFactor * 6.5;
                    p.y += (dy / (dist || 1)) * pullFactor * 6.5;

                    // Hiệu ứng xoáy nhẹ khi đến gần
                    p.x += -dy * 0.03 * pullFactor;
                    p.y += dx * 0.03 * pullFactor;

                    // BẮN TIA SÁNG LASER CYBER LIME NỐI HẠT VỀ TÂM NÚT CTA
                    if (dist < 320) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(ctaTarget.x, ctaTarget.y);
                        ctx.strokeStyle = `rgba(204, 255, 0, ${0.55 * (1 - dist / 320)})`;
                        ctx.lineWidth = 1.4;
                        ctx.stroke();
                    }
                }
            } else {
                // MẶC ĐỊNH: Né chuột khi chuột lại gần (Repulsion)
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const repelForce = (mouse.radius - dist) / mouse.radius;
                    p.x += (dx / (dist || 1)) * repelForce * 4.5;
                    p.y += (dy / (dist || 1)) * repelForce * 4.5;
                }
            }
        }

        // Di chuyển tự do
        p.x += p.vx * p.baseSpeed;
        p.y += p.vy * p.baseSpeed;

        // Wrap biên màn hình
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // VẼ HẠT VỚI GLOW PHÁT SÁNG CYBER LIME
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

    requestAnimationFrame(render);
}

// Lắng nghe messages từ Main Thread
self.onmessage = function (e) {
    const data = e.data;
    if (!data) return;

    switch (data.type) {
        case 'INIT':
            canvas = data.canvas;
            ctx = canvas.getContext('2d');
            width = data.width;
            height = data.height;
            canvas.width = width;
            canvas.height = height;
            initParticles();
            requestAnimationFrame(render);
            break;

        case 'RESIZE':
            width = data.width;
            height = data.height;
            if (canvas) {
                canvas.width = width;
                canvas.height = height;
            }
            if (spatialGrid) {
                spatialGrid.updateDimensions(width, height);
            }
            break;

        case 'MOUSE_UPDATE':
            mouse.x = data.mouseX;
            mouse.y = data.mouseY;
            ctaTarget.x = data.ctaX;
            ctaTarget.y = data.ctaY;
            ctaTarget.isNear = data.isNearCta;
            ctaTarget.dist = data.distToCta;
            break;

        case 'MOUSE_LEAVE':
            mouse.x = -9999;
            mouse.y = -9999;
            ctaTarget.isNear = false;
            break;
    }
};

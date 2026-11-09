/**
 * GENERATOR.JS - Automated AI Landing Page Engine (SCQA Framework)
 * Vai trò: Frontend Developer chuyên tối ưu tỷ lệ chuyển đổi (CRO)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tham chiếu các phần tử của Form Quản trị & Màn hình Loading
    const adminModal = document.getElementById('adminModal');
    const openAdminBtn = document.getElementById('openAdminBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminEventForm = document.getElementById('adminEventForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingStepText = document.getElementById('loadingStepText');
    const mockNoticeBanner = document.getElementById('mockNoticeBanner');

    // 5 trường nhập liệu cốt lõi
    const inputEventName = document.getElementById('inputEventName');
    const inputEventTime = document.getElementById('inputEventTime');
    const inputEventLocation = document.getElementById('inputEventLocation');
    const inputEventSpeakers = document.getElementById('inputEventSpeakers');
    const inputEventOffer = document.getElementById('inputEventOffer');
    const inputApiKey = document.getElementById('inputApiKey');

    // Mở / Đóng modal quản trị
    if (openAdminBtn && adminModal) {
        openAdminBtn.addEventListener('click', () => {
            adminModal.classList.remove('hidden');
            if (inputEventName) inputEventName.focus();
        });
    }

    if (closeAdminBtn && adminModal) {
        closeAdminBtn.addEventListener('click', () => {
            adminModal.classList.add('hidden');
        });
    }

    // Đóng khi click ngoài backdrop
    if (adminModal) {
        adminModal.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.classList.add('hidden');
            }
        });
    }

    // -----------------------------------------------------------------
    // 1. THU THẬP DỮ LIỆU & QUẢN LÝ LUỒNG TẠO LANDING PAGE TỰ ĐỘNG
    // -----------------------------------------------------------------
    if (adminEventForm) {
        adminEventForm.addEventListener('submit', async (e) => {
            // Ngăn chặn hành vi submit mặc định của trình duyệt
            e.preventDefault();

            // Thu thập dữ liệu từ 5 trường
            const eventData = {
                name: inputEventName ? inputEventName.value.trim() : '',
                time: inputEventTime ? inputEventTime.value.trim() : '',
                location: inputEventLocation ? inputEventLocation.value.trim() : '',
                speakers: inputEventSpeakers ? inputEventSpeakers.value.trim() : '',
                earlyBirdOffer: inputEventOffer ? inputEventOffer.value.trim() : ''
            };

            const apiKey = inputApiKey ? inputApiKey.value.trim() : '';

            // Validation cơ bản
            if (!eventData.name) {
                alert('Vui lòng nhập Tên sự kiện để AI có thể phân tích!');
                if (inputEventName) inputEventName.focus();
                return;
            }

            // Ẩn form quản trị và hiển thị màn hình loading
            if (adminModal) adminModal.classList.add('hidden');
            showLoadingScreen(true, 'Khởi động Growth Marketer AI...');

            try {
                // Hiệu ứng các bước phân tích giả lập UX
                updateLoadingStep('Áp dụng Framework SCQA (Situation - Complication - Question - Answer)...');
                
                // Gọi API Gemini hoặc Fallback Mock
                const aiResult = await fetchAIContent(eventData, apiKey);

                updateLoadingStep('Bóc tách JSON và cập nhật Hero Section & Bento Grid...');
                await new Promise(r => setTimeout(r, 600));

                // Cập nhật giao diện người dùng
                updateLandingPageUI(aiResult, eventData);

                // Cuộn mượt lên đầu trang để xem kết quả
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (error) {
                console.error('Lỗi quy trình sinh trang:', error);
                alert('Đã xảy ra lỗi khi tạo trang. Vui lòng kiểm tra console.');
            } finally {
                // Tắt màn hình loading
                showLoadingScreen(false);
            }
        });
    }

    // -----------------------------------------------------------------
    // 2. TÍCH HỢP AI (SCQA FRAMEWORK) & CHẾ ĐỘ MOCK MINH BẠCH
    // -----------------------------------------------------------------
    /**
     * Hàm gọi Google Gemini API với SCQA Framework
     * Tự động fallback sang Mock Data nếu không có API_KEY hoặc có lỗi
     */
    async function fetchAIContent(eventData, apiKey = '') {
        // CHẾ ĐỘ MOCK MINH BẠCH: Nếu không có API_KEY, dùng ngay Mock Data
        if (!apiKey) {
            console.warn('⚠️ Không có API_KEY. Đang khởi chạy Chế độ Mock minh bạch.');
            await new Promise(resolve => setTimeout(resolve, 1400)); // Giả lập độ trễ AI
            return generateMockData(eventData);
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

        const prompt = `
Bạn là một chuyên gia Growth Marketer và Chuyên gia Tối ưu Chuyển đổi (CRO) hàng đầu.
Hãy dùng framework SCQA (Situation - Complication - Question - Answer) để phân tích dữ liệu sự kiện dưới đây và viết nội dung Landing Page thu hút chuyển đổi cao nhất.

DỮ LIỆU SỰ KIỆN:
- Tên sự kiện: "${eventData.name}"
- Thời gian: "${eventData.time || 'Sắp diễn ra'}"
- Địa điểm: "${eventData.location || 'Trực tuyến'}"
- Diễn giả: "${eventData.speakers || 'Các chuyên gia đầu ngành'}"
- Ưu đãi đăng ký sớm: "${eventData.earlyBirdOffer || 'Nhận vé miễn phí và quà tặng tài liệu'}"

YÊU CẦU ĐỊNH DẠNG:
Trả về DUY NHẤT một chuỗi JSON hợp lệ không có markdown code blocks, theo đúng schema sau:
{
  "headline": "Tiêu đề ấn tượng, giật tít thu hút lập trình viên/nhà sáng lập, làm nổi bật giá trị cốt lõi của sự kiện",
  "description": "Đoạn văn viết LIỀN MẠCH, trôi chảy theo chuẩn 4 bước SCQA:
   - [Situation - Tình huống]: Bối cảnh thực tế của thị trường công nghệ hiện tại.
   - [Complication - Thách thức]: Nỗi đau, áp lực cạnh tranh gay gắt mà đối tượng tham gia đang đau đầu đối mặt.
   - [Question - Câu hỏi cốt lõi]: Đặt câu hỏi kích thích khao khát: Làm sao để vượt lên dẫn đầu mà không kiệt sức?
   - [Answer - Giải pháp]: Khẳng định sự kiện này chính là câu trả lời toàn diện, giải quyết dứt điểm vấn đề.",
  "benefits": [
    {
      "title": "Tên lợi ích 1 (Đột phá hiệu suất & công nghệ)",
      "description": "Mô tả chi tiết giá trị thực chiến mà người tham dự mang về áp dụng được ngay.",
      "metricVal": "10x↑",
      "metricLabel": "Tốc độ hoàn thiện MVP"
    },
    {
      "title": "Tên lợi ích 2 (Kết nối diễn giả & chuyên gia)",
      "description": "Nhấn mạnh cơ hội tương tác 1:1 và học hỏi từ: ${eventData.speakers || 'các chuyên gia đầu ngành'}.",
      "tag": "EXPERT INSIGHTS"
    },
    {
      "title": "Tên lợi ích 3 (Ưu đãi độc quyền)",
      "description": "Nhấn mạnh ưu đãi độc quyền: ${eventData.earlyBirdOffer || 'Trọn bộ tài liệu và chứng chỉ VIP'}.",
      "offerHighlight": "${eventData.earlyBirdOffer || 'Ưu đãi đặc biệt'}"
    }
  ]
}
`.trim();

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: Status ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                throw new Error('Phản hồi trống từ Gemini API');
            }

            const parsed = JSON.parse(textResponse.trim());
            parsed.isMock = false;
            return parsed;

        } catch (err) {
            console.error('Lỗi khi gọi Gemini API. Tự động chuyển sang Chế độ Mock minh bạch:', err);
            const fallback = generateMockData(eventData);
            fallback.isMock = true;
            return fallback;
        }
    }

    // -----------------------------------------------------------------
    // 3. HÀM TẠO MOCK DATA CHUẨN SCQA (DÀNH CHO CHẾ ĐỘ MOCK MINH BẠCH)
    // -----------------------------------------------------------------
    function generateMockData(eventData) {
        const name = eventData.name || 'Vibe Coding Summit 2026';
        const loc = eventData.location || 'Gem Center, TP.HCM & Trực tuyến';
        const speakers = eventData.speakers || 'Các chuyên gia hàng đầu';
        const offer = eventData.earlyBirdOffer || 'Tặng trọn bộ 50+ Vibe Prompts & Voucher $500 Cloud Credit';

        return {
            isMock: true,
            headline: `Lập Trình Bằng Trực Giác: Làm Chủ Kỷ Nguyên ${name}`,
            description: `Trong bối cảnh làn sóng AI đang tái định hình toàn bộ ngành công nghệ với tốc độ chưa từng có (Situation), các kỹ sư và nhà quản lý phần mềm phải đối mặt với áp lực khổng lồ về tốc độ phát hành sản phẩm và chi phí vận hành ngày càng đắt đỏ (Complication). Làm thế nào để bứt phá năng lực, dẫn đầu xu hướng mà không bị cuốn vào vòng xoáy kiệt sức hay mã nguồn kém chất lượng (Question)? ${name} diễn ra tại ${loc} chính là câu trả lời toàn diện: trang bị tư duy kiến trúc phân tán, phương pháp Vibe Coding chuẩn hóa và dàn Autonomous Agents giúp bạn tăng tốc độ hoàn thiện sản phẩm gấp 10 lần (Answer).`,
            benefits: [
                {
                    title: `Làm Chủ Quy Trình ${name}: Ship App Nhanh Gấp 10 Lần`,
                    description: `Khám phá phương pháp lập trình trực giác bằng ngôn ngữ tự nhiên: Cách phối hợp Cursor, Claude 3.7 và MCP Servers để hoàn thành khối lượng công việc 2 tuần của một Sprint chỉ trong 1 buổi chiều.`,
                    metricVal: "10x↑",
                    metricLabel: "Tốc độ hoàn thiện MVP"
                },
                {
                    title: `Kết Nối Trực Tiếp Cùng Dàn Diễn Giả Đầu Ngành`,
                    description: `Học hỏi trực tiếp từ ${speakers}. Được tư vấn 1:1 về kiến trúc hệ thống tải lớn, phòng chống ảo giác AI (Hallucination) và tối ưu chi phí hạ tầng Cloud 40%.`,
                    tag: "EXPERT MENTORSHIP"
                },
                {
                    title: `Trọn Bộ Tài Nguyên Độc Quyền Bản Quyền`,
                    description: `Đăng ký sớm để nhận ngay gói đặc quyền: ${offer}. Đi kèm tài liệu phân tích case study thực tế và quyền truy cập phòng thảo luận kín VIP.`,
                    offerHighlight: offer
                }
            ]
        };
    }

    // -----------------------------------------------------------------
    // 4. CẬP NHẬT GIAO DIỆN NGƯỜI DÙNG (HERO & BENTO GRID)
    // -----------------------------------------------------------------
    function updateLandingPageUI(aiContent, eventData) {
        // Cập nhật Banner Mock minh bạch
        if (mockNoticeBanner) {
            if (aiContent.isMock) {
                mockNoticeBanner.innerHTML = `
                    <div class="flex items-center justify-center space-x-2">
                        <i data-lucide="alert-triangle" class="w-5 h-5 text-galaxyOrange animate-bounce"></i>
                        <span class="font-bold tracking-wide">Bản demo vòng loại - Dữ liệu mô phỏng AI</span>
                        <span class="text-xs text-gray-300 font-sans hidden sm:inline">(Không có API Key hoặc đang chạy chế độ kiểm thử)</span>
                    </div>
                `;
                mockNoticeBanner.classList.remove('hidden');
            } else {
                mockNoticeBanner.innerHTML = `
                    <div class="flex items-center justify-center space-x-2 text-neonCyan">
                        <i data-lucide="check-circle" class="w-5 h-5"></i>
                        <span class="font-bold">Đã đồng bộ trực tiếp với Google Gemini AI (SCQA Framework)</span>
                    </div>
                `;
                mockNoticeBanner.classList.remove('hidden');
                mockNoticeBanner.classList.remove('border-galaxyOrange/60', 'bg-galaxyOrange/10', 'text-galaxyOrange');
                mockNoticeBanner.classList.add('border-cyan-500/50', 'bg-cyan-950/40', 'text-neonCyan');
            }
        }

        // --- Cập nhật Khối Hero Section ---
        const heroBadge = document.getElementById('heroBadge');
        const heroHeadline = document.getElementById('heroHeadline');
        const heroDescription = document.getElementById('heroDescription');
        const heroOfferTag = document.getElementById('heroOfferTag');
        const heroEventTitle = document.getElementById('heroEventTitle');

        if (heroBadge) {
            heroBadge.textContent = `SỰ KIỆN: ${eventData.name.toUpperCase()} • ${eventData.time || 'LIVE 2026'}`;
        }
        if (heroHeadline) {
            heroHeadline.innerHTML = aiContent.headline;
        }
        if (heroDescription) {
            heroDescription.innerHTML = aiContent.description;
        }
        if (heroOfferTag && eventData.earlyBirdOffer) {
            heroOfferTag.textContent = `Ưu đãi: ${eventData.earlyBirdOffer}`;
        }
        if (heroEventTitle) {
            heroEventTitle.textContent = eventData.name;
        }

        // Cập nhật ngày giờ trên Sticky Bar nếu có nhập
        const stickyEventName = document.getElementById('stickyEventName');
        if (stickyEventName) {
            stickyEventName.textContent = `ĐẾM NGƯỢC: ${eventData.name.toUpperCase()}`;
        }

        // --- Cập nhật Lưới Bento Grid (3 Lợi ích) ---
        const b = aiContent.benefits || [];

        // Benefit 1
        if (b[0]) {
            const bentoTitle1 = document.getElementById('bentoTitle1');
            const bentoDesc1 = document.getElementById('bentoDesc1');
            const bentoMetricVal1 = document.getElementById('bentoMetricVal1');
            const bentoMetricLabel1 = document.getElementById('bentoMetricLabel1');

            if (bentoTitle1) bentoTitle1.textContent = b[0].title;
            if (bentoDesc1) bentoDesc1.textContent = b[0].description;
            if (bentoMetricVal1) bentoMetricVal1.textContent = b[0].metricVal || "10x↑";
            if (bentoMetricLabel1) bentoMetricLabel1.textContent = b[0].metricLabel || "Tốc độ phát triển";
        }

        // Benefit 2
        if (b[1]) {
            const bentoTitle2 = document.getElementById('bentoTitle2');
            const bentoDesc2 = document.getElementById('bentoDesc2');
            const bentoTag2 = document.getElementById('bentoTag2');

            if (bentoTitle2) bentoTitle2.textContent = b[1].title;
            if (bentoDesc2) bentoDesc2.textContent = b[1].description;
            if (bentoTag2 && b[1].tag) bentoTag2.textContent = b[1].tag;
        }

        // Benefit 3
        if (b[2]) {
            const bentoTitle3 = document.getElementById('bentoTitle3');
            const bentoDesc3 = document.getElementById('bentoDesc3');
            const bentoOfferTag3 = document.getElementById('bentoOfferTag3');

            if (bentoTitle3) bentoTitle3.textContent = b[2].title;
            if (bentoDesc3) bentoDesc3.textContent = b[2].description;
            if (bentoOfferTag3) {
                bentoOfferTag3.textContent = `ĐẶC QUYỀN: ${eventData.earlyBirdOffer || 'TÀI NGUYÊN ĐỘC QUYỀN'}`;
            }
        }

        // Cập nhật Lucide Icons mới được chèn
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // -----------------------------------------------------------------
    // QUẢN LÝ MÀN HÌNH LOADING
    // -----------------------------------------------------------------
    function showLoadingScreen(show, initialText = 'Đang kích hoạt AI...') {
        if (!loadingOverlay) return;
        if (show) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('flex');
            updateLoadingStep(initialText);
        } else {
            loadingOverlay.classList.remove('flex');
            loadingOverlay.classList.add('hidden');
        }
    }

    function updateLoadingStep(text) {
        if (loadingStepText) {
            loadingStepText.textContent = text;
        }
    }
});


# Dự án Mar 🚀

Dự án web tĩnh hiện đại (HTML5 / CSS3 / JavaScript thuần) được khởi tạo dành cho Giang.

---

## 📁 Cấu trúc thư mục

```text
Mar/
├── index.html        # Trang chính với giao diện hiện đại & ngữ nghĩa
├── css/
│   └── style.css     # Định kiểu CSS3, hỗ trợ Dark/Light mode, biến CSS
├── js/
│   └── main.js       # Xử lý sự kiện JavaScript thuần và lưu cấu hình
├── assets/           # Thư mục chứa hình ảnh, icon hoặc tài nguyên khác
└── README.md         # Hướng dẫn dự án
```

---

## ✨ Tính năng nổi bật đã tích hợp

- **Chuẩn HTML5 ngữ nghĩa**: Thân thiện với SEO, cấu trúc rõ ràng.
- **CSS hiện đại & Responsive**: Tương thích tốt trên cả Mobile, Tablet và Desktop.
- **Chế độ Sáng / Tối (Dark/Light mode)**: Tích hợp sẵn nút chuyển đổi và tự động lưu lựa chọn vào `localStorage`.
- **Hiệu ứng & Tương tác**: Nút tương tác bằng JavaScript, cuộn trang mượt mà (smooth scroll).

---

## 🖥️ Cách xem & chạy dự án

1. **Mở trực tiếp trên trình duyệt**:
   - Mở file `index.html` trực tiếp bằng trình duyệt bất kỳ (Chrome, Safari, Edge, v.v.).

2. **Dùng Live Server (nếu có extension trong VS Code/IDE)**:
   - Click chuột phải vào `index.html` -> chọn **Open with Live Server**.

3. **Dùng Python HTTP Server nhanh (tùy chọn)**:
   ```bash
   cd /Users/dannie/.gemini/antigravity/scratch/Mar
   python3 -m http.server 8000
   ```
   Sau đó truy cập `http://localhost:8000`.

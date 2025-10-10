# To-do-App
# Ứng dụng To-Do List Thông minh (AI-Powered To-Do App)

Một ứng dụng quản lý công việc hiện đại được xây dựng bằng HTML, CSS và JavaScript thuần, tích hợp sức mạnh của AI để giúp bạn lập kế hoạch hiệu quả hơn.

[![Deployed on Vercel](https://vercel.com/button)](https://to-do-app-ruby-seven.vercel.app/) 

---

## ## Giới thiệu

Đây là một dự án ứng dụng quản lý công việc (To-Do List) được xây dựng từ đầu. Không chỉ dừng lại ở các chức năng cơ bản, ứng dụng được trang bị nhiều tính năng nâng cao như chế độ tối, thống kê năng suất, và đặc biệt là **trợ lý AI (sử dụng Gemini API)** để tự động chia nhỏ các công việc phức tạp, giúp bạn dễ dàng quản lý và thực hiện các dự án lớn.

Dự án này là minh chứng cho việc xây dựng một ứng dụng front-end đầy đủ tính năng mà không cần đến các framework phức tạp.

---

## ## Các tính năng nổi bật 🚀

* **Quản lý công việc cơ bản:** Thêm, [nhấp đúp để sửa], xóa, và đánh dấu hoàn thành công việc.
* **Giao diện hiện đại:** Thiết kế sạch sẽ, responsive với các hiệu ứng chuyển động mượt mà.
* **Chế độ Sáng/Tối (Light/Dark Mode):** Tự động lưu lại lựa chọn của bạn để có trải nghiệm tốt nhất.
* **Chuỗi ngày hoạt động (Streak):** Theo dõi số ngày bạn hoạt động liên tiếp để tạo động lực.
* **Quản lý nâng cao:**
    * **Mức độ ưu tiên:** Phân loại công việc với 3 cấp độ (Cao, Trung bình, Thấp) qua các viền màu.
    * **Ngày hết hạn (Due Date):** Đặt hạn chót cho công việc và nhận cảnh báo trực quan khi quá hạn.
* **Lọc công việc:** Dễ dàng xem công việc theo trạng thái (Tất cả, Đang làm, Đã hoàn thành).
* **✨ Trợ lý AI (Gemini API):** Nhập một công việc lớn và để AI tự động chia nó thành các bước nhỏ hơn, dễ quản lý hơn.
* **Bảng thống kê:** Xem báo cáo trực quan về tổng số việc đã làm, chuỗi ngày kỷ lục và biểu đồ năng suất 7 ngày qua.
* **Lưu trữ cục bộ:** Mọi dữ liệu của bạn được lưu an toàn ngay trên trình duyệt bằng `localStorage`.

---

## ## Công nghệ sử dụng 🛠️

* **HTML5**
* **CSS3** (với [**Tailwind CSS**](https://tailwindcss.com/))
* **JavaScript (ES6+)**
* **[Vite](https://vitejs.dev/)** làm công cụ build và server phát triển.
* **[Google Gemini API](https://ai.google.dev/)** cho tính năng AI.

---

## ## Chạy dự án ở local

Bạn có thể chạy dự án này trên máy của mình bằng cách làm theo các bước sau:

1.  **Clone repository này về máy:**
    ```bash
    git clone https://github.com/PhanVinh2k6/To-do-App.git
    ```

2.  **Di chuyển vào thư mục dự án:**
    ```bash
    cd your-repo-name
    ```

3.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```

4.  **Tạo file biến môi trường:**
    * Tạo một file mới ở thư mục gốc của dự án tên là `.env.local`
    * Thêm API Key của bạn vào file này theo cú pháp:
        ```
        VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
        ```
        *(Bạn có thể lấy API Key từ [Google AI Studio](https://aistudio.google.com/))*

5.  **Chạy server phát triển:**
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập vào địa chỉ `http://localhost:5173` (hoặc một port khác được hiển thị trên terminal).

---

## ## Tác giả

Được phát triển với ❤️ bởi **Phan Vinh**.

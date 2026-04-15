# AI Marketing Agent - Hướng dẫn Phát triển & Cấu trúc dự án

Tài liệu này tóm tắt toàn bộ cấu trúc dự án và các lưu ý quan trọng khi phát triển thêm các tính năng Backend.

## 1. Cách khởi chạy dự án (Frontend)
1. Mở terminal tại thư mục `frontend`.
2. Chạy lệnh: `npm install` (nếu là lần đầu).
3. Chạy lệnh: `npm run dev`.
4. Mở trình duyệt: `http://localhost:3000`.

## 2. Cấu trúc thư mục chính
- `src/app/`: Quản lý Routes (Đường dẫn trang).
    - `(auth)/`: Nhóm trang xác thực (Đăng nhập, Đăng ký, Quên mật khẩu).
    - `dashboard/`: Nhóm trang quản trị (Tổng quan, Kết nối MXH, Hồ sơ).
- `src/components/`: Chứa các linh kiện UI dùng chung.
- `src/context/AuthContext.tsx`: Quản lý trạng thái đăng nhập toàn cục.
- `src/i18n/`: Quản lý đa ngôn ngữ (VN/EN).

## 3. Những phần cần thay đổi khi có Backend (Database)
Hiện tại dự án đang ở giai đoạn **Frontend Mockup** (giả lập). Khi bạn xây dựng Backend, hãy lưu ý thay đổi các vị trí sau:

### A. Xác thực (Authentication)
- **Tệp:** `src/context/AuthContext.tsx`
- **Việc cần làm:** 
    - Xóa bỏ logic `localStorage` giả lập người dùng.
    - Thay thế các hàm `login`, `register`, `logout` bằng các lệnh gọi API thực tế tới Backend.
    - Xử lý lưu trữ JWT Token một cách bảo mật.

### B. Kết nối mạng xã hội (Social Connections)
- **Tệp:** `src/app/dashboard/connections/page.tsx`
- **Việc cần làm:**
    - Thay thế dữ liệu `accounts` giả lập bằng dữ liệu lấy từ Database thông qua API.
    - Chỉnh sửa hàm `handleConnect` để thực hiện luồng OAuth thật sự với Meta/LinkedIn/TikTok API.

### C. Hồ sơ & Bảo mật
- **Tệp:** `src/app/dashboard/profile/page.tsx` và `security/page.tsx`
- **Việc cần làm:** Gửi các yêu cầu `POST/PUT` lên Backend để cập nhật thông tin vào Database thay vì chỉ thông báo thành công giả.

### D. Tập trung gọi API
- **Tệp:** `src/lib/api.ts`
- **Việc cần làm:** Khai báo các endpoint và hàm Axios/Fetch tập trung tại đây để dễ quản lý.

---
*Tài liệu được tạo bởi Antigravity AI Assistant.*

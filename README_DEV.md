# AI Marketing Agent - Hướng dẫn Phát triển & Cấu trúc dự án

Tài liệu này tóm tắt toàn bộ cấu trúc dự án và các lưu ý quan trọng khi phát triển.

---

## 1. Cách khởi chạy dự án

### Backend (Express + Prisma)
1. Mở terminal tại thư mục `backend`.
2. Chạy lệnh: `npm install` (nếu là lần đầu).
3. Tạo file `.env` dựa trên `.env.example` và điền thông tin Database, JWT Secret.
4. Chạy lệnh: `npx prisma db push` (tạo bảng trong Database).
5. Chạy lệnh: `npm run dev`.
6. Backend chạy tại: `http://localhost:5000`.
7. API Docs (Swagger): `http://localhost:5000/api/docs`.

### Frontend (Next.js)
1. Mở terminal tại thư mục `frontend`.
2. Chạy lệnh: `npm install` (nếu là lần đầu).
3. Chạy lệnh: `npm run dev`.
4. Mở trình duyệt: `http://localhost:3000`.

> **Lưu ý:** Cần bật Backend trước khi dùng Frontend để các tính năng đăng nhập/đăng ký hoạt động.

---

## 2. Cấu trúc thư mục Frontend

### 2.1. Thư mục gốc `frontend/`

| File/Thư mục | Nhiệm vụ |
|---|---|
| `.env.local` | Biến môi trường — chứa URL API backend (`NEXT_PUBLIC_API_URL`) |
| `next.config.ts` | Cấu hình Next.js (cho phép SVG, remote images từ dicebear, svgrepo) |
| `package.json` | Danh sách thư viện (dependencies) |
| `tsconfig.json` | Cấu hình TypeScript |
| `public/` | Ảnh tĩnh (logo, banner, swiper) |
| `src/` | **Toàn bộ mã nguồn chính** |

### 2.2. `src/app/` — Các trang (Pages / Routes)

#### File gốc
| File | Nhiệm vụ |
|---|---|
| `layout.tsx` | Layout chính toàn app (bọc AuthProvider, LanguageProvider) |
| `page.tsx` | **Trang chủ** — Landing Page giới thiệu sản phẩm |
| `globals.css` | CSS toàn cục + cấu hình TailwindCSS |
| `favicon.ico` | Icon hiển thị trên tab trình duyệt |

#### `src/app/(auth)/` — Nhóm trang Xác thực
| Thư mục | Nhiệm vụ | Trạng thái |
|---|---|---|
| `login/page.tsx` | Trang **Đăng nhập** | ✅ Đã kết nối API |
| `register/page.tsx` | Trang **Đăng ký** | ✅ Đã kết nối API |
| `forgot-password/page.tsx` | Trang **Quên mật khẩu** | ⚠️ Cần kiểm tra kết nối API |
| `reset-password/page.tsx` | Trang **Đặt lại mật khẩu** (từ email) | ⚠️ Cần kiểm tra kết nối API |

#### `src/app/dashboard/` — Nhóm trang Dashboard (sau khi đăng nhập)
| File/Thư mục | Nhiệm vụ | Trạng thái |
|---|---|---|
| `layout.tsx` | Layout Dashboard (có Sidebar bên trái) | ✅ Hoàn chỉnh |
| `page.tsx` | **Trang tổng quan** — Thống kê, biểu đồ | ✅ Hoàn chỉnh |
| `connections/page.tsx` | **Kết nối MXH** — Facebook, Instagram, TikTok... | ⚠️ Còn mock data |
| `content/page.tsx` | **AI Chat** — Tạo nội dung bằng AI | ⚠️ Cần kiểm tra |
| `trends/page.tsx` | **Xu hướng** — Phân tích xu hướng thị trường | ⚠️ Cần kiểm tra |
| `schedule/page.tsx` | **Lịch đăng bài** — Quản lý lịch đăng nội dung | ⚠️ Cần kiểm tra |
| `analytics/page.tsx` | **Báo cáo** — Phân tích hiệu suất | ❌ File trống, chưa phát triển |
| `profile/page.tsx` | **Hồ sơ cá nhân** — Quản lý thông tin user | ✅ Đã kết nối API |
| `security/page.tsx` | **Bảo mật** — Đổi mật khẩu | ✅ Đã kết nối API |

### 2.3. `src/components/` — Các component tái sử dụng

#### Component trang chủ (Landing Page)
| File | Nhiệm vụ |
|---|---|
| `Hero.tsx` | Banner chính trang chủ |
| `CTASwiper.tsx` | Carousel CTA (dùng Swiper.js) |
| `CategoryTags.tsx` | Danh mục / Tag lĩnh vực |
| `TrendingCards.tsx` | Card hiển thị xu hướng nổi bật |
| `AIChat.tsx` | Giao diện AI Chat demo trên trang chủ |
| `Analytics.tsx` | Phần giới thiệu tính năng phân tích |
| `AuthModals.tsx` | Modal đăng nhập/đăng ký (popup) |

#### `components/layout/` — Layout chung
| File | Nhiệm vụ |
|---|---|
| `Header.tsx` | Header / Navbar trang chủ |
| `Footer.tsx` | Footer trang chủ |
| `Sidebar.tsx` | Sidebar trang chủ (nếu có) |
| `DashboardSidebar.tsx` | Sidebar Dashboard — menu điều hướng bên trái |

#### `components/content/` — Component nội dung
| File | Nhiệm vụ |
|---|---|
| `AIContentGenerator.tsx` | Giao diện tạo nội dung bằng AI |

#### `components/dashboard/` — Component Dashboard
| File | Nhiệm vụ |
|---|---|
| `StatsCard.tsx` | Card hiển thị số liệu thống kê |
| `TrendChart.tsx` | Biểu đồ xu hướng (dùng thư viện Recharts) |

#### `components/ui/` — Component UI cơ bản
> Thư mục trống — đã xóa `button.tsx` (không sử dụng).

### 2.4. `src/context/` — React Context (State toàn cục)
| File | Nhiệm vụ |
|---|---|
| `AuthContext.tsx` | Quản lý đăng nhập / đăng ký / đăng xuất / đổi mật khẩu. **Đã kết nối API backend qua Axios.** |

### 2.5. `src/i18n/` — Đa ngôn ngữ
| File | Nhiệm vụ |
|---|---|
| `LanguageContext.tsx` | Context quản lý ngôn ngữ hiện tại (VI / EN) |
| `dictionaries.ts` | Từ điển dịch thuật — chứa text tiếng Việt & tiếng Anh |

### 2.6. `src/lib/` — Thư viện tiện ích
| File | Nhiệm vụ |
|---|---|
| `axios.ts` | Instance Axios đã cấu hình sẵn — gọi API backend (`baseURL`, `withCredentials`, `Authorization`) |

### 2.7. `src/types/` — Định nghĩa kiểu TypeScript
| File | Nhiệm vụ |
|---|---|
| `index.ts` | Định nghĩa các interface / type dùng chung trong project |

### 2.8. `public/` — Tài nguyên tĩnh
| File | Nhiệm vụ |
|---|---|
| `ChatGPT Image...png` | Logo dự án |
| `banner.jpg` | Ảnh banner trang chủ |
| `swiper1/2/3.jpg` | Ảnh cho carousel CTA |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Icon mặc định của Next.js (có thể xóa nếu không dùng) |

---

## 3. Backend API Endpoints

| Method | Endpoint | Nhiệm vụ | Cần Auth? |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập (trả JWT token) | ❌ |
| GET | `/api/auth/me` | Lấy thông tin user đang đăng nhập | ✅ |
| POST | `/api/auth/forgot-password` | Gửi email đặt lại mật khẩu | ❌ |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu bằng token | ❌ |
| PUT | `/api/auth/change-password` | Đổi mật khẩu (đang đăng nhập) | ✅ |
| PUT | `/api/users/profile` | Cập nhật thông tin cá nhân | ✅ |
| GET | `/api/users` | [ADMIN] Xem danh sách user | ✅ Admin |
| GET | `/api/users/:id` | [ADMIN] Xem chi tiết 1 user | ✅ Admin |
| PUT | `/api/users/:id/toggle-lock` | [ADMIN] Khóa/Mở khóa tài khoản | ✅ Admin |
| PUT | `/api/users/:id/toggle-admin` | [ADMIN] Cấp/Thu hồi quyền Admin | ✅ Admin |
| DELETE | `/api/users/:id` | [ADMIN] Xóa tài khoản | ✅ Admin |

---

## 4. Những phần còn cần phát triển

| Tính năng | Vị trí | Ghi chú |
|---|---|---|
| Quên mật khẩu / Đặt lại mật khẩu | `(auth)/forgot-password`, `(auth)/reset-password` | Kiểm tra kết nối API `POST /api/auth/forgot-password` và `reset-password` |
| Kết nối MXH | `dashboard/connections/page.tsx` | Xóa mock data, kết nối OAuth thực tế |
| AI Chat / Tạo nội dung | `dashboard/content/page.tsx` | Kết nối API `POST /api/content` |
| Xu hướng | `dashboard/trends/page.tsx` | Cần kiểm tra và kết nối API |
| Lịch đăng bài | `dashboard/schedule/page.tsx` | Cần kiểm tra và kết nối API |
| Báo cáo phân tích | `dashboard/analytics/page.tsx` | ❌ Chưa phát triển (file trống) |

---

*Tài liệu được cập nhật ngày 15/04/2026 bởi Antigravity AI Assistant.*

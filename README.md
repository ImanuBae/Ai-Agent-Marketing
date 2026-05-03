# AI Marketing Agent - Developer Guide & Project Structure

This document covers the complete project structure and important notes for development.

---

## 1. Getting Started

### Backend (Express + Prisma)
1. Navigate to the `backend` folder in your terminal.
2. Run `npm install` (first time only).
3. Create a `.env` file based on `.env.example` and fill in your Database connection and JWT Secret.
4. Run `npx prisma db push` to set up your database tables.
5. Run `npm run dev` to start the development server.
6. Backend will be available at: `http://localhost:5000`
7. API Documentation (Swagger): `http://localhost:5000/api/docs`

### Frontend (Next.js)
1. Navigate to the `frontend` folder in your terminal.
2. Run `npm install` (first time only).
3. Run `npm run dev` to start the development server.
4. Open your browser to: `http://localhost:3000`

> **Important:** Make sure the backend is running before using the frontend, otherwise authentication features won't work.

---

## 2. Frontend Directory Structure

### 2.1. Root `frontend/` Directory

| File/Folder | Purpose |
|---|---|
| `.env.local` | Environment variables — contains backend API URL (`NEXT_PUBLIC_API_URL`) |
| `next.config.ts` | Next.js configuration (SVG support, remote images from dicebear, svgrepo) |
| `package.json` | Project dependencies |
| `tsconfig.json` | TypeScript configuration |
| `public/` | Static assets (logo, banner, swiper images) |
| `src/` | **Main source code** |

### 2.2. `src/app/` — Pages & Routes

#### Root Files
| File | Purpose |
|---|---|
| `layout.tsx` | Main app layout (wraps AuthProvider, LanguageProvider) |
| `page.tsx` | **Home page** — Landing Page |
| `globals.css` | Global CSS + TailwindCSS configuration |
| `favicon.ico` | Browser tab icon |

#### `src/app/(auth)/` — Authentication Pages
| Folder | Purpose | Status |
|---|---|---|
| `login/page.tsx` | **Login page** | ✅ Connected to API |
| `register/page.tsx` | **Registration page** | ✅ Connected to API |
| `forgot-password/page.tsx` | **Forgot password page** | ⚠️ Needs API verification |
| `reset-password/page.tsx` | **Reset password page** (from email link) | ⚠️ Needs API verification |

#### `src/app/dashboard/` — Dashboard Pages (after login)
| File/Folder | Purpose | Status |
|---|---|---|
| `layout.tsx` | Dashboard layout (left sidebar) | ✅ Complete |
| `page.tsx` | **Dashboard overview** — Stats & charts | ✅ Complete |
| `connections/page.tsx` | **Social connections** — Facebook, Instagram, TikTok... | ⚠️ Using mock data |
| `content/page.tsx` | **AI Content Generator** — Create content with AI | ✅ Connected to Gemini |
| `trends/page.tsx` | **Trends** — Market trend analysis | ⚠️ Needs verification |
| `schedule/page.tsx` | **Schedule** — Manage content posting schedule | ⚠️ Needs verification |
| `analytics/page.tsx` | **Analytics** — Performance reports | ❌ Empty, not yet developed |
| `profile/page.tsx` | **Profile** — User account settings | ✅ Connected to API |
| `security/page.tsx` | **Security** — Change password | ✅ Connected to API |

#### `src/app/admin/` — Admin Panel (Admin only)
| File/Folder | Purpose | Status |
|---|---|---|
| `layout.tsx` | Admin layout (Admin Sidebar) | ✅ Complete |
| `page.tsx` | **Admin Dashboard** — System stats & overview | ✅ Complete |
| `users/` | **User Management** — List, Lock, Delete users | ✅ Complete |
| `content/` | **Content Management** — Manage AI generated content | ✅ Complete |
| `system/` | **System Status** — Monitor server & API health | ✅ Complete |
| `settings/` | **System Settings** — Global configurations | ✅ Complete |
| `logs/` | **System Logs** — View application logs | ✅ Complete |

### 2.3. `src/components/` — Reusable Components

#### Landing Page Components
| File | Purpose |
|---|---|
| `Hero.tsx` | Main hero banner |
| `CTASwiper.tsx` | CTA carousel (using Swiper.js) |
| `CategoryTags.tsx` | Category/Topic tags |
| `TrendingCards.tsx` | Trending content cards |
| `Features.tsx` | Features showcase section |
| `Pricing.tsx` | Pricing plans section |
| `Analytics.tsx` | Analytics features showcase |
| `AuthModals.tsx` | Login/Register modals (popup) |
| `AIChatFloating.tsx` | **Floating AI Chat Widget** — Interactive assistant |

#### `components/layout/` — Layout Components
| File | Purpose |
|---|---|
| `Header.tsx` | Header / Navbar on landing page |
| `Footer.tsx` | Footer on landing page |
| `DashboardHeader.tsx` | Header for Dashboard & Admin area |
| `DashboardSidebar.tsx` | Sidebar for User Dashboard |
| `AdminSidebar.tsx` | Sidebar for Admin Panel |

#### `components/content/` — Content Components
| File | Purpose |
|---|---|
| `AIContentGenerator.tsx` | AI content generation interface |

#### `components/dashboard/` — Dashboard Components
| File | Purpose |
|---|---|
| `StatsCard.tsx` | Statistics card component |
| `TrendChart.tsx` | Trend chart (using Recharts) |

#### `components/ui/` — Base UI Components
> Currently empty — removed `button.tsx` (not in use).

### 2.4. `src/context/` — React Context (Global State)
| File | Purpose |
|---|---|
| `AuthContext.tsx` | Manages login/registration/logout/password change. **Connected to backend API via Axios.** |

### 2.5. `src/i18n/` — Multi-language Support
| File | Purpose |
|---|---|
| `LanguageContext.tsx` | Context for managing current language (VI / EN) |
| `dictionaries.ts` | Translation dictionary — contains Vietnamese & English text |

### 2.6. `src/lib/` — Utility Libraries
| File | Purpose |
|---|---|
| `axios.ts` | Pre-configured Axios instance — calls backend API (`baseURL`, `withCredentials`, `Authorization`) |

### 2.7. `src/types/` — TypeScript Definitions
| File | Purpose |
|---|---|
| `index.ts` | Common interfaces and types used throughout the project |

### 2.8. `public/` — Static Assets
| File | Purpose |
|---|---|
| `ChatGPT Image...png` | Project logo |
| `banner.jpg` | Landing page banner |
| `swiper1/2/3.jpg` | Images for CTA carousel |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default Next.js icons (can be deleted if unused) |

---

## 3. Backend API Endpoints

| Method | Endpoint | Purpose | Auth Required? |
|---|---|---|---|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login (returns JWT token) | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |
| POST | `/api/auth/forgot-password` | Send password reset email | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ |
| PUT | `/api/auth/change-password` | Change password (authenticated user) | ✅ |
| PUT | `/api/users/profile` | Update user profile | ✅ |
| GET | `/api/users` | [ADMIN] List all users | ✅ Admin |
| GET | `/api/users/:id` | [ADMIN] Get user details | ✅ Admin |
| PUT | `/api/users/:id/toggle-lock` | [ADMIN] Lock/unlock account | ✅ Admin |
| PUT | `/api/users/:id/toggle-admin` | [ADMIN] Grant/revoke admin rights | ✅ Admin |
| DELETE | `/api/users/:id` | [ADMIN] Delete user account | ✅ Admin |

---

## 4. Features Still in Development

| Feature | Location | Notes |
|---|---|---|
| Forgot Password / Reset Password | `(auth)/forgot-password`, `(auth)/reset-password` | Verify API connection for `POST /api/auth/forgot-password` and `reset-password` |
| Social Media Connections | `dashboard/connections/page.tsx` | Remove mock data and implement real OAuth connections |
| AI Chat / Content Generation | `dashboard/content/page.tsx` | Connect to `POST /api/content` API |
| Trends | `dashboard/trends/page.tsx` | Verify and connect API |
| Scheduling | `dashboard/schedule/page.tsx` | Verify and connect API |
| Analytics Report | `dashboard/analytics/page.tsx` | ❌ Not yet developed (empty file) |

---

---

## 5. Gemini API Errors & Troubleshooting

### 5.1. Error 503 (Service Unavailable)
Lỗi này xuất hiện khi Google Gemini API không thể xử lý yêu cầu do quá tải hoặc đang bảo trì.
- **Nguyên nhân:** Lượng truy cập tăng đột biến (High Demand) hoặc giới hạn hạ tầng của Google.
- **Thông báo lỗi:** `[503 Service Unavailable] This model is currently experiencing high demand...`

### 5.2. Cách theo dõi trạng thái hệ thống Google
Bạn có thể kiểm tra xem lỗi là do code của mình hay do hệ thống Google tại các link sau:
1.  **Google AI Studio Dashboard:** [aistudio.google.com](https://aistudio.google.com/) (Kiểm tra Error Rate của API Key).
2.  **Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com/) (Kiểm tra lỗi 5xx trong Generative Language API).
3.  **Google Cloud Status Dashboard:** [status.cloud.google.com](https://status.cloud.google.com/)

### 5.3. Giải thích các thuật ngữ trên Trang Trạng Thái
- **Multi-regions (Đa khu vực):** Các dịch vụ có tính dự phòng cao, phân bổ trên nhiều khu vực địa lý lớn.
- **Non-regional (Không theo khu vực):** Trạng thái của các dịch vụ triển khai toàn cầu (như Gemini). Nếu phần này báo lỗi, nghĩa là dịch vụ đó đang gặp sự cố trên toàn hệ thống.

---

*Last updated: April 23, 2026 by Antigravity AI Assistant.*

# Skill IELTS 🎓

Ứng dụng học IELTS được xây dựng với Next.js 15, NextAuth, Prisma và PostgreSQL.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js v5
- **Database**: PostgreSQL với Prisma ORM
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Payment**: LemonSqueezy
- **Email**: Resend
- **Logging**: Axiom (optional)
- **Error Tracking**: Sentry (optional)

## 📋 Yêu Cầu

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm hoặc yarn hoặc pnpm

## 🛠️ Cài Đặt

### 1. Clone và cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 2. Thiết lập Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE skill_ielts;
```

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục root (copy từ `.env.example` nếu có):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skill_ielts?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="onboarding@resend.dev"
BASE_URL="http://localhost:3000"

# LemonSqueezy Payment (Optional)
LEMONSQUEEZY_API_KEY=""
LEMONSQUEEZY_STORE_ID=""
LEMONSQUEEZY_WEBHOOK_SECRET=""

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=""

# Axiom Logging (Optional)
AXIOM_TOKEN=""
AXIOM_DATASET=""

# Environment
NODE_ENV="development"
```

**Lưu ý**: Để tạo `NEXTAUTH_SECRET`, chạy lệnh:
```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Hoặc tạo migration
npm run db:migrate
```

### 5. Chạy ứng dụng

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Tạo migration mới
- `npm run db:studio` - Mở Prisma Studio

## 🔐 Authentication

Ứng dụng hỗ trợ:
- Email/Password authentication
- OAuth: Google, Facebook
- Two-Factor Authentication (2FA)
- Email verification

## 📧 Email Setup

Sử dụng Resend để gửi email. Cần:
1. Tạo tài khoản tại [Resend](https://resend.com)
2. Lấy API key
3. Thêm vào `.env`: `RESEND_API_KEY`
4. Cấu hình domain email (hoặc dùng email mặc định)

## 💳 Payment Setup (LemonSqueezy)

1. Tạo tài khoản tại [LemonSqueezy](https://lemonsqueezy.com)
2. Lấy API key và Store ID
3. Cấu hình webhook secret
4. Thêm vào `.env`

## 🗄️ Database Schema

Xem file `prisma/schema.prisma` để biết cấu trúc database.

## 📁 Cấu Trúc Project

```
skill_ielts/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities và helpers
├── prisma/          # Prisma schema
├── actions/         # Server actions
├── data/            # Data access layer
├── schemas/         # Zod validation schemas
└── types/           # TypeScript types
```

## 🐛 Troubleshooting

### Lỗi Prisma Client
```bash
npm run db:generate
```

### Lỗi database connection
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database đã được tạo

### Lỗi NextAuth
- Kiểm tra `NEXTAUTH_SECRET` đã được set
- Kiểm tra `NEXTAUTH_URL` đúng với domain

## 📄 License

Xem file LICENSE để biết thêm chi tiết.

## ⚙️ CI/CD với GitHub Actions

Workflow `.github/workflows/ci-cd.yml` sẽ:

1. Chạy `pnpm run lint` và `pnpm run build` cho mọi pull request và các lần push lên `main`.
2. Triển khai production lên Vercel khi push lên `main` thành công.

### Thiết lập secrets

Tại **Settings → Secrets and variables → Actions**, tạo các secrets sau:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `AXIOM_TOKEN` (tuỳ chọn)
- `AXIOM_DATASET` (tuỳ chọn)
- `NEXT_PUBLIC_SENTRY_DSN` (tuỳ chọn)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Các secrets OAuth (Google, Facebook, v.v.) cũng có thể thêm tương tự nếu cần cho môi trường build hoặc deploy.
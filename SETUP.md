# 🚀 Hướng Dẫn Setup Môi Trường

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

## Bước 2: Tạo file .env

Tạo file `.env` trong thư mục root với nội dung sau:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skill_ielts?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="onboarding@resend.dev"
BASE_URL="http://localhost:3000"

# LemonSqueezy Payment
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

# Logging
LOG_LEVEL="info"
DEV_LOG_LEVEL="debug"
CONSOLE_LOGGING_ENABLED="true"
```

### Tạo NEXTAUTH_SECRET

Chạy lệnh sau để tạo secret key:

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Copy kết quả và paste vào `NEXTAUTH_SECRET` trong file `.env`.

## Bước 3: Setup Database PostgreSQL

1. Đảm bảo PostgreSQL đã được cài đặt và đang chạy
2. Tạo database:

```sql
CREATE DATABASE skill_ielts;
```

3. Cập nhật `DATABASE_URL` trong `.env` với thông tin đăng nhập của bạn:
   - Thay `user` bằng username PostgreSQL
   - Thay `password` bằng password PostgreSQL
   - Thay `localhost:5432` nếu PostgreSQL chạy ở port khác

## Bước 4: Generate Prisma Client và Push Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

## Bước 5: Chạy ứng dụng

```bash
npm run dev
```

Truy cập: http://localhost:3000

## ⚙️ Cấu Hình Tùy Chọn

### Email (Resend)
1. Đăng ký tại https://resend.com
2. Lấy API key từ dashboard
3. Thêm vào `.env`: `RESEND_API_KEY="re_xxxxx"`

### OAuth (Google/Facebook)
**📖 Xem hướng dẫn chi tiết trong [OAUTH_SETUP.md](./OAUTH_SETUP.md)**

**Tóm tắt:**
1. Tạo OAuth app tại Google/Facebook Developer Console
2. Cấu hình **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google` (hoặc `/facebook`)
   - Production: `https://yourdomain.com/api/auth/callback/google` (hoặc `/facebook`)
3. Lấy Client ID và Client Secret
4. Thêm vào `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   FACEBOOK_CLIENT_ID="your-app-id"
   FACEBOOK_CLIENT_SECRET="your-app-secret"
   NEXTAUTH_URL="http://localhost:3000"  # Development
   ```

**⚠️ Lưu ý:** Callback URLs được tự động tạo bởi NextAuth, bạn chỉ cần cấu hình trong Google/Facebook console!

### Payment (LemonSqueezy)
1. Đăng ký tại https://lemonsqueezy.com
2. Lấy API key và Store ID
3. Cấu hình webhook
4. Thêm vào `.env`

## ✅ Kiểm Tra

Sau khi setup, kiểm tra:
- ✅ Database connection thành công
- ✅ Prisma Client đã được generate
- ✅ Ứng dụng chạy không lỗi
- ✅ Có thể truy cập http://localhost:3000


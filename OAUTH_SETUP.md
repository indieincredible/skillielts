# 🔐 Hướng Dẫn Setup OAuth (Google & Facebook)

## 📍 Callback URL trong Project

NextAuth tự động tạo callback URLs dựa trên `NEXTAUTH_URL` trong file `.env`:

### Callback URLs:
- **Google**: `{NEXTAUTH_URL}/api/auth/callback/google`
- **Facebook**: `{NEXTAUTH_URL}/api/auth/callback/facebook`

### Ví dụ:
- **Development**: `http://localhost:3000/api/auth/callback/google`
- **Production**: `https://yourdomain.com/api/auth/callback/google`

## 🔧 Cấu Hình trong Code

Callback URLs được xử lý tự động bởi:
- Route: `app/api/auth/[...nextauth]/route.ts`
- Config: `auth.config.ts` (Google & Facebook providers)
- Base URL: `NEXTAUTH_URL` trong `.env`

**Bạn KHÔNG cần cấu hình callback URL trong code!** NextAuth tự động xử lý.

## 🔵 Setup Google OAuth

### Bước 1: Tạo OAuth Client trong Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Nếu chưa có OAuth consent screen, tạo trước:
   - **User Type**: External (hoặc Internal nếu dùng Google Workspace)
   - **App name**: SkillIelts (hoặc tên bạn muốn)
   - **User support email**: Email của bạn
   - **Developer contact**: Email của bạn

### Bước 2: Cấu hình OAuth Client

1. **Application type**: Web application
2. **Name**: SkillIelts OAuth Client
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3000          (Development)
   https://yourdomain.com         (Production)
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google          (Development)
   https://yourdomain.com/api/auth/callback/google         (Production)
   ```
5. Click **Create**
6. Copy **Client ID** và **Client Secret**

### Bước 3: Thêm vào .env

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"  # Development
# NEXTAUTH_URL="https://yourdomain.com"  # Production
```

## 🔵 Setup Facebook OAuth

### Bước 1: Tạo App trong Facebook Developers

1. Truy cập: https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Chọn **Consumer** (hoặc loại app phù hợp)
4. Điền thông tin:
   - **App Name**: SkillIelts
   - **App Contact Email**: Email của bạn
5. Click **Create App**

### Bước 2: Thêm Facebook Login Product

1. Trong dashboard, tìm **Facebook Login**
2. Click **Set Up**
3. Chọn **Web** platform
4. Nhập **Site URL**:
   ```
   http://localhost:3000          (Development)
   https://yourdomain.com         (Production)
   ```

### Bước 3: Cấu hình Facebook Login Settings

1. Vào **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook          (Development)
   https://yourdomain.com/api/auth/callback/facebook         (Production)
   ```
3. **Client OAuth Login**: Yes
4. **Web OAuth Login**: Yes
5. **Enforce HTTPS**: No (Development) / Yes (Production)
6. Click **Save Changes**

### Bước 4: Lấy App ID và App Secret

1. Vào **Settings** → **Basic**
2. Copy **App ID** (Client ID)
3. Copy **App Secret** (Client Secret) - Click **Show** để hiện

### Bước 5: Cấu hình App Domains

1. Vào **Settings** → **Basic**
2. **App Domains**:
   ```
   localhost          (Development)
   yourdomain.com     (Production)
   ```

### Bước 6: Thêm vào .env

```env
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
NEXTAUTH_URL="http://localhost:3000"  # Development
# NEXTAUTH_URL="https://yourdomain.com"  # Production
```

## 🚀 Test OAuth

### Development (localhost:3000)

1. Đảm bảo `NEXTAUTH_URL="http://localhost:3000"` trong `.env`
2. Chạy `npm run dev`
3. Vào trang login
4. Click nút Google/Facebook
5. Đăng nhập và kiểm tra callback

### Production

1. Đảm bảo đã thêm domain vào Google/Facebook console
2. Đảm bảo `NEXTAUTH_URL="https://yourdomain.com"` trong `.env`
3. Deploy và test

## ⚠️ Lưu Ý Quan Trọng

### 1. Callback URLs phải KHỚP CHÍNH XÁC

- URL trong Google/Facebook console phải **chính xác** với `NEXTAUTH_URL/api/auth/callback/{provider}`
- Không có trailing slash `/`
- Phải đúng protocol: `http://` (dev) hoặc `https://` (production)

### 2. Development vs Production

- **Development**: Dùng `http://localhost:3000`
- **Production**: Dùng `https://yourdomain.com`
- Phải cấu hình **CẢ HAI** trong Google/Facebook console nếu test cả 2 môi trường

### 3. Facebook App Review

- App ở chế độ **Development Mode** chỉ cho phép admin/developers đăng nhập
- Để public, cần submit app review (không cần cho development)

### 4. Google OAuth Consent Screen

- Ở chế độ **Testing**, chỉ users được thêm vào test users mới đăng nhập được
- Để public, cần publish app (không cần cho development)

## 🔍 Troubleshooting

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân**: Callback URL trong console không khớp với NEXTAUTH_URL

**Giải pháp**:
1. Kiểm tra `NEXTAUTH_URL` trong `.env`
2. Kiểm tra callback URL trong Google/Facebook console
3. Đảm bảo không có trailing slash
4. Đảm bảo đúng protocol (http/https)

### Lỗi: "Invalid client"

**Nguyên nhân**: Client ID hoặc Client Secret sai

**Giải pháp**:
1. Kiểm tra lại Client ID và Secret trong `.env`
2. Đảm bảo không có khoảng trắng
3. Copy lại từ console

### Facebook: "App Not Setup"

**Nguyên nhân**: Facebook Login chưa được setup

**Giải pháp**:
1. Đảm bảo đã add Facebook Login product
2. Đảm bảo đã cấu hình Valid OAuth Redirect URIs
3. Đảm bảo App Domains đã được thêm

## 📝 Checklist

- [ ] Đã tạo Google OAuth Client
- [ ] Đã thêm Authorized redirect URIs trong Google Console
- [ ] Đã tạo Facebook App
- [ ] Đã thêm Facebook Login product
- [ ] Đã thêm Valid OAuth Redirect URIs trong Facebook
- [ ] Đã thêm App Domains trong Facebook
- [ ] Đã thêm Client ID và Secret vào `.env`
- [ ] Đã set `NEXTAUTH_URL` đúng
- [ ] Đã test đăng nhập thành công


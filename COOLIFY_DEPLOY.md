# 🚀 Coolify Deployment Guide - Genyu Scene Director

## Pre-requisites

- Coolify đã được cài đặt và chạy (https://coolify.io)
- Server đã được connect trong Coolify
- Repository GitHub đã được kết nối

---

## Bước 1: Tạo Application trong Coolify

1. **Login vào Coolify Dashboard**
2. **Click "New Resource" → "Application"**
3. **Chọn "GitHub" hoặc "Git Repository"**
4. **Chọn repository**: `sonicleez/scense_director` (hoặc repo của bạn)
5. **Branch**: `main`

---

## Bước 2: Cấu hình Build Settings

### Build Pack: `Nixpacks` (Recommended) hoặc `Dockerfile`

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Install Command** | `npm install` |
| **Start Command** | (để trống - static site) |
| **Base Directory** | `/` |
| **Publish Directory** | `dist` |

### Nếu dùng Dockerfile:

Tạo file `Dockerfile` trong root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Bước 3: Cấu hình Environment Variables

Trong Coolify Application → **Environment Variables**:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Quan trọng**: Với Vite, env vars phải có prefix `VITE_` để được bundle vào client.

---

## Bước 4: Tạo file nginx.conf (nếu dùng Dockerfile)

Tạo file `nginx.conf` trong root:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing - redirect all to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Bước 5: Deploy

1. **Click "Deploy"** trong Coolify
2. Đợi build hoàn tất (1-3 phút)
3. Check **Deployments** tab để xem logs

---

## Bước 6: Cấu hình Domain

1. Vào **Application → Settings → Domains**
2. Thêm domain của bạn (ví dụ: `app.yourdomain.com`)
3. Enable **SSL** (Let's Encrypt tự động)
4. Cập nhật DNS record:
   - **Type**: A
   - **Name**: app (hoặc @)
   - **Value**: IP của Coolify server

---

## Troubleshooting

### ❌ Build Failed - "vite: command not found"
**Fix**: Đảm bảo `vite` là devDependency và npm install chạy đúng.

### ❌ Page Not Found (404) trên routes
**Fix**: Cần nginx.conf với `try_files` cho SPA routing.

### ❌ Environment variables không hoạt động
**Fix**: 
- Đảm bảo prefix `VITE_`
- Rebuild sau khi thêm env vars
- Kiểm tra trong browser console: `import.meta.env`

### ❌ CORS Error với Supabase
**Fix**: Vào Supabase Dashboard → Authentication → URL Configuration → thêm domain Coolify.

---

## Health Check (Optional)

Trong Coolify Application → **Health Check**:

| Setting | Value |
|---------|-------|
| Path | `/` |
| Port | `80` |
| Interval | `30` |

---

## Cấu hình Supabase cho Domain mới

1. **Supabase Dashboard → Authentication → URL Configuration**
2. Thêm **Site URL**: `https://your-coolify-domain.com`
3. Thêm **Redirect URLs**: `https://your-coolify-domain.com/**`

---

## Quick Commands

```bash
# Build locally để test
npm run build

# Preview production build
npm run preview

# Check build output
ls -la dist/
```

---

## Files cần có trong repo:

```
📁 BlogAI/
├── 📄 package.json        ✅ (có sẵn)
├── 📄 vite.config.ts      ✅ (có sẵn)
├── 📄 index.html          ✅ (có sẵn)
├── 📄 .env.local          ⚠️ (không commit - dùng Coolify env vars)
├── 📄 Dockerfile          📝 (tạo nếu dùng Docker)
├── 📄 nginx.conf          📝 (tạo nếu dùng Docker)
└── 📁 dist/               🔨 (generated khi build)
```

---

💡 **Tip**: Coolify hỗ trợ auto-deploy khi push code lên GitHub. Enable trong Application → Webhooks.

# CORS Fix Guide - Khắc phục lỗi CORS

## 🚨 Vấn đề
Lỗi CORS xảy ra khi truy cập từ `http://192.168.10.239:5173` vì Appwrite chỉ cho phép `http://localhost:5173`

## 🔧 Giải pháp

### **Giải pháp 1: Cập nhật CORS trong Appwrite Console (Khuyến nghị)**

1. **Đăng nhập vào Appwrite Console**
   - Truy cập: https://cloud.appwrite.io/console
   - Chọn project của bạn

2. **Vào Settings → General**
   - Tìm phần **"Platforms"**
   - Click **"Add Platform"**

3. **Thêm Web Platform**
   - Chọn **"Web App"**
   - **Name**: `Local Network Access`
   - **Hostname**: `192.168.10.239`
   - **Port**: `5173`
   - Click **"Register"**

4. **Hoặc thêm tất cả IP trong mạng local**
   - **Hostname**: `192.168.10.*`
   - **Port**: `5173`

### **Giải pháp 2: Sử dụng localhost với port forwarding**

1. **Cập nhật file .env**
```env
# Thêm biến môi trường cho development
VITE_DEV_SERVER_HOST=0.0.0.0
```

2. **Cập nhật vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
```

3. **Truy cập qua localhost**
   - Sử dụng: `http://localhost:5173`
   - Hoặc: `http://127.0.0.1:5173`

### **Giải pháp 3: Sử dụng Proxy trong Vite**

1. **Cập nhật vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://cloud.appwrite.io',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      }
    }
  },
})
```

2. **Cập nhật Appwrite client**
```typescript
// src/lib/appwrite.ts
const client = new Client()
  .setEndpoint(import.meta.env.DEV ? '/api' : import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
```

### **Giải pháp 4: Sử dụng ngrok (Temporary)**

1. **Cài đặt ngrok**
```bash
npm install -g ngrok
```

2. **Tạo tunnel**
```bash
ngrok http 5173
```

3. **Sử dụng URL ngrok**
   - Truy cập: `https://your-ngrok-url.ngrok.io`
   - Thêm URL này vào Appwrite Console

## 🛠️ Các bước thực hiện

### **Bước 1: Kiểm tra cấu hình hiện tại**
```bash
# Kiểm tra file .env
cat .env

# Kiểm tra vite config
cat vite.config.ts
```

### **Bước 2: Chọn giải pháp phù hợp**
- **Giải pháp 1**: Nếu bạn có quyền admin Appwrite
- **Giải pháp 2**: Nếu muốn giữ nguyên cấu hình
- **Giải pháp 3**: Nếu cần proxy cho development
- **Giải pháp 4**: Nếu cần test tạm thời

### **Bước 3: Restart development server**
```bash
npm run dev
```

## 🔍 Debug CORS

### **Kiểm tra Network tab**
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Refresh trang
4. Tìm request bị lỗi CORS
5. Kiểm tra Response headers

### **Kiểm tra Console**
```javascript
// Thêm vào console để debug
console.log('Appwrite Endpoint:', import.meta.env.VITE_APPWRITE_ENDPOINT)
console.log('Project ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID)
```

## 📋 Checklist

- [ ] Đã thêm IP vào Appwrite Console
- [ ] Đã restart development server
- [ ] Đã clear browser cache
- [ ] Đã kiểm tra Network tab
- [ ] Đã test với localhost
- [ ] Đã test với IP address

## 🚀 Production Deployment

Khi deploy production, đảm bảo:

1. **Domain được thêm vào Appwrite Console**
2. **HTTPS được cấu hình đúng**
3. **CORS settings được cập nhật**

```env
# Production .env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DB_ID=your_database_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_collection_id
```

## 🆘 Troubleshooting

### **Lỗi vẫn còn sau khi thêm IP**
1. Clear browser cache
2. Restart development server
3. Kiểm tra Appwrite Console settings
4. Thử với incognito mode

### **Lỗi với HTTPS**
1. Đảm bảo domain có SSL certificate
2. Cập nhật CORS settings cho HTTPS
3. Kiểm tra mixed content warnings

### **Lỗi với localhost**
1. Kiểm tra port 5173 không bị block
2. Thử port khác (3000, 8080)
3. Kiểm tra firewall settings






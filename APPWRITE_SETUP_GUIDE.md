# Appwrite Setup Guide - Domain Management

## 🚨 Lỗi Authorization

**Lỗi:** `The current user is not authorized to perform the requested action`

### Nguyên nhân
- Collection "domains" không cho phép anonymous access
- Frontend đang gọi trực tiếp Appwrite mà không có authentication

## 🔧 Giải pháp 1: Cấu hình Collection Permissions

### Bước 1: Truy cập Appwrite Console
```
https://nyc.cloud.appwrite.io/console
```

### Bước 2: Vào Database Settings
1. Chọn project: `6895925b002cbaea7963`
2. Vào **Databases** 
3. Chọn database: `expiredcheck-db`
4. Chọn collection: `domains`

### Bước 3: Cấu hình Permissions
Vào tab **Settings > Permissions**, thêm các permission sau:

**Read Permission:**
- Role: `any` (cho phép tất cả user đọc)
- hoặc `users` (chỉ authenticated users)

**Write Permission:**
- Role: `any` (cho phép tất cả user ghi)
- hoặc `users` (chỉ authenticated users)

**Update Permission:**
- Role: `any`
- hoặc `users`

**Delete Permission:**
- Role: `any` 
- hoặc `users`

### Bước 4: Kiểm tra Database Permissions
Tại database level, đảm bảo có permission tương tự.

## 🔧 Giải pháp 2: Thêm Authentication System

### Bước 1: Tạo Anonymous Session
Thêm vào `src/lib/appwrite.ts`:

```typescript
import { Client, Databases, Account, Storage } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const databases = new Databases(client)
export const account = new Account(client)
export const storage = new Storage(client)

// Tạo anonymous session nếu chưa có
export const initAuth = async () => {
  try {
    await account.get()
  } catch {
    // Nếu chưa có session, tạo anonymous session
    try {
      await account.createAnonymousSession()
      console.log('Created anonymous session')
    } catch (error) {
      console.error('Failed to create anonymous session:', error)
    }
  }
}

export { client }
```

### Bước 2: Khởi tạo Auth trong App
Cập nhật `src/App.tsx`:

```typescript
import { useEffect } from 'react'
import { initAuth } from '@/lib/appwrite'

function App() {
  useEffect(() => {
    initAuth()
  }, [])
  
  // ... rest of component
}
```

## 🔧 Giải pháp 3: API Server Proxy (Như dự án gốc)

### Setup Backend API Server
Tạo file `api-server.js`:

```javascript
const express = require('express')
const cors = require('cors')
const { Client, Databases } = require('node-appwrite')

const app = express()
app.use(cors())
app.use(express.json())

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

// Get all domains
app.get('/api/domains', async (req, res) => {
  try {
    const result = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID
    )
    res.json({ success: true, domains: result.documents })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Add domain  
app.post('/api/domains', async (req, res) => {
  try {
    const result = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      'unique()',
      req.body
    )
    res.json({ success: true, domain: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(3001, () => {
  console.log('API Server running on port 3001')
})
```

## ✅ Khuyến nghị

**Cho development nhanh:** Sử dụng Giải pháp 1 (cấu hình permissions)
**Cho production:** Sử dụng Giải pháp 2 (authentication) hoặc 3 (API server)

## 📝 Lưu ý

1. **Security:** Anonymous access có thể không an toàn cho production
2. **Rate limiting:** Appwrite có giới hạn requests per minute
3. **Data validation:** Nên validate data ở backend nếu dùng API server







# Environment Variables Setup

## 🔧 Tạo file .env

Tạo file `.env` trong thư mục gốc của project với nội dung sau:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DB_ID=your_database_id_here
VITE_APPWRITE_USERS_COLLECTION_ID=your_collection_id_here

# WHOIS API Configuration
VITE_WHOIS_API_KEY=demo
```

## 📋 Cách lấy thông tin Appwrite

### 1. Project ID
- Vào Appwrite Console → Settings → General
- Copy **Project ID**

### 2. Database ID
- Vào Appwrite Console → Databases
- Click vào database của bạn
- Copy **Database ID** từ URL hoặc Settings

### 3. Collection ID
- Vào Appwrite Console → Databases → Your Database
- Click vào collection chứa domain data
- Copy **Collection ID** từ URL hoặc Settings

## 🔒 Ví dụ file .env

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=64f8a1b2c3d4e5f6a7b8c9d0
VITE_APPWRITE_DB_ID=64f8a1b2c3d4e5f6a7b8c9d1
VITE_APPWRITE_USERS_COLLECTION_ID=64f8a1b2c3d4e5f6a7b8c9d2
VITE_WHOIS_API_KEY=demo
```

## ✅ Sau khi tạo file .env

1. Chạy lại script setup:
   ```bash
   node scripts/setup-ssl-column.js
   ```

2. Hoặc setup manual qua Appwrite Console (Method 1 ở trên)

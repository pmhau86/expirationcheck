# 🌐 Domain Expiration Manager

Hệ thống quản lý domain và kiểm tra hạn sử dụng được xây dựng bằng React + Vite + Appwrite + Tailwind CSS.

**Dự án tham khảo từ:** `D:\AWX\github\Infra-expiredcheck`

## 🚀 Cấu trúc dự án

```
src/
├── components/
│   ├── layout/        # Shared layout components
│   ├── pages/         # Feature-based pages
│   │   ├── home/      # Home page
│   │   └── user/      # User management
│   └── common/        # Shared components
├── services/          # API services
│   └── user.ts        # User API services
├── lib/               # Appwrite client và utilities
│   └── appwrite.ts    # Appwrite configuration
├── styles/            # CSS files
│   └── globals.css    # Global Tailwind styles
├── App.tsx            # Root App component
└── main.tsx           # Vite entry point
```

## 📦 Dependencies

- **React 19** - UI Framework
- **React Router DOM** - Routing
- **Appwrite** - Backend-as-a-Service
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool

## ⚙️ Thiết lập môi trường

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Tạo file environment (.env):**
   ```bash
   cp .env.example .env
   ```

3. **Cấu hình Appwrite trong .env:**
   ```env
   VITE_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DB_ID=your-database-id
   VITE_APPWRITE_USERS_COLLECTION_ID=your-users-collection-id
   ```

## 🏃‍♂️ Chạy dự án

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🛠️ Quy tắc phát triển

### Naming Conventions
- **Components:** PascalCase → `UserDetail.tsx`
- **Service files:** camelCase → `userApi.ts`
- **CSS Modules:** kebab-case → `user-detail.module.css`
- **Directories:** lowercase → `user`, `product`
- **Hooks:** start with `use` → `useUserData.ts`

### Thêm tính năng mới

1. **Thêm Module mới:**
   ```bash
   # Tạo thư mục
   mkdir src/components/pages/[feature]
   
   # Tạo API service
   touch src/services/[feature].ts
   
   # Thêm CSS nếu cần
   touch src/styles/[feature].module.css
   ```

2. **Thêm Page mới:**
   ```bash
   # Tạo component
   touch src/components/pages/[module]/[page].tsx
   
   # Thêm route trong App.tsx
   ```

### Template Component

```tsx
import { useState, useEffect } from 'react'
import { getUserData } from '@/services/user'

export function UserListPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const data = await getUserData()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>User List</h1>
      {users.map(user => (
        <div key={user.$id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Template Service API

```tsx
import { databases } from '@/lib/appwrite'
import type { Models } from 'appwrite'

export async function getUserData(): Promise<Models.Document[]> {
  try {
    const res = await databases.listDocuments(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID
    )
    return res.documents
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}
```

## 🎨 Styling Guidelines

1. **Tailwind First:** Sử dụng utility classes cho 90% styling
2. **Scoped Styles:** Chỉ dùng CSS Modules khi Tailwind không đủ
3. **Responsive:** Mobile-first design với Tailwind breakpoints
4. **Custom Classes:** Định nghĩa trong `globals.css`

## 📱 Tính năng chính

### 🏠 Landing Page
- ✅ Màn hình chào mừng với connection test
- ✅ Loading states và error handling
- ✅ Quick navigation cards

### 📊 Dashboard
- ✅ Thống kê real-time (Tổng số, Active, Sắp hết hạn, Đã hết hạn)
- ✅ Quick action cards
- ✅ Recent domains list  
- ✅ Expiring domains alert (30 ngày)

### 📋 Domain Management
- ✅ Danh sách domains với status colors
- ✅ Filter by status (All, Active, Expiring, Expired)
- ✅ Search functionality
- ✅ Add/Delete domains
- ✅ Domain cards với đầy đủ thông tin

### 🔧 Technical Features
- ✅ Anonymous Authentication với Appwrite
- ✅ Status banner (Live/Demo mode)
- ✅ Responsive design with beautiful animations
- ✅ Error states và loading states
- ✅ Real-time data từ Appwrite Database

## 🎨 UI/UX Features

- ✅ **Gradient backgrounds** và modern design
- ✅ **Hover effects** và smooth transitions  
- ✅ **Status badges** với color coding
- ✅ **Loading spinners** với animations
- ✅ **Modal forms** cho thêm domain
- ✅ **Toast notifications** cho user feedback

## 🔗 Links hữu ích

- [Appwrite Documentation](https://appwrite.io/docs)
- [React Router DOM](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vite.dev/)

---

**Lưu ý:** Nhớ cấu hình Appwrite database và collections trước khi sử dụng tính năng Users.
#!/usr/bin/env node

/**
 * CORS Fix Script
 * Kiểm tra và hướng dẫn khắc phục lỗi CORS
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 CORS Fix Script')
console.log('='.repeat(50))

// Kiểm tra file .env
function checkEnvFile() {
  console.log('\n📋 Kiểm tra file .env...')

  const envPath = path.join(__dirname, '..', '.env')

  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env không tồn tại!')
    console.log('💡 Tạo file .env với nội dung:')
    console.log(`
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DB_ID=your_database_id_here
VITE_APPWRITE_USERS_COLLECTION_ID=your_collection_id_here
VITE_WHOIS_API_KEY=demo
    `)
    return false
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  const requiredVars = [
    'VITE_APPWRITE_ENDPOINT',
    'VITE_APPWRITE_PROJECT_ID',
    'VITE_APPWRITE_DB_ID',
    'VITE_APPWRITE_USERS_COLLECTION_ID'
  ]

  const missingVars = requiredVars.filter(varName => !envContent.includes(varName))

  if (missingVars.length > 0) {
    console.log('❌ Thiếu các biến môi trường:', missingVars.join(', '))
    return false
  }

  console.log('✅ File .env đã được cấu hình đúng')
  return true
}

// Kiểm tra vite.config.ts
function checkViteConfig() {
  console.log('\n⚙️ Kiểm tra vite.config.ts...')

  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts')

  if (!fs.existsSync(viteConfigPath)) {
    console.log('❌ File vite.config.ts không tồn tại!')
    return false
  }

  const configContent = fs.readFileSync(viteConfigPath, 'utf8')

  if (configContent.includes("host: '0.0.0.0'")) {
    console.log('✅ Vite đã được cấu hình để cho phép truy cập từ IP khác')
    return true
  } else {
    console.log('❌ Vite chưa được cấu hình cho network access')
    console.log('💡 Cập nhật vite.config.ts:')
    console.log(`
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
    `)
    return false
  }
}

// Hiển thị hướng dẫn khắc phục
function showFixInstructions() {
  console.log('\n🚨 HƯỚNG DẪN KHẮC PHỤC LỖI CORS')
  console.log('='.repeat(50))

  console.log('\n📝 Bước 1: Cập nhật Appwrite Console')
  console.log('1. Truy cập: https://cloud.appwrite.io/console')
  console.log('2. Chọn project của bạn')
  console.log('3. Vào Settings → General')
  console.log('4. Tìm phần "Platforms"')
  console.log('5. Click "Add Platform"')
  console.log('6. Chọn "Web App"')
  console.log('7. Điền thông tin:')
  console.log('   - Name: Local Network Access')
  console.log('   - Hostname: ' + import.meta.env.MY_IP)
  console.log('   - Port: 5173')
  console.log('8. Click "Register"')

  console.log('\n📝 Bước 2: Restart development server')
  console.log('1. Dừng server hiện tại (Ctrl+C)')
  console.log('2. Chạy lại: npm run dev')

  console.log('\n📝 Bước 3: Clear browser cache')
  console.log('1. Mở Developer Tools (F12)')
  console.log('2. Right-click refresh button')
  console.log('3. Chọn "Empty Cache and Hard Reload"')

  console.log('\n📝 Bước 4: Test lại')
  console.log('1. Truy cập: http://' + import.meta.env.MY_IP + ':5173')
  console.log('2. Kiểm tra Console tab')
  console.log('3. Kiểm tra Network tab')
}

// Hiển thị thông tin debug
function showDebugInfo() {
  console.log('\n🔍 THÔNG TIN DEBUG')
  console.log('='.repeat(50))

  console.log('\n📊 Kiểm tra Network tab:')
  console.log('1. Mở Developer Tools (F12)')
  console.log('2. Vào tab Network')
  console.log('3. Refresh trang')
  console.log('4. Tìm request bị lỗi CORS')
  console.log('5. Kiểm tra Response headers')

  console.log('\n📊 Thêm debug code vào console:')
  console.log(`
// Thêm vào browser console
console.log('Appwrite Endpoint:', import.meta.env.VITE_APPWRITE_ENDPOINT)
console.log('Project ID:', import.meta.env.VITE_APPWRITE_PROJECT_ID)
console.log('Database ID:', import.meta.env.VITE_APPWRITE_DB_ID)
console.log('Collection ID:', import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID)
  `)

  console.log('\n📊 Kiểm tra CORS headers:')
  console.log('Response headers cần có:')
  console.log('- Access-Control-Allow-Origin: http://' + import.meta.env.MY_IP + ':5173')
  console.log('- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS')
  console.log('- Access-Control-Allow-Headers: Content-Type, Authorization')
}

// Main function
function main() {
  const envOk = checkEnvFile()
  const viteOk = checkViteConfig()

  if (!envOk || !viteOk) {
    console.log('\n❌ Cần khắc phục các vấn đề trên trước')
    return
  }

  console.log('\n✅ Cấu hình cơ bản đã đúng')
  console.log('🔧 Vấn đề CORS cần được khắc phục trong Appwrite Console')

  showFixInstructions()
  showDebugInfo()

  console.log('\n🎯 Kết luận:')
  console.log('Lỗi CORS xảy ra vì Appwrite chỉ cho phép localhost:5173')
  console.log('Cần thêm IP ' + import.meta.env.MY_IP + ':5173 vào Appwrite Console')
  console.log('Hoặc sử dụng localhost:5173 thay vì IP address')
}

// Run script
main()

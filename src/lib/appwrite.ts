import { Client, Databases, Account, Permission, Role } from 'appwrite'

console.log('🔧 Appwrite Config:', {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID
})

const client = new Client()
  .setEndpoint('http://192.168.10.239:3001/appwrite')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '68b16e260029530463c0')

export const databases = new Databases(client)
export const account = new Account(client)

// Initialize authentication
export const initAuth = async () => {
  try {
    // Skip anonymous session since we're using API key
    console.log('✅ Using API key authentication')
  } catch (error: any) {
    console.log('ℹ️ Authentication setup:', error.message)
  }
}

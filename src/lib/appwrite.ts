import { Client, Databases, Account } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const databases = new Databases(client)
export const account = new Account(client)

// Initialize authentication
export const initAuth = async () => {
  try {
    // Create anonymous session
    await account.createAnonymousSession()
    console.log('✅ Anonymous session created successfully')
  } catch (error: any) {
    console.log('ℹ️ Anonymous session already exists or failed:', error.message)
  }
}

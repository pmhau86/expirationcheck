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

export async function createUser(userData: {
  name: string
  email: string
}): Promise<Models.Document> {
  try {
    const res = await databases.createDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
      'unique()', // Let Appwrite generate ID
      userData
    )
    return res
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

export async function updateUser(
  userId: string,
  userData: Partial<{ name: string; email: string }>
): Promise<Models.Document> {
  try {
    const res = await databases.updateDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
      userId,
      userData
    )
    return res
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      import.meta.env.VITE_APPWRITE_DB_ID,
      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
      userId
    )
  } catch (err: any) {
    throw new Error(`Appwrite Error: ${err.message}`)
  }
}


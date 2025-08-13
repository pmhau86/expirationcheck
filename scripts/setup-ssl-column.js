// Script to setup SSL column in Appwrite database
// Run this script to ensure ssl_expire_date column exists

import { Client, Databases, ID } from 'node-appwrite'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)

const databases = new Databases(client)

const DATABASE_ID = process.env.VITE_APPWRITE_DB_ID
const COLLECTION_ID = process.env.VITE_APPWRITE_USERS_COLLECTION_ID

async function setupSSLColumn() {
  try {
    console.log('🔧 Setting up SSL column in Appwrite database...')
    
    // Check if collection exists
    try {
      const collection = await databases.getCollection(DATABASE_ID, COLLECTION_ID)
      console.log(`✅ Collection found: ${collection.name}`)
      
      // Check if ssl_expire_date attribute exists
      const attributes = await databases.listAttributes(DATABASE_ID, COLLECTION_ID)
      const sslAttribute = attributes.attributes.find(attr => attr.key === 'ssl_expire_date')
      
      if (sslAttribute) {
        console.log('✅ SSL column already exists')
        return
      }
      
      // Create ssl_expire_date attribute
      console.log('📝 Creating ssl_expire_date column...')
      await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        'ssl_expire_date',
        255, // max length
        false, // required
        '', // default value
        false // array
      )
      
      console.log('✅ SSL column created successfully!')
      
    } catch (error) {
      if (error.code === 404) {
        console.error('❌ Collection not found. Please check your DATABASE_ID and COLLECTION_ID.')
      } else {
        console.error('❌ Error:', error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run the setup
setupSSLColumn()

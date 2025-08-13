# SSL Column Setup Guide

## 🔒 Setting up SSL Expire Date Column in Appwrite Database

### Prerequisites
- Appwrite project with database and collection already created
- Environment variables configured in `.env` file

### Method 1: Manual Setup via Appwrite Console

1. **Login to Appwrite Console**
   - Go to your Appwrite project dashboard
   - Navigate to **Databases** → Your Database → Your Collection

2. **Add SSL Column**
   - Click **Add Attribute**
   - Select **String** type
   - Set **Key** as `ssl_expire_date`
   - Set **Size** as `255`
   - **Required**: No (optional field)
   - **Default**: Leave empty
   - **Array**: No
   - Click **Create**

### Method 2: Using Setup Script

1. **Install Dependencies**
   ```bash
   npm install node-appwrite
   ```

2. **Run Setup Script**
   ```bash
   node scripts/setup-ssl-column.js
   ```

### Method 3: Using Appwrite CLI

1. **Install Appwrite CLI**
   ```bash
   npm install -g appwrite-cli
   ```

2. **Login to Appwrite**
   ```bash
   appwrite login
   ```

3. **Create Attribute**
   ```bash
   appwrite databases createStringAttribute \
     --databaseId YOUR_DATABASE_ID \
     --collectionId YOUR_COLLECTION_ID \
     --key ssl_expire_date \
     --size 255 \
     --required false \
     --default "" \
     --array false
   ```

### Verification

After setup, you can verify the column exists by:

1. **Check in Appwrite Console**
   - Go to your collection
   - Verify `ssl_expire_date` appears in the attributes list

2. **Test via Application**
   - Add a new domain with SSL expire date
   - Check if the data is saved correctly

### Database Schema

Your collection should now have these attributes:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | String | Yes | Domain name |
| `issued_date` | String | Yes | Domain registration date |
| `expire_date` | String | Yes | Domain expiration date |
| `ssl_expire_date` | String | No | SSL certificate expiration date |

### Environment Variables

Ensure your `.env` file has:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DB_ID=your_database_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_collection_id
```

### Troubleshooting

**Error: Collection not found**
- Verify your `VITE_APPWRITE_DB_ID` and `VITE_APPWRITE_USERS_COLLECTION_ID`
- Ensure the collection exists in your database

**Error: Attribute already exists**
- This is normal if the column was already created
- The application will work correctly

**Error: Permission denied**
- Ensure your API key has write permissions to the database
- Check your Appwrite project settings

### Next Steps

After setting up the SSL column:

1. **Test SSL Update Function**
   - Use the Update button in SSL Expires column
   - Verify data is saved to database

2. **Test SSL Sync Function**
   - Use the Sync button in SSL Expires column
   - Check if simulated SSL data is generated

3. **Monitor Database**
   - Check your Appwrite console to see SSL data being saved
   - Verify the `ssl_expire_date` field is populated

### Future Enhancements

- **Real SSL Certificate Checking**: Replace simulation with actual HTTPS certificate validation
- **SSL Status Monitoring**: Add alerts for SSL certificates expiring soon
- **Bulk SSL Sync**: Sync SSL certificates for multiple domains at once

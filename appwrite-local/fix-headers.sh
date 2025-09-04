#!/bin/bash

# Fix Appwrite headers error
echo "🔧 Fixing Appwrite headers error..."

# Wait for container to be ready
sleep 10

# Fix the getHeader() calls in general.php
docker exec appwrite sed -i "s/getHeader('X-Some-Header', null)/getHeader('X-Some-Header', '')/g" /usr/src/code/app/controllers/general.php

# Fix other potential null default values
docker exec appwrite sed -i "s/getHeader([^,]*), null)/getHeader(\1, '')/g" /usr/src/code/app/controllers/general.php

# Restart the container to apply changes
docker restart appwrite

echo "✅ Headers error fixed! Appwrite should work now."



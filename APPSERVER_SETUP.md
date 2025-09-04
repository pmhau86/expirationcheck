# Hướng dẫn cài đặt Appwrite trên Server

## 🐳 Phương pháp 1: Docker (Khuyến nghị)

### Bước 1: Cài đặt Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Bước 2: Cài đặt Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Bước 3: Tạo thư mục cho Appwrite
```bash
mkdir appwrite
cd appwrite
```

### Bước 4: Tạo file docker-compose.yml
```yaml
version: '3.8'

services:
  appwrite:
    image: appwrite/appwrite:1.4.13
    container_name: appwrite
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - appwrite-uploads:/storage/uploads
      - appwrite-cache:/storage/cache
      - appwrite-config:/storage/config
      - appwrite-certificates:/storage/certificates
    environment:
      - _APP_OPENSSL_KEY_V1=your-secret-key-here
      - _APP_SYSTEM_EMAIL_NAME=Appwrite
      - _APP_SYSTEM_EMAIL_ADDRESS=system@appwrite.local
      - _APP_SYSTEM_RESPONSE_FORMAT=JSON
      - _APP_DOMAIN=your-domain.com
      - _APP_ENV=production
    depends_on:
      - mariadb
      - redis
      - influxdb
      - telegraf

  mariadb:
    image: appwrite/mariadb:1.3.3
    container_name: appwrite-mariadb
    volumes:
      - appwrite-mariadb:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=your-root-password
      - MYSQL_DATABASE=appwrite
      - MYSQL_USER=appwrite
      - MYSQL_PASSWORD=your-appwrite-password

  redis:
    image: appwrite/redis:1.3.3
    container_name: appwrite-redis
    volumes:
      - appwrite-redis:/data

  influxdb:
    image: appwrite/influxdb:1.3.3
    container_name: appwrite-influxdb
    volumes:
      - appwrite-influxdb:/var/lib/influxdb

  telegraf:
    image: appwrite/telegraf:1.3.3
    container_name: appwrite-telegraf
    volumes:
      - appwrite-influxdb:/var/lib/influxdb
      - /var/run/docker.sock:/var/run/docker.sock:ro

volumes:
  appwrite-uploads:
  appwrite-cache:
  appwrite-config:
  appwrite-certificates:
  appwrite-mariadb:
  appwrite-redis:
  appwrite-influxdb:
```

### Bước 5: Khởi động Appwrite
```bash
docker-compose up -d
```

### Bước 6: Truy cập Appwrite Console
- Mở trình duyệt và truy cập: `http://your-server-ip`
- Tạo tài khoản admin đầu tiên

## 🔧 Phương pháp 2: Self-hosted với Docker Compose (Đơn giản)

### Bước 1: Clone Appwrite repository
```bash
git clone https://github.com/appwrite/appwrite.git
cd appwrite
```

### Bước 2: Cấu hình environment
```bash
cp .env.example .env
nano .env
```

### Bước 3: Chỉnh sửa .env file
```env
# Appwrite Configuration
_APP_OPENSSL_KEY_V1=your-secret-key-here
_APP_SYSTEM_EMAIL_NAME=Appwrite
_APP_SYSTEM_EMAIL_ADDRESS=system@your-domain.com
_APP_DOMAIN=your-domain.com
_APP_ENV=production

# Database Configuration
_APP_DB_HOST=mariadb
_APP_DB_PORT=3306
_APP_DB_SCHEMA=appwrite
_APP_DB_USER=appwrite
_APP_DB_PASS=your-password

# Redis Configuration
_APP_REDIS_HOST=redis
_APP_REDIS_PORT=6379
```

### Bước 4: Khởi động
```bash
docker-compose up -d
```

## 🌐 Phương pháp 3: Cloud Deployment

### AWS EC2
```bash
# Cài đặt Docker trên EC2
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Clone và chạy Appwrite
git clone https://github.com/appwrite/appwrite.git
cd appwrite
docker-compose up -d
```

### DigitalOcean Droplet
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Chạy Appwrite
git clone https://github.com/appwrite/appwrite.git
cd appwrite
docker-compose up -d
```

## 🔒 Cấu hình bảo mật

### 1. Firewall
```bash
# Mở port cần thiết
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### 2. SSL Certificate
```bash
# Sử dụng Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d your-domain.com
```

### 3. Domain Configuration
- Trỏ domain về IP server
- Cấu hình DNS records
- Thêm domain vào Appwrite Console

## 📊 Monitoring

### Health Check
```bash
# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f appwrite

# Restart service
docker-compose restart appwrite
```

### Backup Database
```bash
# Backup MariaDB
docker exec appwrite-mariadb mysqldump -u root -p appwrite > backup.sql

# Restore Database
docker exec -i appwrite-mariadb mysql -u root -p appwrite < backup.sql
```

## 🚨 Troubleshooting

### Lỗi thường gặp:
1. **Port 80/443 đã được sử dụng**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # hoặc nginx
   ```

2. **Docker không có quyền**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **Không thể truy cập từ bên ngoài**
   - Kiểm tra firewall
   - Kiểm tra security groups (AWS)
   - Kiểm tra domain DNS

## 📝 Cập nhật cấu hình cho project

Sau khi cài đặt Appwrite trên server, cập nhật file `.env`:

```env
VITE_APPWRITE_ENDPOINT=http://your-server-ip/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DB_ID=your_database_id
VITE_APPWRITE_USERS_COLLECTION_ID=your_collection_id
VITE_WHOIS_API_KEY=demo
```

## ✅ Kiểm tra cài đặt

1. Truy cập Appwrite Console: `http://your-server-ip`
2. Tạo project mới
3. Tạo database và collection
4. Test API từ project React




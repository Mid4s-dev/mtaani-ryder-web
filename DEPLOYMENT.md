# Ryder Mtaani Deployment Guide

## Quick Start

### 1. Environment Setup
```bash
# Copy and configure environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database settings in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ryder_mtaani
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Database Setup

#### Option A: PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib postgresql-client php-pgsql

# Start PostgreSQL service
sudo systemctl start postgresql && sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE ryder_mtaani;"
sudo -u postgres psql -c "CREATE USER ryder_mtaani WITH ENCRYPTED PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ryder_mtaani TO ryder_mtaani;"
sudo -u postgres psql -d ryder_mtaani -c "GRANT ALL ON SCHEMA public TO ryder_mtaani;"

# Configure .env for PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ryder_mtaani
DB_USERNAME=ryder_mtaani
DB_PASSWORD=your_secure_password

# Run migrations and seed
php artisan migrate
php artisan db:seed
```

#### Option B: SQLite (Development Only)
```bash
# Configure .env for SQLite
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/your/database.sqlite

# Run migrations and seed
php artisan migrate
php artisan db:seed
```

### 3. Install Dependencies
```bash
# PHP dependencies
composer install

# JavaScript dependencies
npm install

# Build frontend assets
npm run build
```

### 4. Start Development Servers
```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server (for hot reload)
npm run dev

# Terminal 3: Queue worker (for background jobs)
php artisan queue:work

# Terminal 4: Laravel Pail for logging (optional)
php artisan pail
```

## Sample Login Credentials

After running `php artisan db:seed`, you can use these credentials:

### Customer Account
- Email: `john@customer.com`
- Password: `password`
- Phone: `+254712345678`

### Rider Account
- Email: `peter@rider.com`
- Password: `password`
- Phone: `+254723456789`

### Admin Account
- Email: `admin@rydermtaani.com`
- Password: `password`
- Phone: `+254700000000`

## API Testing

You can test the API endpoints using curl or Postman:

### 1. Send OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "type": "login"
  }'
```

### 2. Login (In development, OTP is logged)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "otp": "123456"
  }'
```

### 3. Create Delivery
```bash
curl -X POST http://localhost:8000/api/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pickup_name": "Test Sender",
    "pickup_phone": "+254700000001",
    "pickup_address": "Westlands, Nairobi",
    "pickup_latitude": -1.2630,
    "pickup_longitude": 36.8063,
    "delivery_name": "Test Recipient",
    "delivery_phone": "+254700000002",
    "delivery_address": "Karen, Nairobi",
    "delivery_latitude": -1.3197,
    "delivery_longitude": 36.7076,
    "package_type": "Documents",
    "package_description": "Important business documents",
    "package_size": "small",
    "payment_method": "cash"
  }'
```

## Configuration

### SMS/OTP Setup

#### Using Twilio
```env
TWILIO_SID=your_account_sid
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+1234567890
```

#### Using Vonage (Nexmo)
```env
VONAGE_KEY=your_api_key
VONAGE_SECRET=your_api_secret
VONAGE_SMS_FROM=YourAppName
```

### Google Maps Integration
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Make sure to enable these APIs in Google Cloud Console:
- Maps JavaScript API
- Geocoding API
- Places API (optional)
- Distance Matrix API (optional)

### Email Configuration
```env
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@rydermtaani.com
MAIL_FROM_NAME="Ryder Mtaani"
```

## Production Deployment

### 1. Server Requirements
- PHP 8.2+
- MySQL 8.0+ or PostgreSQL 13+
- Redis (for caching and queues)
- Nginx or Apache
- SSL Certificate

### 2. Optimization Commands
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Build production assets
npm run build
```

### 3. Queue Setup
Set up supervisor to manage queue workers:

```ini
[program:ryder-mtaani-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ryder-mtaani/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/ryder-mtaani/storage/logs/worker.log
stopwaitsecs=3600
```

### 4. Cron Job Setup
Add to crontab:
```bash
* * * * * cd /var/www/ryder-mtaani && php artisan schedule:run >> /dev/null 2>&1
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `.env`
   - Ensure database server is running
   - Verify database exists

2. **Permission Errors**
   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

3. **Node Version Issues**
   - Ensure Node.js 20.19+ is installed
   - Use nvm to manage Node versions if needed

4. **API Token Issues**
   - Ensure Laravel Sanctum is properly configured
   - Check SANCTUM_STATEFUL_DOMAINS in `.env`

### Logs
Monitor application logs:
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Queue worker logs
tail -f storage/logs/worker.log

# Web server logs
tail -f /var/log/nginx/error.log
```

## Performance Optimization

1. **Database Indexing**
   - All location-based queries are indexed
   - Delivery status queries are optimized
   - User type queries are indexed

2. **Caching Strategy**
   - Configuration caching for production
   - Route caching for better performance
   - View caching to reduce compilation

3. **CDN Setup**
   - Configure AWS S3 for file storage
   - Use CloudFlare for static assets
   - Enable Gzip compression

## Security Checklist

- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] File upload validation
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Regular security updates

## Monitoring

Set up monitoring for:
- Application uptime
- Database performance
- Queue job processing
- API response times
- Error rates
- User activity

Recommended tools:
- Laravel Telescope (development)
- New Relic or DataDog (production)
- Sentry for error tracking
- Laravel Horizon for queue monitoring
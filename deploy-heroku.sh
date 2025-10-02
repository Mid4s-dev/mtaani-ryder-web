#!/bin/bash

# Ryder Mtaani - Heroku Deployment Script
# This script automates the Heroku deployment and configuration process

set -e

echo "🚀 Ryder Mtaani - Heroku Deployment Setup"
echo "=========================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

# Check if logged into Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please login to Heroku first: heroku login"
    exit 1
fi

# Get app name from user
read -p "📝 Enter your Heroku app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "🔧 Creating new Heroku app..."
    APP_NAME=$(heroku create --json | jq -r '.name')
    echo "✅ Created app: $APP_NAME"
else
    echo "🔗 Connecting to existing app: $APP_NAME"
    heroku git:remote -a $APP_NAME
fi

echo ""
echo "🔧 Configuring buildpacks..."
heroku buildpacks:clear -a $APP_NAME
heroku buildpacks:add heroku/nodejs -a $APP_NAME
heroku buildpacks:add heroku/php -a $APP_NAME

echo ""
echo "🔧 Adding Heroku addons..."
# Skip PostgreSQL addon - using external MySQL
heroku addons:create sendgrid:starter -a $APP_NAME

echo ""
echo "🔐 Configuring environment variables..."

# Generate and set APP_KEY
APP_KEY=$(php artisan --no-ansi key:generate --show)
heroku config:set APP_KEY="$APP_KEY" -a $APP_NAME

# Basic app configuration
heroku config:set APP_NAME="Ryder Mtaani" -a $APP_NAME
heroku config:set APP_ENV=production -a $APP_NAME
heroku config:set APP_DEBUG=false -a $APP_NAME
heroku config:set APP_URL="https://${APP_NAME}.herokuapp.com" -a $APP_NAME

# Session and CSRF configuration
heroku config:set SESSION_DRIVER=database -a $APP_NAME
heroku config:set CACHE_STORE=database -a $APP_NAME
heroku config:set QUEUE_CONNECTION=database -a $APP_NAME
heroku config:set SANCTUM_STATEFUL_DOMAINS="${APP_NAME}.herokuapp.com,localhost,127.0.0.1" -a $APP_NAME
heroku config:set SESSION_DOMAIN="${APP_NAME}.herokuapp.com" -a $APP_NAME
heroku config:set SESSION_SECURE_COOKIE=true -a $APP_NAME
heroku config:set SESSION_SAME_SITE=lax -a $APP_NAME

# Mail configuration (using Sendgrid)
SENDGRID_API_KEY=$(heroku config:get SENDGRID_API_KEY -a $APP_NAME)
heroku config:set MAIL_MAILER=sendgrid -a $APP_NAME
heroku config:set MAIL_HOST=smtp.sendgrid.net -a $APP_NAME
heroku config:set MAIL_PORT=587 -a $APP_NAME
heroku config:set MAIL_USERNAME=apikey -a $APP_NAME
heroku config:set MAIL_PASSWORD="$SENDGRID_API_KEY" -a $APP_NAME
heroku config:set MAIL_ENCRYPTION=tls -a $APP_NAME
heroku config:set MAIL_FROM_ADDRESS="noreply@${APP_NAME}.herokuapp.com" -a $APP_NAME
heroku config:set MAIL_FROM_NAME="Ryder Mtaani" -a $APP_NAME

# Database configuration (External MySQL - Aiven)
heroku config:set DB_CONNECTION=mysql -a $APP_NAME
heroku config:set DB_HOST=mysql-36a9fbd7-lugayajoshua-f8e5.e.aivencloud.com -a $APP_NAME
heroku config:set DB_PORT=20405 -a $APP_NAME
heroku config:set DB_DATABASE=defaultdb -a $APP_NAME
heroku config:set DB_USERNAME=avnadmin -a $APP_NAME

# Get database password from local .env or prompt user
if [ -f .env ] && grep -q "DB_PASSWORD=" .env; then
    DB_PASSWORD=$(grep "DB_PASSWORD=" .env | cut -d '=' -f2)
    echo "🔐 Using database password from .env file"
else
    read -s -p "🔐 Enter your Aiven MySQL database password: " DB_PASSWORD
    echo ""
fi
heroku config:set DB_PASSWORD="$DB_PASSWORD" -a $APP_NAME

# Business configuration
heroku config:set DELIVERY_BASE_FARE=100 -a $APP_NAME
heroku config:set DELIVERY_PER_KM_RATE=20 -a $APP_NAME
heroku config:set PLATFORM_FEE_PERCENT=15 -a $APP_NAME
heroku config:set DEFAULT_DELIVERY_RADIUS=10 -a $APP_NAME
heroku config:set OTP_EXPIRY_MINUTES=15 -a $APP_NAME
heroku config:set OTP_LENGTH=6 -a $APP_NAME

# Logging
heroku config:set LOG_CHANNEL=errorlog -a $APP_NAME
heroku config:set LOG_LEVEL=info -a $APP_NAME

echo ""
echo "📝 Please set these environment variables manually:"
echo "   heroku config:set GOOGLE_MAPS_API_KEY=your_api_key -a $APP_NAME"
echo "   heroku config:set VITE_GOOGLE_MAPS_API_KEY=your_api_key -a $APP_NAME"
echo ""

read -p "📍 Enter your Google Maps API key (or press Enter to skip): " GOOGLE_API_KEY
if [ ! -z "$GOOGLE_API_KEY" ]; then
    heroku config:set GOOGLE_MAPS_API_KEY="$GOOGLE_API_KEY" -a $APP_NAME
    heroku config:set VITE_GOOGLE_MAPS_API_KEY="$GOOGLE_API_KEY" -a $APP_NAME
fi

echo ""
echo "🚀 Initial deployment..."
git add .
git commit -m "Configure for Heroku deployment" || true
git push heroku main

echo ""
echo "🗄️ Running database migrations..."
heroku run php artisan migrate --force -a $APP_NAME

echo ""
echo "🌱 Seeding database with sample data..."
heroku run php artisan db:seed --force -a $APP_NAME

echo ""
echo "⚡ Optimizing application..."
heroku run php artisan config:cache -a $APP_NAME
heroku run php artisan route:cache -a $APP_NAME

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your app is available at: https://${APP_NAME}.herokuapp.com"
echo "🔐 Admin login: admin@rydermtaani.com / password"
echo ""
echo "📊 To monitor your app:"
echo "   heroku logs --tail -a $APP_NAME"
echo "   heroku ps -a $APP_NAME"
echo ""
echo "🔧 To configure auto-deployment:"
echo "1. Go to https://dashboard.heroku.com/apps/$APP_NAME"
echo "2. Click 'Deploy' tab"
echo "3. Connect to GitHub and enable automatic deploys"
echo ""

# Open the app in browser
read -p "🌐 Open app in browser? (y/n): " OPEN_BROWSER
if [[ $OPEN_BROWSER =~ ^[Yy]$ ]]; then
    heroku open -a $APP_NAME
fi

echo ""
echo "🎉 Ryder Mtaani is now live on Heroku!"
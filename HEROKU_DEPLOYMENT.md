# Heroku Deployment Guide for Ryder Mtaani

## Prerequisites
1. Heroku CLI installed
2. Git repository
3. Heroku account

## Step 1: Install Heroku CLI
```bash
# Install Heroku CLI (Ubuntu/Debian)
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login
```

## Step 2: Create Heroku App
```bash
# Navigate to your project directory
cd /home/mid4s/Documents/projects/mtaani-ryder-web

# Create Heroku app
heroku create your-app-name-here

# Or connect to existing app
heroku git:remote -a your-existing-app-name
```

## Step 3: Configure Environment Variables

### Required Environment Variables
```bash
# App Configuration
heroku config:set APP_NAME="Ryder Mtaani" -a your-app-name-here
heroku config:set APP_ENV=production -a your-app-name-here
heroku config:set APP_DEBUG=false -a your-app-name-here
heroku config:set APP_KEY=$(php artisan --no-ansi key:generate --show) -a your-app-name-here

# Generate and set app key
php artisan key:generate --show
heroku config:set APP_KEY=base64:your-generated-key-here

# Database Configuration (External MySQL - Aiven)
heroku config:set DB_CONNECTION=mysql -a your-app-name-here
heroku config:set DB_HOST=mysql-36a9fbd7-lugayajoshua-f8e5.e.aivencloud.com -a your-app-name-here
heroku config:set DB_PORT=20405 -a your-app-name-here
heroku config:set DB_DATABASE=defaultdb -a your-app-name-here
heroku config:set DB_USERNAME=avnadmin -a your-app-name-here
heroku config:set DB_PASSWORD=your_aiven_mysql_password -a your-app-name-here

# Session & Cache
heroku config:set SESSION_DRIVER=database
heroku config:set CACHE_STORE=database
heroku config:set QUEUE_CONNECTION=database

# CSRF & Security Configuration
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set SANCTUM_STATEFUL_DOMAINS="your-app-name.herokuapp.com,localhost,127.0.0.1"
heroku config:set SESSION_DOMAIN=your-app-name.herokuapp.com
heroku config:set SESSION_SECURE_COOKIE=true
heroku config:set SESSION_SAME_SITE=lax

# Mail Configuration (using Sendgrid addon)
heroku addons:create sendgrid:starter
# This sets SENDGRID_API_KEY automatically
heroku config:set MAIL_MAILER=sendgrid
heroku config:set MAIL_HOST=smtp.sendgrid.net
heroku config:set MAIL_PORT=587
heroku config:set MAIL_USERNAME=apikey
heroku config:set MAIL_PASSWORD=$(heroku config:get SENDGRID_API_KEY)
heroku config:set MAIL_ENCRYPTION=tls
heroku config:set MAIL_FROM_ADDRESS="noreply@your-domain.com"
heroku config:set MAIL_FROM_NAME="Ryder Mtaani"

# Google Maps API
heroku config:set GOOGLE_MAPS_API_KEY=your-google-maps-api-key
heroku config:set VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Business Configuration
heroku config:set DELIVERY_BASE_FARE=100
heroku config:set DELIVERY_PER_KM_RATE=20
heroku config:set PLATFORM_FEE_PERCENT=15
heroku config:set DEFAULT_DELIVERY_RADIUS=10
heroku config:set OTP_EXPIRY_MINUTES=15
heroku config:set OTP_LENGTH=6

# Logging
heroku config:set LOG_CHANNEL=errorlog
heroku config:set LOG_LEVEL=info

# Additional Security
heroku config:set BCRYPT_ROUNDS=12
```

## Step 4: Configure Heroku Buildpacks
```bash
# Set Node.js buildpack for frontend assets
heroku buildpacks:add heroku/nodejs

# Set PHP buildpack
heroku buildpacks:add heroku/php
```

## Step 5: Configure Auto-Deployment from GitHub

### Option A: Via Heroku Dashboard
1. Go to https://dashboard.heroku.com/apps/your-app-name
2. Click "Deploy" tab
3. Select "GitHub" as deployment method
4. Connect to your GitHub repository
5. Enable "Automatic deploys" from main branch
6. Enable "Wait for CI to pass before deploy" (optional)

### Option B: Via CLI
```bash
# Connect GitHub repo (if not done via dashboard)
heroku git:remote -a your-app-name

# Set up automatic deployment (requires GitHub integration via dashboard)
```

## Step 6: Prepare Laravel for Production

### Update composer.json for Heroku
Add to composer.json:
```json
{
  "scripts": {
    "post-install-cmd": [
      "php artisan clear-compiled",
      "chmod -R 755 storage",
      "php artisan package:discover"
    ],
    "post-autoload-dump": [
      "Illuminate\\Foundation\\ComposerScripts::postAutoloadDump",
      "@php artisan package:discover --ansi"
    ]
  }
}
```

## Step 7: Deploy

### First Deployment
```bash
# Commit all changes
git add .
git commit -m "Configure for Heroku deployment"

# Push to Heroku
git push heroku main

# Or if auto-deploy is enabled, just push to GitHub
git push origin main
```

### Run Migrations
```bash
# Run migrations on Heroku
heroku run php artisan migrate --force

# Seed database (optional)
heroku run php artisan db:seed --force

# Clear caches
heroku run php artisan config:cache
heroku run php artisan route:cache
```

## Step 8: Monitor Deployment
```bash
# View logs
heroku logs --tail

# Check app status
heroku ps

# Open app in browser
heroku open
```

## Automatic Deployment Workflow

Once configured, your deployment workflow will be:
1. Push code to GitHub main branch
2. Heroku automatically detects changes
3. Builds application with buildpacks
4. Runs release phase commands (migrations, caching)
5. Deploys to production

## Environment Variables Summary

Here's a complete list of environment variables to set:

### Essential Variables
- `APP_KEY` - Laravel application key
- `APP_URL` - Your Heroku app URL
- `DB_*` - Database configuration
- `GOOGLE_MAPS_API_KEY` - For location features

### Security Variables
- `SANCTUM_STATEFUL_DOMAINS`
- `SESSION_DOMAIN`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=lax`

### Mail Variables
- `MAIL_*` - Email configuration
- `SENDGRID_API_KEY` - Automatically set by addon

## Troubleshooting

### Common Issues

1. **500 Error**: Check logs with `heroku logs --tail`
2. **Database Connection**: Ensure DATABASE_URL or DB_* variables are correct
3. **Assets Not Loading**: Run `npm run build` before deployment
4. **CSRF Token Mismatch**: Check APP_URL and SESSION_DOMAIN configuration

### Debug Commands
```bash
# Check environment variables
heroku config

# Run artisan commands
heroku run php artisan --version
heroku run php artisan migrate:status

# Check disk space
heroku run df -h

# Open bash shell
heroku run bash
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] Google Maps API key configured
- [ ] Email service configured
- [ ] HTTPS/SSL working
- [ ] CSRF protection working
- [ ] Auto-deployment enabled
- [ ] Monitoring set up

Your Ryder Mtaani app will now automatically deploy to Heroku whenever you push to the main branch!
# MySQL Database Configuration Test

## Testing Your External MySQL Connection

Before deploying to Heroku, let's verify your MySQL connection works:

### 1. Test Local Connection to Aiven MySQL
```bash
# Test database connectivity
php artisan tinker --execute="
try {
    DB::connection()->getPdo();
    echo 'MySQL connection successful!' . PHP_EOL;
    echo 'Database: ' . DB::connection()->getDatabaseName() . PHP_EOL;
    echo 'Users count: ' . App\\Models\\User::count() . PHP_EOL;
} catch (Exception \$e) {
    echo 'Connection failed: ' . \$e->getMessage() . PHP_EOL;
}
"
```

### 2. Verify Current Database Configuration
```bash
# Check current .env database settings
grep -E "^DB_" .env

# Expected output:
# DB_CONNECTION=mysql
# DB_HOST=mysql-36a9fbd7-lugayajoshua-f8e5.e.aivencloud.com
# DB_PORT=20405
# DB_DATABASE=defaultdb
# DB_USERNAME=avnadmin
# DB_PASSWORD=your_aiven_mysql_password
```

### 3. Test Migration Status
```bash
php artisan migrate:status
```

## Updated Heroku Configuration

### Database Variables Set by Deploy Script:
- ✅ `DB_CONNECTION=mysql`
- ✅ `DB_HOST=mysql-36a9fbd7-lugayajoshua-f8e5.e.aivencloud.com`
- ✅ `DB_PORT=20405`
- ✅ `DB_DATABASE=defaultdb`
- ✅ `DB_USERNAME=avnadmin`
- ✅ `DB_PASSWORD=your_aiven_mysql_password`

### Benefits of Using External MySQL:
1. **Persistent Data** - Data survives app restarts/deployments
2. **Better Performance** - Dedicated MySQL server
3. **Backup & Recovery** - Aiven provides automated backups
4. **Scalability** - Can handle more concurrent connections
5. **Cost Effective** - No additional Heroku PostgreSQL addon needed

## Deployment Process Updated

### What Changed:
1. **Removed PostgreSQL addon** from deployment script
2. **Added MySQL configuration** to environment variables
3. **Updated Procfile** to seed database after migration
4. **Modified GitHub Actions** to work with external database

### Deploy Commands:
```bash
# Option 1: Automated deployment
./deploy-heroku.sh

# Option 2: Manual setup
heroku config:set DB_CONNECTION=mysql -a your-app
heroku config:set DB_HOST=mysql-36a9fbd7-lugayajoshua-f8e5.e.aivencloud.com -a your-app
heroku config:set DB_PORT=20405 -a your-app
heroku config:set DB_DATABASE=defaultdb -a your-app
heroku config:set DB_USERNAME=avnadmin -a your-app
heroku config:set DB_PASSWORD=your_aiven_mysql_password -a your-app
```

## SSL Configuration for Aiven

If SSL is required (recommended for production):

### Add SSL Certificate Download to Procfile:
```bash
# Add to release phase in Procfile
curl -o /app/aiven-ca.pem https://static.aiven.io/ca/ca.pem
```

### Set SSL Environment Variable:
```bash
heroku config:set MYSQL_ATTR_SSL_CA=/app/aiven-ca.pem -a your-app
```

## Monitoring MySQL Connection

### Check Connection on Heroku:
```bash
# Test database connection on Heroku
heroku run php artisan tinker --execute="echo 'Connected to: ' . DB::connection()->getDatabaseName();" -a your-app

# Check migration status
heroku run php artisan migrate:status -a your-app

# View database stats
heroku run php artisan tinker --execute="echo 'Users: ' . App\\Models\\User::count();" -a your-app
```

### Troubleshooting:
```bash
# View Heroku logs for database errors
heroku logs --tail -a your-app

# Check environment variables
heroku config -a your-app | grep DB_

# Test connection manually
heroku run php artisan tinker -a your-app
```

## Ready to Deploy!

Your Heroku deployment is now configured to use your external Aiven MySQL database. The deployment script will:

1. ✅ Skip PostgreSQL addon installation
2. ✅ Set MySQL connection parameters
3. ✅ Run migrations on your existing database
4. ✅ Seed with sample data (if tables are empty)
5. ✅ Configure all other production settings

Run `./deploy-heroku.sh` when ready!
# PostgreSQL Setup and Management Guide

## ✅ Installation Complete

Your Ryder Mtaani application is now successfully configured with PostgreSQL! Here's what was set up:

### Database Configuration
- **Database**: `ryder_mtaani`
- **User**: `ryder_mtaani`
- **Password**: `secure_password_123`
- **Host**: `127.0.0.1` (localhost)
- **Port**: `5432` (default PostgreSQL port)

### Sample Users Created
- **Customer**: `john@customer.com` / `password`
- **Rider**: `peter@rider.com` / `password`
- **Admin**: `admin@rydermtaani.com` / `password`

## PostgreSQL Management Commands

### Basic Database Operations

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Connect to your application database
sudo -u postgres psql -d ryder_mtaani

# List all databases
sudo -u postgres psql -c "\l"

# List all tables in your database
sudo -u postgres psql -d ryder_mtaani -c "\dt"

# View users table
sudo -u postgres psql -d ryder_mtaani -c "SELECT * FROM users;"
```

### Database Backup and Restore

```bash
# Create a backup
sudo -u postgres pg_dump ryder_mtaani > ryder_mtaani_backup.sql

# Restore from backup
sudo -u postgres psql -d ryder_mtaani < ryder_mtaani_backup.sql

# Create compressed backup
sudo -u postgres pg_dump ryder_mtaani | gzip > ryder_mtaani_backup.sql.gz

# Restore compressed backup
gunzip -c ryder_mtaani_backup.sql.gz | sudo -u postgres psql -d ryder_mtaani
```

### Performance Monitoring

```bash
# Check database size
sudo -u postgres psql -d ryder_mtaani -c "
SELECT 
    pg_size_pretty(pg_database_size('ryder_mtaani')) AS database_size;
"

# Check table sizes
sudo -u postgres psql -d ryder_mtaani -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# View active connections
sudo -u postgres psql -c "
SELECT 
    datname,
    usename,
    client_addr,
    state,
    query_start
FROM pg_stat_activity 
WHERE datname = 'ryder_mtaani';
"
```

## Laravel Commands with PostgreSQL

### Migration Commands

```bash
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Reset all migrations
php artisan migrate:reset

# Refresh migrations (reset + migrate)
php artisan migrate:refresh

# Fresh migrations (drop all tables + migrate)
php artisan migrate:fresh

# Check migration status
php artisan migrate:status
```

### Database Seeding

```bash
# Seed database with sample data
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=RyderMtaaniSeeder

# Fresh migrations with seeding
php artisan migrate:fresh --seed
```

### Testing Database Connection

```bash
# Test database connection
php artisan tinker --execute="echo 'DB Connection: ' . DB::connection()->getDatabaseName();"

# Check user count
php artisan tinker --execute="echo 'Users: ' . App\Models\User::count();"

# Check deliveries count
php artisan tinker --execute="echo 'Deliveries: ' . App\Models\Delivery::count();"
```

## PostgreSQL Advantages over SQLite

### Performance Benefits
- **Concurrent Access**: Multiple users can read/write simultaneously
- **Better Indexing**: More sophisticated indexing strategies
- **Query Optimization**: Advanced query planner and optimizer
- **Scalability**: Handles large datasets efficiently

### Production Features
- **ACID Compliance**: Full transaction support
- **Data Integrity**: Foreign key constraints, check constraints
- **Backup/Recovery**: Point-in-time recovery, continuous archiving
- **Replication**: Master-slave and streaming replication
- **Monitoring**: Extensive logging and statistics

### Advanced Data Types
- **JSON/JSONB**: Native JSON support with indexing
- **Arrays**: Native array data types
- **Geographic**: PostGIS extension for location data
- **Full-Text Search**: Built-in search capabilities

## Configuration for Different Environments

### Development (.env)
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ryder_mtaani_dev
DB_USERNAME=ryder_mtaani
DB_PASSWORD=dev_password
```

### Testing (.env.testing)
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ryder_mtaani_test
DB_USERNAME=ryder_mtaani
DB_PASSWORD=test_password
```

### Production (.env.production)
```env
DB_CONNECTION=pgsql
DB_HOST=your_production_host
DB_PORT=5432
DB_DATABASE=ryder_mtaani_prod
DB_USERNAME=ryder_mtaani_prod
DB_PASSWORD=very_secure_production_password

# Connection pooling for production
DB_POOL_MIN=2
DB_POOL_MAX=20
```

## Security Best Practices

### Database Security
```bash
# Create read-only user for reporting
sudo -u postgres psql -c "CREATE USER ryder_readonly WITH PASSWORD 'readonly_pass';"
sudo -u postgres psql -c "GRANT CONNECT ON DATABASE ryder_mtaani TO ryder_readonly;"
sudo -u postgres psql -d ryder_mtaani -c "GRANT USAGE ON SCHEMA public TO ryder_readonly;"
sudo -u postgres psql -d ryder_mtaani -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO ryder_readonly;"

# Configure PostgreSQL for security (postgresql.conf)
listen_addresses = 'localhost'
ssl = on
password_encryption = scram-sha-256
```

### Laravel Security
```php
// config/database.php - Production settings
'pgsql' => [
    'driver' => 'pgsql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    'schema' => 'public',
    'sslmode' => 'require', // For production
    'options' => [
        PDO::ATTR_TIMEOUT => 30,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
],
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Start if not running
   sudo systemctl start postgresql
   ```

2. **Authentication Failed**
   ```bash
   # Reset user password
   sudo -u postgres psql -c "ALTER USER ryder_mtaani PASSWORD 'new_password';"
   
   # Update .env file with new password
   ```

3. **Permission Denied**
   ```bash
   # Grant all permissions
   sudo -u postgres psql -d ryder_mtaani -c "GRANT ALL ON SCHEMA public TO ryder_mtaani;"
   sudo -u postgres psql -d ryder_mtaani -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO ryder_mtaani;"
   ```

4. **Database Does Not Exist**
   ```bash
   # Create database
   sudo -u postgres psql -c "CREATE DATABASE ryder_mtaani;"
   ```

### Performance Optimization

```sql
-- Create indexes for better query performance
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at);
CREATE INDEX idx_deliveries_coordinates ON deliveries(pickup_latitude, pickup_longitude);

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE deliveries;
ANALYZE rider_profiles;
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

```bash
# Update table statistics
sudo -u postgres psql -d ryder_mtaani -c "ANALYZE;"

# Vacuum tables to reclaim space
sudo -u postgres psql -d ryder_mtaani -c "VACUUM;"

# Full vacuum (more thorough, requires downtime)
sudo -u postgres psql -d ryder_mtaani -c "VACUUM FULL;"

# Reindex tables
sudo -u postgres psql -d ryder_mtaani -c "REINDEX DATABASE ryder_mtaani;"
```

### Log Monitoring
```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# View Laravel logs
tail -f storage/logs/laravel.log
```

Your Ryder Mtaani application is now running on PostgreSQL with all the benefits of a production-grade database system!
web: vendor/bin/heroku-php-apache2 public/
release: php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan db:seed --force --class=RyderMtaaniSeeder || true
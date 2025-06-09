#!/bin/bash

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

# Generate application key if not exists
cd /var/www
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generate APP_KEY if not set
if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" = "" ]; then
    php artisan key:generate
fi

# Run Laravel commands
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan optimize:clear

# Run migrations
php artisan migrate --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM
php-fpm

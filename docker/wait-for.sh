#!/bin/bash

# Wait for MySQL to be ready using PHP instead of netcat
echo "Waiting for MySQL to be ready..."
until php -r "
    \$maxAttempts = 30;
    \$attempt = 0;
    while (\$attempt < \$maxAttempts) {
        try {
            \$pdo = new PDO('mysql:host=mysql;port=3306', 'laravel', 'secret');
            \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo 'MySQL is ready!' . PHP_EOL;
            exit(0);
        } catch (PDOException \$e) {
            \$attempt++;
            if (\$attempt >= \$maxAttempts) {
                echo 'Failed to connect to MySQL after ' . \$maxAttempts . ' attempts' . PHP_EOL;
                exit(1);
            }
            sleep(2);
        }
    }
"; do
    echo "MySQL connection failed, retrying..."
    sleep 2
done

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

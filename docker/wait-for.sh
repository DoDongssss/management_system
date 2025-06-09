#!/bin/sh

# Wait for MySQL to be ready
until nc -z mysql 3306; do
  echo "⏳ Waiting for MySQL..."
  sleep 2
done

echo "✅ MySQL is ready. Running migrations..."
php artisan migrate --force

echo "🚀 Starting PHP-FPM..."
exec php-fpm

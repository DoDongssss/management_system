#!/bin/bash

# Set proper permissions for Laravel (run as root)
chown -R www:www /var/www/html
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage/framework/cache
chmod -R 775 /var/www/html/storage/framework/sessions
chmod -R 775 /var/www/html/storage/framework/views
chmod -R 775 /var/www/html/storage/logs

# Ensure specific files are writable
touch /var/www/html/storage/logs/laravel.log
chown www:www /var/www/html/storage/logs/laravel.log
chmod 664 /var/www/html/storage/logs/laravel.log

# Switch to www user and start PHP-FPM
exec php-fpm 
#!/bin/bash

# Set proper permissions for Laravel
chown -R www:www /var/www/html
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage/framework/cache
chmod -R 775 /var/www/html/storage/framework/sessions
chmod -R 775 /var/www/html/storage/framework/views
chmod -R 775 /var/www/html/storage/logs

# Start PHP-FPM
php-fpm 
#!/bin/bash

# Create necessary directories if they don't exist
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/bootstrap/cache

# Set ownership and permissions recursively
chown -R www:www /var/www/html
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage/framework
chmod -R 775 /var/www/html/storage/logs

# Create log file if it doesn't exist and set permissions
touch /var/www/html/storage/logs/laravel.log
chown www:www /var/www/html/storage/logs/laravel.log
chmod 664 /var/www/html/storage/logs/laravel.log

# Ensure all framework directories are writable
chmod -R 775 /var/www/html/storage/framework/cache
chmod -R 775 /var/www/html/storage/framework/sessions
chmod -R 775 /var/www/html/storage/framework/views

# Double-check ownership
chown -R www:www /var/www/html/storage
chown -R www:www /var/www/html/bootstrap/cache

# Execute the main command
exec "$@" 
#!/bin/bash

echo "🔧 Fixing Laravel permissions and common issues..."

# Function to fix permissions
fix_permissions() {
    echo "Setting comprehensive permissions..."
    
    # Create all necessary directories
    mkdir -p storage/logs
    mkdir -p storage/framework/cache
    mkdir -p storage/framework/sessions
    mkdir -p storage/framework/views
    mkdir -p storage/app/public
    mkdir -p bootstrap/cache
    mkdir -p public/storage
    
    # Set ownership to www user
    chown -R www:www /var/www/html
    
    # Set directory permissions (775 for directories)
    find /var/www/html/storage -type d -exec chmod 775 {} \;
    find /var/www/html/bootstrap/cache -type d -exec chmod 775 {} \;
    chmod 775 /var/www/html/public/build
    
    # Set file permissions (664 for files)
    find /var/www/html/storage -type f -exec chmod 664 {} \;
    find /var/www/html/bootstrap/cache -type f -exec chmod 664 {} \;
    
    # Ensure specific directories are writable
    chmod -R 775 storage/framework/cache
    chmod -R 775 storage/framework/sessions
    chmod -R 775 storage/framework/views
    chmod -R 775 storage/logs
    chmod -R 775 bootstrap/cache
    
    # Create storage link if it doesn't exist
    if [ ! -L "/var/www/html/public/storage" ]; then
        php artisan storage:link
    fi
    
    # Double-check ownership
    chown -R www:www storage
    chown -R www:www bootstrap/cache
    chown -R www:www public/storage
    
    echo "✅ Permissions fixed!"
}

# Function to clear all caches
clear_caches() {
    echo "Clearing all Laravel caches..."
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear
    php artisan optimize:clear
    echo "✅ Caches cleared!"
}

# Function to regenerate caches
regenerate_caches() {
    echo "Regenerating caches..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan optimize
    echo "✅ Caches regenerated!"
}

# Function to check and fix common issues
check_issues() {
    echo "Checking for common issues..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found, creating from .env.example..."
        cp .env.example .env
        php artisan key:generate
    fi
    
    # Check APP_KEY
    if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" = "" ]; then
        echo "⚠️  APP_KEY not set, generating..."
        php artisan key:generate
    fi
    
    # Check storage permissions
    if [ ! -w storage ]; then
        echo "⚠️  Storage directory not writable!"
        fix_permissions
    fi
    
    # Check bootstrap/cache permissions
    if [ ! -w bootstrap/cache ]; then
        echo "⚠️  Bootstrap cache not writable!"
        fix_permissions
    fi
    
    # Check storage link
    if [ ! -L "public/storage" ]; then
        echo "⚠️  Storage link missing, creating..."
        php artisan storage:link
    fi
    
    echo "✅ All checks completed!"
}

# Main execution
cd /var/www/html

echo "🚀 Starting comprehensive Laravel fix..."

# Run all fixes
check_issues
fix_permissions
clear_caches
regenerate_caches

echo "🎉 All fixes applied successfully!"
echo "Your Laravel application should now work without permission errors." 
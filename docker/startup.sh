#!/bin/bash

# Function to wait for MySQL
wait_for_mysql() {
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
}

# Function to fix permissions comprehensively
fix_permissions() {
    echo "Fixing permissions comprehensively..."
    
    cd /var/www/html
    
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
    
    echo "Permissions fixed!"
}

# Function to setup Laravel 12
setup_laravel() {
    cd /var/www/html
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
    fi
    
    # Generate APP_KEY if not set
    if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2 | tr -d '\"')" = "" ]; then
        echo "Generating application key..."
        php artisan key:generate
    fi
    
    # Fix permissions before running any commands
    fix_permissions
    
    # Clear all caches first
    echo "Clearing all caches..."
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear
    php artisan optimize:clear
    
    # Run migrations
    echo "Running migrations..."
    php artisan migrate --force
    
    # Laravel 12 specific commands
    echo "Running Laravel 12 specific setup..."
    
    # Publish any vendor assets if needed
    php artisan vendor:publish --all --force 2>/dev/null || true
    
    # Create storage link again after migrations
    php artisan storage:link
    
    # Optimize for production
    echo "Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Laravel 12 specific optimizations
    php artisan optimize
    
    # Final permission check
    fix_permissions
    
    echo "Laravel 12 setup completed!"
}

# Function to handle common errors
handle_errors() {
    echo "Checking for common issues..."
    
    cd /var/www/html
    
    # Check if .env exists and has APP_KEY
    if [ ! -f .env ]; then
        echo "ERROR: .env file not found!"
        cp .env.example .env
        php artisan key:generate
    fi
    
    # Check if storage is writable
    if [ ! -w storage ]; then
        echo "ERROR: Storage directory not writable!"
        fix_permissions
    fi
    
    # Check if bootstrap/cache is writable
    if [ ! -w bootstrap/cache ]; then
        echo "ERROR: Bootstrap cache not writable!"
        fix_permissions
    fi
    
    # Check if public/storage link exists
    if [ ! -L "public/storage" ]; then
        echo "Creating storage link..."
        php artisan storage:link
    fi
}

# Main execution
echo "Starting Laravel 12 application setup..."

# Wait for MySQL
wait_for_mysql

# Handle any common errors
handle_errors

# Setup Laravel
setup_laravel

# Final permission check before starting
fix_permissions

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm 
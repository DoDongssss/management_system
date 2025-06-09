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
    
    # Set proper permissions
    echo "Setting permissions..."
    chown -R www:www /var/www/html
    chmod -R 775 storage bootstrap/cache public/build
    
    # Laravel 12 specific optimizations
    echo "Running Laravel 12 optimizations..."
    
    # Clear all caches
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
    
    # Optimize for production
    echo "Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Laravel 12 specific optimizations
    php artisan optimize
    
    echo "Laravel 12 setup completed!"
}

# Main execution
echo "Starting Laravel 12 application setup..."

# Wait for MySQL
wait_for_mysql

# Setup Laravel
setup_laravel

# Start PHP-FPM
echo "Starting PHP-FPM..."
exec php-fpm 
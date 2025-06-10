#!/bin/sh
set -e

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ".env file created successfully!"
fi

# Generate application key if not set
if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" = "" ]; then
    echo "Generating application key..."
    php artisan key:generate --no-interaction
fi

# Cache Laravel configurations
echo "Caching Laravel configurations..."
php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

# Execute the main command
exec "$@" 
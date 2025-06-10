# Start from official PHP image with extensions
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    nodejs \
    npm \
    mysql-client \
    postgresql-dev \
    libpq-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql bcmath zip

# Install Composer globally
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-scripts

# Copy package files for Node.js
COPY package.json package-lock.json ./

# Install Node dependencies (including dev dependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Build assets (always build in container to ensure manifest exists)
RUN npm run build

# Set correct permissions
RUN chown -R www-data:www-data /var/www && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Create entrypoint script
RUN echo '#!/bin/sh' > /usr/local/bin/entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/entrypoint.sh && \
    echo 'echo "Checking for .env file..."' >> /usr/local/bin/entrypoint.sh && \
    echo 'if [ ! -f .env ]; then' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo "Creating .env file from .env.example..."' >> /usr/local/bin/entrypoint.sh && \
    echo '    cp .env.example .env' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo ".env file created successfully!"' >> /usr/local/bin/entrypoint.sh && \
    echo 'else' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo ".env file already exists"' >> /usr/local/bin/entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/entrypoint.sh && \
    echo 'echo "Checking for Vite manifest..."' >> /usr/local/bin/entrypoint.sh && \
    echo 'if [ ! -f public/build/manifest.json ]; then' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo "Building Vite assets..."' >> /usr/local/bin/entrypoint.sh && \
    echo '    npm run build' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo "Vite assets built successfully!"' >> /usr/local/bin/entrypoint.sh && \
    echo 'else' >> /usr/local/bin/entrypoint.sh && \
    echo '    echo "Vite manifest already exists"' >> /usr/local/bin/entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/entrypoint.sh && \
    echo 'php artisan config:cache' >> /usr/local/bin/entrypoint.sh && \
    echo 'php artisan route:cache' >> /usr/local/bin/entrypoint.sh && \
    echo 'php artisan view:cache' >> /usr/local/bin/entrypoint.sh && \
    echo 'exec "$@"' >> /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh

# Expose port
EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

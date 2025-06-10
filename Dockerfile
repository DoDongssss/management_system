# Multi-stage build for better optimization
FROM node:20-alpine AS node-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Main PHP application
FROM php:8.2-fpm-alpine

# Install system dependencies in one layer
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    mysql-client \
    postgresql-dev \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql bcmath zip \
    && rm -rf /var/cache/apk/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-dev --no-scripts --no-interaction

# Copy application code
COPY . .

# Copy built assets from node stage
COPY --from=node-builder /app/public/build ./public/build

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Simple entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

# Multi-stage build for Laravel 12 + React + TypeScript + Inertia

# Stage 1: Build React/TypeScript assets
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source files
COPY resources ./resources
COPY public ./public

# Build assets
RUN npm run build

# Stage 2: PHP Laravel 12 application
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    mysql-client \
    netcat-openbsd

# Install PHP extensions for Laravel 12
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        intl \
        mbstring \
        zip \
        xml \
        opcache \
        exif \
        pcntl \
        bcmath \
        gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Copy built assets from frontend stage
COPY --from=frontend-builder /app/public/build ./public/build

# Create www user
RUN addgroup -g 1000 www && adduser -u 1000 -G www -s /bin/bash -D www

# Install PHP dependencies (including dev dependencies for Pail)
RUN composer install --optimize-autoloader --no-interaction

# Create necessary directories for Laravel 12
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

# Set permissions
RUN chown -R www:www /var/www/html \
    && chmod -R 775 storage bootstrap/cache public/build

# Copy startup script
COPY docker/startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

EXPOSE 9000

CMD ["/usr/local/bin/startup.sh"]

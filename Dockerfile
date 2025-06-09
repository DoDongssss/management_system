# Stage 1: Build React assets with Node
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY resources ./resources
COPY public ./public

# Build assets
RUN npm run build

# Stage 2: PHP with Composer and Laravel
FROM php:8.2-fpm-alpine AS backend

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
    shadow \
    libzip-dev \
    mysql-client

# Install PHP extensions
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

WORKDIR /var/www/html

# Copy application files
COPY . .

# Copy built assets from Node container
COPY --from=frontend /app/public/build ./public/build

# Create www user
RUN groupadd -g 1000 www && useradd -u 1000 -g www www

# Install PHP dependencies as root
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create necessary directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www:www /var/www/html \
    && chmod -R 775 storage bootstrap/cache \
    && chmod -R 775 public/build \
    && chmod -R 775 storage/framework/cache storage/framework/sessions storage/framework/views

# Copy and set up scripts and configs
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/start.sh /usr/local/bin/start.sh
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/start.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/local/bin/start.sh"]

# --- Nginx will serve this via docker-compose ---

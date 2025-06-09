# Stage 1: Build React assets with Node
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY resources/js ./resources/js
COPY vite.config.js ./
COPY public ./public
COPY resources ./resources

RUN yarn build

# Stage 2: PHP with Composer and Laravel
FROM php:8.2-fpm-alpine AS backend

# Install dependencies
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

# PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    intl \
    mbstring \
    zip \
    xml \
    opcache \
    exif \
    pcntl \
    bcmath

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Copy built assets from Node container
COPY --from=frontend /app/public/build ./public/build

# Set permissions
RUN groupadd -g 1000 www && useradd -u 1000 -g www www
RUN chown -R www:www /var/www/html && chmod -R 775 storage bootstrap/cache

USER www

RUN composer install --no-dev --optimize-autoloader

EXPOSE 9000
CMD ["php-fpm"]

# --- Nginx will serve this via docker-compose ---

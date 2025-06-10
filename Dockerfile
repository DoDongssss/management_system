FROM php:8.3 as php

RUN apt-get update -y
RUN apt-get install -y unzip libpq-dev libcurl4-gnutls-dev dos2unix
RUN docker-php-ext-install pdo pdo_pgsql bcmath

RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - 
RUN apt-get install -y nodejs

WORKDIR /var/dir
COPY . .

COPY --from=composer:2.3.5 /usr/bin/composer /usr/bin/composer

ENV PORT=8000

RUN docker-php-ext-install mysqli pdo pdo_mysql
RUN composer update --optimize-autoloader --no-dev
RUN chmod 777 storage -R

# Fix entrypoint script permissions and line endings
RUN chmod +x docker/entrypoint.sh

ENTRYPOINT [ "docker/entrypoint.sh" ]
#!/bin/bash

echo "🚀 Setting up Docker for Laravel 12 + React + TypeScript + Inertia"
echo "=================================================================="

# Create .env.example file
echo "📝 Creating .env.example file..."
cat > .env.example << 'EOF'
APP_NAME="Laravel 12 React TypeScript Inertia"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
EOF

echo "✅ .env.example file created successfully!"

# Make scripts executable
chmod +x docker/startup.sh

echo ""
echo "🎯 Setup completed! Here's what you need to do next:"
echo ""
echo "1. 🛑 Stop any running containers:"
echo "   docker-compose down"
echo ""
echo "2. 🗑️  Remove old volumes (optional, if you want a clean start):"
echo "   docker volume prune -f"
echo ""
echo "3. 🚀 Build and start the containers:"
echo "   docker-compose up --build -d"
echo ""
echo "4. 📊 Check container status:"
echo "   docker-compose ps"
echo ""
echo "5. 📝 View logs if needed:"
echo "   docker-compose logs -f app"
echo ""
echo "🌐 Your Laravel 12 application will be available at:"
echo "   http://localhost"
echo ""
echo "📚 Database credentials:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: laravel"
echo "   Username: laravel"
echo "   Password: secret"
echo ""
echo "✨ Laravel 12 Features in this setup:"
echo "   - PHP 8.3 with all optimizations"
echo "   - Latest Laravel 12 optimizations"
echo "   - React 19 + TypeScript + Inertia"
echo "   - Vite for fast asset compilation"
echo "   - MySQL 8.0 database"
echo "   - Production-ready configuration"
echo ""
echo "✨ Happy coding with Laravel 12 + React + TypeScript + Inertia!" 
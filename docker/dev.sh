#!/bin/bash

# Laravel Docker Development Helper Script

case "$1" in
    "start")
        echo "🚀 Starting Laravel Docker environment..."
        docker-compose up -d
        echo "✅ Services started! Visit http://localhost"
        ;;
    "stop")
        echo "🛑 Stopping Laravel Docker environment..."
        docker-compose down
        echo "✅ Services stopped!"
        ;;
    "restart")
        echo "🔄 Restarting Laravel Docker environment..."
        docker-compose down
        docker-compose up -d
        echo "✅ Services restarted! Visit http://localhost"
        ;;
    "build")
        echo "🔨 Building Docker images..."
        docker-compose build --no-cache
        echo "✅ Build complete!"
        ;;
    "logs")
        echo "📋 Showing logs..."
        docker-compose logs -f
        ;;
    "migrate")
        echo "🗄️ Running migrations..."
        docker-compose exec app php artisan migrate
        ;;
    "seed")
        echo "🌱 Running seeders..."
        docker-compose exec app php artisan db:seed
        ;;
    "fresh")
        echo "🔄 Fresh install (migrate + seed)..."
        docker-compose exec app php artisan migrate:fresh --seed
        ;;
    "shell")
        echo "🐚 Opening shell in Laravel container..."
        docker-compose exec app bash
        ;;
    "mysql")
        echo "🗄️ Opening MySQL shell..."
        docker-compose exec mysql mysql -u root -proot laravel
        ;;
    *)
        echo "Laravel Docker Development Helper"
        echo ""
        echo "Usage: ./docker/dev.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  build   - Rebuild Docker images"
        echo "  logs    - Show container logs"
        echo "  migrate - Run Laravel migrations"
        echo "  seed    - Run Laravel seeders"
        echo "  fresh   - Fresh install (migrate + seed)"
        echo "  shell   - Open shell in Laravel container"
        echo "  mysql   - Open MySQL shell"
        ;;
esac 
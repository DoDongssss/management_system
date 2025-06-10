# Laravel Docker Setup (Optimized)

A simple and optimized Docker setup for Laravel development.

## 🚀 Quick Start

### Using the Helper Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x docker/dev.sh

# Start all services
./docker/dev.sh start

# Run migrations
./docker/dev.sh migrate

# Visit your app
open http://localhost
```

### Manual Commands

```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate

# Stop services
docker-compose down
```

## 📋 Available Commands

| Command                   | Description                     |
| ------------------------- | ------------------------------- |
| `./docker/dev.sh start`   | Start all services              |
| `./docker/dev.sh stop`    | Stop all services               |
| `./docker/dev.sh restart` | Restart all services            |
| `./docker/dev.sh build`   | Rebuild Docker images           |
| `./docker/dev.sh logs`    | Show container logs             |
| `./docker/dev.sh migrate` | Run Laravel migrations          |
| `./docker/dev.sh seed`    | Run Laravel seeders             |
| `./docker/dev.sh fresh`   | Fresh install (migrate + seed)  |
| `./docker/dev.sh shell`   | Open shell in Laravel container |
| `./docker/dev.sh mysql`   | Open MySQL shell                |

## 🔧 Services

- **Laravel App**: PHP-FPM 8.2 with all required extensions
- **Nginx**: Web server (port 80)
- **MySQL**: Database (port 3306)

## 🎯 Optimizations Made

### Dockerfile

- ✅ **Multi-stage build**: Separate Node.js build stage
- ✅ **Combined RUN commands**: Fewer layers, smaller image
- ✅ **Optimized caching**: Better layer caching
- ✅ **Removed Node.js from final image**: Only built assets copied

### Docker Compose

- ✅ **Simplified configuration**: Removed unnecessary options
- ✅ **Cleaner environment variables**: Standard Laravel defaults
- ✅ **Better service naming**: Consistent container names

### Entrypoint Script

- ✅ **Simplified logic**: Essential tasks only
- ✅ **Automatic key generation**: No manual setup needed
- ✅ **Better error handling**: Cleaner output

## 📁 File Structure

```
├── docker/
│   ├── dev.sh              # Helper script
│   ├── entrypoint.sh       # Container entrypoint
│   └── nginx/conf.d/
│       └── default.conf    # Nginx configuration
├── Dockerfile              # Optimized multi-stage build
├── docker-compose.yml      # Simplified services
└── README-Docker.md        # This file
```

## 🔄 Development Workflow

1. **Start services**: `./docker/dev.sh start`
2. **Run migrations**: `./docker/dev.sh migrate`
3. **Develop**: Edit files locally, changes reflect immediately
4. **View logs**: `./docker/dev.sh logs`
5. **Stop when done**: `./docker/dev.sh stop`

## 🐛 Troubleshooting

### Rebuild everything

```bash
./docker/dev.sh build
./docker/dev.sh start
```

### Check logs

```bash
./docker/dev.sh logs
```

### Access container shell

```bash
./docker/dev.sh shell
```

### Reset database

```bash
./docker/dev.sh fresh
```

## 🎉 Benefits

- **Faster builds**: Multi-stage build reduces final image size
- **Simpler commands**: Helper script for common tasks
- **Better caching**: Optimized layer ordering
- **Cleaner setup**: Removed unnecessary complexity
- **Easier maintenance**: Fewer files, simpler configuration

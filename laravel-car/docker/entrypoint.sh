#!/bin/sh
set -e

# Default PORT if not provided by Render
PORT="${PORT:-10000}"
export PORT

echo "==> Starting Car Shop Backend on port $PORT..."

# Substitute environment variables into Nginx configuration
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Ensure storage link exists
php artisan storage:link || true

# Ensure permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Run migrations and seeders if database is connected
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "==> Running database migrations..."
    php artisan migrate --force || echo "Warning: Migration failed or database not ready yet."

    echo "==> Running database initial seeder..."
    php artisan db:seed --class=InitialDataSeeder --force || echo "Warning: Seeder skipped."
fi

# Optimize Laravel
echo "==> Optimizing Laravel cache..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM in background
echo "==> Launching PHP-FPM..."
php-fpm -D

# Start Nginx in foreground
echo "==> Launching Nginx..."
exec nginx -g "daemon off;"

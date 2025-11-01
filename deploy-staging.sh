#!/bin/bash

# Script de despliegue para ambiente de staging
# Uso: ./deploy-staging.sh

set -e

echo "🚀 Iniciando despliegue a staging..."

# 1. Variables de configuración
APP_NAME="restaurante-staging"
PORT=3001
DB_NAME="restaurante_staging"

# 2. Crear directorio si no existe
mkdir -p /tmp/staging

# 3. Backup de base de datos actual (si existe)
if docker ps -q -f name=${DB_NAME} | grep -q .; then
    echo "💾 Creando backup de base de datos..."
    docker exec ${DB_NAME} pg_dump -U app appdb > /tmp/staging/backup_$(date +%Y%m%d_%H%M%S).sql
fi

# 4. Detener servicios actuales
echo "⏹️  Deteniendo servicios actuales..."
docker compose -f docker-compose.staging.yml down || true

# 5. Construir nuevas imágenes
echo "🔨 Construyendo imágenes..."
docker compose -f docker-compose.staging.yml build

# 6. Iniciar servicios
echo "▶️  Iniciando servicios..."
docker compose -f docker-compose.staging.yml up -d

# 7. Esperar a que la aplicación esté lista
echo "⏳ Esperando a que la aplicación esté lista..."
sleep 10

# 8. Ejecutar migraciones de Prisma
echo "🗄️  Ejecutando migraciones de base de datos..."
docker compose -f docker-compose.staging.yml exec -T web npm run prisma:generate
docker compose -f docker-compose.staging.yml exec -T web npm run prisma:migrate --name staging-deploy

# 9. Ejecutar seeds
echo "🌱 Ejecutando seeds..."
docker compose -f docker-compose.staging.yml exec -T web npm run seed

# 10. Verificar health check
echo "🏥 Verificando health check..."
if curl -f http://localhost:${PORT}/health; then
    echo "✅ Health check exitoso"
else
    echo "❌ Health check falló"
    exit 1
fi

# 11. Mostrar información de despliegue
echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📊 Información del despliegue:"
echo "   🌐 URL: http://localhost:${PORT}"
echo "   🏥 Health: http://localhost:${PORT}/health"
echo "   📊 Admin: http://localhost:${PORT}/admin"
echo ""
echo "🛠️  Comandos útiles:"
echo "   Ver logs: docker compose -f docker-compose.staging.yml logs -f web"
echo "   Reiniciar: docker compose -f docker-compose.staging.yml restart"
echo "   Detener: docker compose -f docker-compose.staging.yml down"
echo ""
echo "✅ Staging desplegado correctamente"

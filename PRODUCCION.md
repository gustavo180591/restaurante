# Guía de Despliegue a Producción - Restaurante

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Puerto 80/443 disponibles en el servidor
- Dominio apuntando al servidor (opcional)

## 🚀 Despliegue con Docker Compose

### 1. Clonar repositorio
```bash
git clone <url-repositorio>
cd restaurante
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.production
# Editar .env.production con valores de producción
```

**Variables críticas para producción:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://usuario:password@db:5432/restaurantedb?schema=public
STORAGE_DRIVER=disk  # o "s3" para producción
DISK_UPLOAD_DIR=./storage/uploads
PORT=3000
```

### 3. Construir e iniciar servicios
```bash
# Construir imágenes
docker compose -f docker/docker-compose.yml build

# Iniciar servicios en segundo plano
docker compose -f docker/docker-compose.yml up -d

# Ver logs
docker compose -f docker/docker-compose.yml logs -f web
```

### 4. Ejecutar migraciones y seeds
```bash
# Conectar al contenedor de la aplicación
docker compose -f docker/docker-compose.yml exec web npm run prisma:generate
docker compose -f docker/docker-compose.yml exec web npm run prisma:migrate --name production
docker compose -f docker/docker-compose.yml exec web npm run seed
```

## 🌐 Despliegue con Reverse Proxy (Nginx)

### Archivo de configuración Nginx (`nginx.conf`):
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Redirect HTTP to HTTPS (opcional)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # SSL Configuration (necesitas certificados)
    ssl_certificate /etc/ssl/certs/restaurante.crt;
    ssl_certificate_key /etc/ssl/private/restaurante.key;

    # Proxy to SvelteKit app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Static files caching (opcional)
    location /_app/ {
        proxy_pass http://localhost:3000/_app/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 Comandos Útiles de Administración

### Reiniciar servicios
```bash
docker compose -f docker/docker-compose.yml restart
```

### Ver logs
```bash
# Todos los servicios
docker compose -f docker/docker-compose.yml logs -f

# Solo web
docker compose -f docker/docker-compose.yml logs -f web

# Solo base de datos
docker compose -f docker/docker-compose.yml logs -f db
```

### Backup de base de datos
```bash
# Crear backup
docker compose -f docker/docker-compose.yml exec db pg_dump -U app appdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose -f docker/docker-compose.yml exec -T db psql -U app appdb < backup.sql
```

### Actualizar aplicación
```bash
# Detener servicios
docker compose -f docker/docker-compose.yml down

# Obtener últimos cambios
git pull origin main

# Reconstruir e iniciar
docker compose -f docker/docker-compose.yml up -d --build
```

## 🔒 Seguridad en Producción

### 1. Variables de entorno seguras
- Nunca commitear `.env.production` al repositorio
- Usar secretos de Docker o variables de entorno del sistema
- Rotar credenciales regularmente

### 2. Configuración de red
```bash
# Exponer solo puertos necesarios
docker compose -f docker/docker-compose.yml up -d
# No exponer puerto de base de datos (5432) al exterior
```

### 3. SSL/TLS
- Usar Let's Encrypt para certificados gratuitos
- Configurar HSTS headers
- Mantener certificados actualizados

### 4. Monitoreo básico
```bash
# Health check automático
curl -f https://tu-dominio.com/health || alertar_administrador

# Logs de errores
docker compose -f docker/docker-compose.yml logs web | grep ERROR
```

## 📊 Monitoreo y Logs

### Health Check
El contenedor incluye health check automático:
- Endpoint: `GET /health`
- Intervalo: 30 segundos
- Timeout: 3 segundos
- Retries: 3

### Logs estructurados
```bash
# Ver logs recientes con timestamps
docker compose -f docker/docker-compose.yml logs --tail=100 web

# Logs en tiempo real
docker compose -f docker/docker-compose.yml logs -f -t web
```

## 🚨 Solución de Problemas

### Problema: Aplicación no inicia
```bash
# Ver logs detallados
docker compose -f docker/docker-compose.yml logs web

# Verificar variables de entorno
docker compose -f docker/docker-compose.yml exec web env | grep NODE_ENV

# Verificar conectividad a base de datos
docker compose -f docker/docker-compose.yml exec web npm run prisma:generate
```

### Problema: Base de datos no accesible
```bash
# Verificar estado de servicios
docker compose -f docker/docker-compose.yml ps

# Ver logs de base de datos
docker compose -f docker/docker-compose.yml logs db

# Reiniciar solo base de datos
docker compose -f docker/docker-compose.yml restart db
```

### Problema: Archivos subidos no visibles
```bash
# Verificar permisos de directorio
docker compose -f docker/docker-compose.yml exec web ls -la storage/uploads/

# Verificar configuración STORAGE_DRIVER
docker compose -f docker/docker-compose.yml exec web env | grep STORAGE
```

## 🔄 Estrategia de Actualizaciones

### Actualizaciones menores (parches)
1. `git pull origin main`
2. `docker compose -f docker/docker-compose.yml up -d --build`
3. Verificar funcionamiento: `curl -f https://tu-dominio.com/health`

### Actualizaciones mayores (nuevas versiones)
1. Hacer backup de base de datos
2. Probar en ambiente de staging primero
3. Desplegar siguiendo pasos de "Actualizar aplicación"
4. Verificar funcionamiento completo
5. Rollback si es necesario usando el backup

## 📞 Soporte

Para problemas críticos:
1. Verificar logs: `docker compose -f docker/docker-compose.yml logs web`
2. Verificar health check: `curl https://tu-dominio.com/health`
3. Reiniciar servicios si es necesario
4. Revisar logs de base de datos si persiste el problema

**Estado**: ✅ Sistema completo listo para producción

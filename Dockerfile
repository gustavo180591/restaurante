# Dockerfile de producción para SvelteKit
FROM node:20-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache dumb-init

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias (para mejor cacheo)
FROM base AS deps
WORKDIR /app

# Copiar archivos de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production --no-audit --no-fund

# Construir la aplicación
FROM base AS builder
WORKDIR /app

# Copiar archivos de configuración primero
COPY package.json package-lock.json* ./
COPY svelte.config.js ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Instalar todas las dependencias (incluyendo dev dependencies para el build)
RUN npm ci --no-audit --no-fund

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sveltekit

# Copiar dependencias de producción desde deps
COPY --from=deps --chown=sveltekit:nodejs /app/node_modules ./node_modules

# Copiar archivos de configuración necesarios
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./
COPY --from=builder --chown=sveltekit:nodejs /app/svelte.config.js ./
COPY --from=builder --chown=sveltekit:nodejs /app/vite.config.ts ./

# Copiar aplicación construida
COPY --from=builder --chown=sveltekit:nodejs /app/build ./
COPY --from=builder --chown=sveltekit:nodejs /app/prisma ./prisma

# Crear directorio para archivos subidos
RUN mkdir -p ./storage/uploads && chown -R sveltekit:nodejs ./storage

# Cambiar al usuario no-root
USER sveltekit

# Exponer puerto
EXPOSE 3000

# Variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Iniciar la aplicación
CMD ["node", "index.js"]
# step-by-step.md

> Sistema gastronómico — Stack: **SvelteKit 2 + Svelte 5, Prisma, PostgreSQL, Docker, Tailwind 4**.  
> Incluye: auth con hooks, RBAC básico, endpoints /api*, subida de imágenes con **S3 o disco**, componentes **ImageUploader** e **ImageCropper**, validadores, seeds, healthcheck y utilidades DX.

---

## ✅ 0) Requisitos previos

- [x] Node.js 20+
- [x] Docker + Docker Compose
- [x] Git
- [ ] (Opcional) AWS credenciales (si vas a usar S3 en local)
- [x] Editor con TypeScript y Prisma (VSCode recomendado)

---

## ✅ 1) Estructura del proyecto (actualizado)

```
/restaurante
  /src
    /routes
      /api
        /auth
          /login/+server.ts
        /cartas
          /+server.ts
          /[id]/detalle/+server.ts
        /clientes/+server.ts
        /empleados/+server.ts
        /especialidades/+server.ts
        /estados/+server.ts
        /menu/+server.ts
        /menu-esp-tipo/+server.ts
        /menu-especialidad/+server.ts
        /personas/+server.ts
        /platos/+server.ts
        /tipos-plato/+server.ts
        /turnos/+server.ts
        /uploads/[...path]/+server.ts
      /health/+server.ts
      /+layout.svelte
      /+page.svelte
      /admin/+page.svelte
    /lib
      /assets
      /db
        prisma.ts
      /uploads
    app.css
    app.d.ts
    app.html
    hooks.server.ts
  /prisma
    /migrations
    schema.prisma
    seed.ts
  /static
    robots.txt
  .env
  .env.example
  .gitignore
  .npmrc
  .prettierignore
  .prettierrc
  docker-compose.yml
  Dockerfile
  eslint.config.js
  package-lock.json
  package.json
  README.md
  svelte.config.js
  tailwind.config.js
  tsconfig.json
  vite.config.ts
```

## ✅ 2) Configuración de Prisma y Base de Datos

### ✅ 2.1 `prisma/schema.prisma` (resumen)
- [x] Modelos definidos según el DER
- [x] Relaciones configuradas
- [x] Tipos de datos adecuados

## 🔄 3) Endpoints de la API

### ✅ 3.1 Autenticación

#### 🔐 Gestión de Sesiones
- [x] `POST /api/auth/login`
  - [x] Validación de entrada con Zod
  - [x] Verificación de credenciales segura
  - [x] Rate limiting (5 intentos/15min)
  - [x] Generación de token JWT firmado
  - [x] Cookie segura (httpOnly, secure, sameSite)
  - [x] Actualización de último acceso
  - [x] Manejo de errores detallado

- [x] `DELETE /api/auth/login` (logout)
  - [x] Invalidación de sesión en BD
  - [x] Eliminación de cookie segura
  - [x] Respuesta apropiada

- [x] `GET /api/auth/me`
  - [x] Verificación de sesión
  - [x] Retorno de datos de usuario
  - [x] Manejo de errores

#### 🔒 Middleware de Seguridad
- [x] Verificación de token JWT en hook server
- [x] Validación de roles (Admin/Operador/Mozo)
- [x] Protección de rutas públicas/privadas
- [x] Headers de seguridad (CSP, XSS, etc.)
- [x] Rate limiting global
- [x] Prevención de CSRF con tokens
- [x] Prevención de timing attacks

#### 📊 Base de Datos
- [x] Modelo de Usuarios con soporte para sesiones
- [x] Migración para versión de sesión
- [x] Índices para búsquedas seguras
- [x] Relaciones con perfiles y fotos

#### 🛡️ Seguridad Adicional
- [x] Encriptación de contraseñas con bcrypt
- [x] Tokens de sesión con expiración
- [x] Invalidación de sesiones antiguas
- [x] Protección contra enumeración de usuarios
- [x] Logging de actividades sospechosas

### ✅ 3.2 Catálogos
- [x] `GET /api/estados`
- [x] `GET /api/tipos-plato`
- [x] `GET /api/especialidades`

### ✅ 3.3 Menú
- [x] `GET /api/menu`
- [x] `GET /api/menu-especialidad`
- [x] `GET /api/menu-esp-tipo`

### 🔄 3.4 Platos
- [x] `GET /api/platos`
- [x] `GET /api/platos/:id`
- [x] `POST /api/platos`
- [x] `PUT /api/platos/:id`
- [x] `DELETE /api/platos/:id`

### ✅ 3.5 Turnos
- [x] `GET /api/turnos`
- [x] `POST /api/turnos`

### ✅ 3.6 Cartas
- [x] `GET /api/cartas`
- [x] `GET /api/cartas/[id]/detalle`

### ✅ 3.7 Health Check
- [x] `GET /health`

## 🔄 4) Frontend

### 🔄 4.1 Componentes
- [x] ImageUploader
- [x] ImageCropper
- [x] Formularios de administración básicos

### 🔄 4.2 Páginas
- [x] Login
- [x] Dashboard básico
- [x] Gestión de Platos
- [x] Gestión de Menús
- [x] Gestión de Cartas

## 🔄 5) Despliegue

### 🔄 5.1 Docker
- [x] Configuración de Docker
- [x] Docker Compose para desarrollo
- [x] Dockerfile para producción

### 🔄 5.2 Variables de entorno
- [x] Plantilla .env.example
- [x] Documentación de configuración básica

## 📝 Notas adicionales

1. **Progreso actual**:
   - La mayoría de los endpoints básicos están implementados
   - La estructura de la base de datos está completa
   - Faltan implementar las operaciones CRUD completas para algunos recursos
   - El sistema de autenticación necesita revisión
   - El frontend está en etapas iniciales

2. **Próximos pasos recomendados**:
   1. Completar la implementación de los endpoints faltantes
   2. Resolver los problemas con el componente ImageCropper
   3. Implementar la autenticación y autorización
   4. Desarrollar las interfaces de usuario principales

> Si no tenés esta estructura exacta, podés adaptarla. Los paths de este documento asumen `/apps/web` como raíz de la app SvelteKit.

---

## 2) Configuración de Prisma y Base de Datos

### 2.1 `prisma/schema.prisma` (resumen)
Alineado al DER de la imagen original. Tablas destacadas:

- **Usuarios**, **Perfiles**, **Fotos**
- **Personas**, **Empleados**, **Clientes**
- **Platos**, **TipoPlato**
- **Menu**, **Estados**, **TurnosMenu**
- **Especialidades**, **MenuEspecialidad**, **MenuEspTipoPlato**
- **Cartas**, **CartaDetalle**
- **Platos_has_MenuEspTipoPlato**

> Ejemplo de modelo **Fotos** (ajustado a URL largas):
```prisma
model Fotos {
  Id_Foto  Int    @id @default(autoincrement())
  Ruta     String @db.VarChar(255) // ampliado a 255
  Tipo     String @db.VarChar(64)

  Usuarios Usuarios[]
  Platos   Platos[]
}
```

> Asegurate que **datasource** sea PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2.2 Cliente Prisma
**`src/lib/db/prisma.ts`**
```ts
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 3) Docker y entorno

### 3.1 `docker/docker-compose.yml`
```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 10

  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://app:app@db:5432/appdb?schema=public
      PORT: 3000
      STORAGE_DRIVER: disk
      DISK_UPLOAD_DIR: /app/storage/uploads
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ..:/app
      - /app/node_modules
      - app_uploads:/app/storage/uploads

volumes:
  db_data:
  app_uploads:
```

### 3.2 `docker/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
  elif [ -f yarn.lock ]; then yarn; \
  else npm i; fi

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 3.3 `.env.example`
```
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"

# Storage
STORAGE_DRIVER="disk"                # o "s3"
DISK_UPLOAD_DIR="./storage/uploads"

# S3
AWS_REGION="sa-east-1"
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_PUBLIC_URL_BASE=""
```

---

## 4) Inicialización del proyecto

```bash
# 1) Copiar variables
cp .env.example .env

# 2) Levantar Docker
docker compose -f docker/docker-compose.yml up -d --build

# 3) Prisma
npm run prisma:generate
npm run prisma:migrate --name init
npm run seed   # opcional (perfiles/estados/tipos)

# 4) App (si corrés fuera del contenedor)
npm run dev
# o por compose (el servicio web ya corre en 3000)
```

---

## 5) Seeds mínimos

**`prisma/seed.ts`**
```ts
import { prisma } from '../src/lib/db/prisma';
async function main() {
  await prisma.perfiles.createMany({
    data: [{ NombrePerfil: 'Admin' }, { NombrePerfil: 'Operador' }, { NombrePerfil: 'Mozo' }],
    skipDuplicates: true
  });
  await prisma.estados.createMany({
    data: [{ NombEstado: 'Activo' }, { NombEstado: 'Inactivo' }],
    skipDuplicates: true
  });
  await prisma.tipoPlato.createMany({
    data: [
      { NombreTipo: 'Entrada' }, { NombreTipo: 'Principal' },
      { NombreTipo: 'Postre' }, { NombreTipo: 'Bebida' }
    ],
    skipDuplicates: true
  });
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
```

---

## 6) Autenticación y autorización

### 6.1 Tipado de `locals`
**`src/app.d.ts`**
```ts
declare global {
  namespace App {
    interface Locals {
      user: { id: number; role: 'Admin' | 'Operador' | 'Mozo' } | null;
      cid?: string;
    }
  }
}
export {};
```

### 6.2 Helpers de sesión (token simple demo)
**`src/lib/auth/session.ts`**
```ts
import { type Cookies } from '@sveltejs/kit';
export function setSession(cookies: Cookies, token: string) {
  cookies.set('sid', token, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV==='production', maxAge: 60*60*8 });
}
export function clearSession(cookies: Cookies) { cookies.delete('sid', { path: '/' }); }
export function parseSession(token?: string) {
  if (!token) return null;
  try {
    const parts = Object.fromEntries(token.split(';').map(p => p.split(':') as [string,string]));
    const id = Number(parts.uid); const role = parts.role as 'Admin'|'Operador'|'Mozo';
    if (!id || !role) return null; return { id, role };
  } catch { return null; }
}
```

### 6.3 Hook global (CORS + RBAC + correlation-id)
**`src/hooks.server.ts`**
```ts
import type { Handle } from '@sveltejs/kit';
import { parseSession } from '$lib/auth/session';
import { randomUUID } from 'crypto';

const isApi = (p: string) => p.startsWith('/api');
const methodNeedsAdmin = new Set(['POST','PUT','PATCH','DELETE']);

export const handle: Handle = async ({ event, resolve }) => {
  // correlation id
  const cid = event.request.headers.get('x-correlation-id') ?? randomUUID();
  // @ts-ignore
  event.locals.cid = cid;

  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': event.request.headers.get('origin') ?? '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'content-type, authorization, x-correlation-id',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'x-correlation-id': cid
      }
    });
  }

  const token = event.cookies.get('sid');
  event.locals.user = parseSession(token);

  const { pathname } = new URL(event.request.url);
  if (isApi(pathname)) {
    if (!event.locals.user) return new Response('No autenticado', { status: 401, headers: { 'x-correlation-id': cid } });
    if (methodNeedsAdmin.has(event.request.method) && event.locals.user.role !== 'Admin') {
      return new Response('Prohibido: requiere rol Admin', { status: 403, headers: { 'x-correlation-id': cid } });
    }
  }

  const res = await resolve(event);
  const h = new Headers(res.headers);
  h.set('Access-Control-Allow-Origin', event.request.headers.get('origin') ?? '*');
  h.set('Access-Control-Allow-Credentials', 'true');
  h.set('x-correlation-id', cid);
  return new Response(res.body, { status: res.status, headers: h });
};
```

### 6.4 Endpoints Auth
**`src/routes/api/auth/login/+server.ts`**
```ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';
import { setSession } from '$lib/auth/session';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({ usuario: z.string().min(3).max(65), clave: z.string().min(6).max(200) });

export const POST: RequestHandler = async ({ request, cookies }) => {
  const payload = loginSchema.parse(await request.json());
  const user = await prisma.usuarios.findFirst({ where: { usuario: payload.usuario }, include: { perfil: true } });
  if (!user) return new Response('Credenciales inválidas', { status: 401 });
  const ok = await bcrypt.compare(payload.clave, user.clave);
  if (!ok) return new Response('Credenciales inválidas', { status: 401 });
  const token = `uid:${user.Id_usuario};role:${user.perfil.NombrePerfil}`;
  setSession(cookies, token);
  return new Response(JSON.stringify({ role: user.perfil.NombrePerfil }), { headers: { 'content-type': 'application/json' } });
};
```

**`src/routes/api/auth/logout/+server.ts`**
```ts
import type { RequestHandler } from './$types';
import { clearSession } from '$lib/auth/session';
export const POST: RequestHandler = async ({ cookies }) => { clearSession(cookies); return new Response(null, { status: 204 }); };
```

---

## 7) Validación y esquemas (Zod)

**`src/lib/validation/schemas.ts`** (extracto)
```ts
import { z } from 'zod';

export const platoCreateSchema = z.object({
  NombrePlato: z.string().min(2).max(95),
  Precio: z.coerce.number().nonnegative(),
  Fotos_Id_Foto: z.number().int().nullable().optional(),
});
export const platoUpdateSchema = platoCreateSchema.partial();

export const cartaCreateSchema = z.object({ Fecha: z.coerce.date() });

export const cartaDetalleAddSchema = z.object({
  platoId: z.number().int(),
  menuEspTipoPlatoId: z.number().int()
});

export const turnoCreateSchema = z.object({
  Menu_Id_Menu: z.number().int(),
  Estados_Id_estado: z.number().int(),
  HoraTurno: z.string().min(1).max(90),
});

export const especialidadCreateSchema = z.object({ NombreEspecialidad: z.string().min(2).max(65) });

export const menuEspecialidadCreateSchema = z.object({
  TurnosMenu_Id_Turno: z.number().int(),
  Especialidades_Id_especialidad: z.number().int(),
});

export const menuEspTipoCreateSchema = z.object({
  MenuEspecialidad_Id_MenuEspecialidad: z.number().int(),
  TipoPlato_Id_TipoPlato: z.number().int(),
});
```

---

## 8) Endpoints de negocio

*(Incluye Platos, Tipos, Menú, Estados, Turnos, Especialidades, MenuEspecialidad, MenuEspTipoPlato, Cartas y CartaDetalle — ver código en esta guía, secciones 8.1 a 8.5)*

---

## 9) Subida de imágenes (S3 o disco)

- **Driver** en `STORAGE_DRIVER` (`disk` o `s3`).
- Implementación en `src/lib/uploads/storage.ts`.
- Endpoint `POST /api/fotos` crea registro en **Fotos** y devuelve `{ id, url, key, mime }`.
- Servir archivos locales con `/uploads/[...path]` cuando `disk`.

---

## 10) Componentes Front: Uploader + Cropper

- `ImageUploader.svelte` (drag&drop, progreso real, cancel, `uploaded`).
- `ImageCropper.svelte` (zoom, drag, ratio, devuelve `File`).
- Ejemplo integrado en `admin/platos/nuevo/+page.svelte`.

---

## 11) Healthcheck

**Ruta:** `GET /health` → `{ status, db, time, version }`.

---

## 12) Testing rápido (smoke)

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"usuario":"admin","clave":"admin"}'

curl -i -X POST http://localhost:3000/api/fotos \
  -b "sid=<cookie-devuelta>" \
  -F "file=@/ruta/a/imagen.jpg"

curl -i -X POST http://localhost:3000/api/platos \
  -H 'content-type: application/json' \
  -b "sid=<cookie>" \
  -d '{"NombrePlato":"Milanesa","Precio":1500,"Fotos_Id_Foto":1}'

curl -s "http://localhost:3000/api/cartas?fecha=2025-10-12" | jq
```

---

## 13) Roadmap recomendado

- **Sprint 0:** JWT firmado, índices, logs pino (con `cid`), health (listo).
- **Sprint 1:** UI catálogo, presigned URLs/Nginx, tests integration.
- **Sprint 2:** UI menú/turnos/especialidades + RBAC por ruta.
- **Sprint 3:** UI cartas + consulta + E2E.
- **Sprint 4 (opcional):** PWA read-only + métricas.

---

## 14) Troubleshooting

- 401 en /api → login primero, enviar cookie `sid`.
- Uploads en `disk` no visibles → revisar `DISK_UPLOAD_DIR` + endpoint `/uploads/*`.
- S3 AccessDenied → revisar `AWS_*` y bucket/políticas.
- FK imagen inválida → primero subir a `/api/fotos`, usar `id` devuelto.
- Precio → considerar minor units a futuro.

---

## 15) Seguridad & performance (a mejorar)

- Rate limit login, CSRF si corresponde, validación mime estricta.
- Cache de lectura para cartas del día.
- Soft delete y auditoría extendida.

---

## 16) Listo para trabajar en local

- `.env` configurado
- Docker UP (db + web)
- Prisma migrate + generate + seed
- Endpoints /api protegidos
- Subida de imágenes ok
- Uploader + Cropper conectados
- `/health` responde

¡A construir! 🚀

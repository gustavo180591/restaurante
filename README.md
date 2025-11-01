# 🍽️ Restaurante App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=flat&logo=svelte&logoColor=FF3E00)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)](https://www.prisma.io/)

Una aplicación web moderna para gestión de restaurantes, construida con SvelteKit, TypeScript y Prisma. Este proyecto incluye características como menú digital, carrito de compras y gestión de pedidos.

## ✨ Características

- 🍕 Menú digital interactivo con categorías
- 🛒 Carrito de compras en tiempo real
- 🔍 Búsqueda de productos
- 📱 Diseño responsivo
- ⚡ Optimizado para rendimiento
- 🔄 Actualizaciones en tiempo real
- 🔐 Autenticación segura
- 📊 Panel de administración

## 🚀 Empezando

### Requisitos previos

- Node.js 18+
- npm o yarn
- PostgreSQL
- Docker (opcional, para desarrollo con contenedores)

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/restaurante.git
   cd restaurante
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus credenciales
   ```

4. Inicia la base de datos (usando Docker):
   ```bash
   docker-compose up -d
   ```

5. Ejecuta las migraciones:
   ```bash
   npx prisma migrate dev
   ```

6. Inicializa la base de datos con datos de prueba:
   ```bash
   npm run seed
   ```

7. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

8. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🛠️ Tecnologías utilizadas

- **Frontend**: SvelteKit, Tailwind CSS
- **Backend**: Node.js, SvelteKit API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Session-based auth
- **Testing**: Vitest, Playwright
- **Despliegue**: Docker, Vercel/Netlify

## 📂 Estructura del proyecto

```
restaurante/
├── src/
│   ├── lib/           # Código compartido
│   ├── routes/        # Rutas de la aplicación
│   ├── app.d.ts       # Tipos globales
│   └── app.html       # Plantilla HTML principal
├── prisma/           # Esquemas y migraciones
├── tests/            # Pruebas
├── static/           # Archivos estáticos
└── docker/           # Configuración de Docker
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, lee nuestras [pautas de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## 📞 Contacto

¿Tienes preguntas o sugerencias? ¡No dudes en abrir un issue o ponerte en contacto con nosotros!

---

Hecho con ❤️ por [Tu Nombre]
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
# restaurante

import { handleErrorWithSentry, init } from '@sentry/sveltekit';
import { dev } from '$app/environment';

// Inicializar Sentry
init({
  dsn: process.env.SENTRY_DSN || 'your-sentry-dsn-here',
  environment: dev ? 'development' : 'production',
  tracesSampleRate: dev ? 1.0 : 0.1, // 100% en dev, 10% en prod
  profilesSampleRate: dev ? 1.0 : 0.1,

  // Configuración específica para SvelteKit
  integrations: [], // Simplificado por ahora

  // Configurar rastreo de errores en producción
  beforeSend(event, hint) {
    // Filtrar errores conocidos o no críticos
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;

        // Ignorar errores específicos
        if (
          message.includes('Network request failed') ||
          message.includes('Script error') ||
          message.includes('Non-Error promise rejection captured')
        ) {
          return null;
        }
      }
    }

    return event;
  },

  // Configurar contexto adicional
  initialScope: {
    tags: {
      component: 'restaurante-app',
      version: process.env.npm_package_version || '1.0.0',
    },
  },
});

// Si necesitas más control sobre el manejo de errores
export const handleError = handleErrorWithSentry();

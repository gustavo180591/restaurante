import * as Sentry from '@sentry/sveltekit';

// Utilidades para monitoreo personalizado
export const monitoring = {
  // Registrar errores específicos de negocio
  logBusinessError(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'business_logic');
      scope.setLevel('warning');

      if (context) {
        scope.setContext('business_context', context);
      }

      Sentry.captureException(error);
    });
  },

  // Registrar métricas de performance
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setTag('metric_type', 'performance');
      scope.setLevel('info');

      scope.setContext('performance', {
        operation,
        duration_ms: duration,
        ...metadata,
      });

      Sentry.captureMessage(`Performance: ${operation}`, 'info');
    });
  },

  // Registrar eventos de usuario
  logUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setTag('event_type', 'user_action');
      scope.setLevel('info');

      if (userId) {
        scope.setUser({ id: userId });
      }

      scope.setContext('action_details', {
        action,
        ...metadata,
      });

      Sentry.captureMessage(`User Action: ${action}`, 'info');
    });
  },

  // Configurar usuario para rastreo
  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  },

  // Limpiar contexto de usuario
  clearUser() {
    Sentry.setUser(null);
  },

  // Agregar breadcrumb para rastreo detallado
  addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel, data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      data,
    });
  },

  // Configurar contexto adicional
  setContext(key: string, context: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setContext(key, context);
    });
  },

  // Capturar mensaje personalizado
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom_context', context);
      }
      Sentry.captureMessage(message, level);
    });
  },
};

// Decoradores para monitoreo automático de funciones
export function withMonitoring<T extends (...args: any[]) => Promise<any>>(fn: T, operationName?: string): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const operation = operationName || fn.name || 'anonymous_function';

    try {
      monitoring.addBreadcrumb(`Starting ${operation}`, 'performance', 'info', { args_count: args.length });

      const result = await fn(...args);

      const duration = Date.now() - startTime;
      monitoring.logPerformance(operation, duration, { success: true });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      monitoring.logPerformance(operation, duration, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }) as T;
}

// Función para inicializar monitoreo en producción
export function initProductionMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    // Configurar monitoreo específico de producción
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,

      // Configuración específica para producción
      beforeSend(event, hint) {
        // En producción, filtrar más estrictamente
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as Error).message;

            // Ignorar errores de red comunes en producción
            if (
              message.includes('fetch') ||
              message.includes('NetworkError') ||
              message.includes('Failed to fetch')
            ) {
              return null;
            }
          }
        }

        return event;
      },

      // Configurar release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA,

      // Distribuir entre ambientes
      dist: process.env.VERCEL_ENV || process.env.NODE_ENV,
    });
  }
}

export default monitoring;

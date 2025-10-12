import { error, type RequestEvent } from '@sveltejs/kit';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator: (event: RequestEvent) => string;
  message: string;
}

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  return (event: RequestEvent) => {
    const key = options.keyGenerator(event);
    const currentTime = Date.now();
    
    // Limpiar entradas antiguas
    for (const [k, v] of store.entries()) {
      if (v.resetTime <= currentTime) {
        store.delete(k);
      }
    }

    const record = store.get(key) || { count: 0, resetTime: currentTime + options.windowMs };
    
    if (record.resetTime <= currentTime) {
      // Reiniciar el contador si la ventana de tiempo ha expirado
      record.count = 1;
      record.resetTime = currentTime + options.windowMs;
    } else {
      // Incrementar el contador
      record.count += 1;
    }

    store.set(key, record);

    // Establecer encabezados de rate limit
    event.setHeaders({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': Math.max(0, options.max - record.count).toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
    });

    // Lanzar error si se excede el límite
    if (record.count > options.max) {
      const retryAfter = Math.ceil((record.resetTime - currentTime) / 1000);
      event.setHeaders({
        'Retry-After': retryAfter.toString()
      });
      throw error(429, options.message);
    }
  };
}

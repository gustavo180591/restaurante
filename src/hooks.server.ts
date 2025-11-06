import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { getSession, sessionCookieAttributes } from '$lib/server/auth';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = new Set([
  '/',
  '/auth/login',
  '/auth/register',
  '/recuperar-contrasena',
  '/health',
  '/favicon.ico',
  '/api/auth/'
]);

export const handle: Handle = async ({ event, resolve }) => {
  // Configurar ID de correlación
  const cid = event.request.headers.get('x-correlation-id') ?? randomUUID();
  event.locals.cid = cid;
  event.locals.user = null;
  event.locals.sessionId = null;

  // Obtener sesión de la cookie
  const { name: cookieName } = sessionCookieAttributes();
  const sessionId = event.cookies.get(cookieName);
  
  if (sessionId) {
    try {
      const session = await getSession(sessionId);
      if (session) {
        const { user } = session;
        event.locals.user = {
          id: user.id,
          email: user.email,
          dni: user.dni,
          name: user.name,
          role: user.role
        };
        event.locals.sessionId = sessionId;
      } else {
        // Eliminar cookie de sesión inválida
        event.cookies.delete(cookieName, { path: '/' });
      }
    } catch (error) {
      console.error(`[${cid}] Error al obtener la sesión:`, error);
      event.cookies.delete(cookieName, { path: '/' });
    }
  }

  // Verificar si la ruta es pública
  const currentPathname = event.url.pathname;
  const isRoutePublic = Array.from(PUBLIC_ROUTES).some(route => 
    currentPathname === route || 
    currentPathname.startsWith(route) ||
    currentPathname.startsWith('/api/auth/')
  );

  // Si la ruta no es pública y no hay usuario, redirigir al login
  if (!isRoutePublic && !event.locals.user) {
    const url = new URL('/auth/login', event.url.origin);
    url.searchParams.set('redirectTo', event.url.pathname);
    return new Response('Redirect', {
      status: 302,
      headers: { Location: url.toString() }
    });
  }

  // Continuar con la solicitud
  const response = await resolve(event);
  
  // Agregar encabezados de seguridad
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-xss-protection', '1; mode=block');
  
  return response;
};
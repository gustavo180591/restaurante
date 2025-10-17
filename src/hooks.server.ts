import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { SESSION_COOKIE_NAME, parseSessionToken } from '$lib/auth/session';
import { prisma } from '$lib/db/prisma';

const PUBLIC_ROUTES = new Set(['/', '/auth/login', '/health']);
const needsAdmin = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const handle: Handle = async ({ event, resolve }) => {
  // Configurar ID de correlación
  const cid = event.request.headers.get('x-correlation-id') ?? randomUUID();
  event.locals.cid = cid;
  event.locals.user = null;

  // Manejar sesión
  const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
  
  if (sessionToken) {
    const sessionData = parseSessionToken(sessionToken);
    
    if (sessionData) {
      // Verificar la versión de la sesión
      const user = await prisma.usuarios.findUnique({
        where: { Id_usuario: sessionData.id },
        select: { 
          Id_usuario: true, 
          Perfiles_Id_Perfil: true, 
          sessionVersion: true 
        }
      });

      if (user && user.sessionVersion === sessionData.sessionVersion) {
        event.locals.user = {
          id: user.Id_usuario,
          role: user.Perfiles_Id_Perfil === 1 ? 'Admin' : 
                user.Perfiles_Id_Perfil === 2 ? 'Operador' : 'Mozo',
          sessionVersion: user.sessionVersion
        };
      } else {
        // Sesión inválida o expirada
        event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
      }
    }
  }

  // Verificar autenticación para rutas protegidas
  const { pathname } = new URL(event.request.url);
  const isPublicRoute = Array.from(PUBLIC_ROUTES).some(route => pathname.startsWith(route));
  
  if (!isPublicRoute && !event.locals.user) {
    return new Response(
      JSON.stringify({ error: 'No autenticado' }), 
      { 
        status: 401, 
        headers: { 
          'content-type': 'application/json',
          'x-correlation-id': cid 
        } 
      }
    );
  }

  // Verificar permisos de administrador
  if (needsAdmin.has(event.request.method) && event.locals.user?.role !== 'Admin' && !pathname.startsWith('/api/auth/register')) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }), 
      { 
        status: 403, 
        headers: { 
          'content-type': 'application/json',
          'x-correlation-id': cid 
        } 
      }
    );
  }

  // Procesar la solicitud
  const response = await resolve(event);
  
  // Agregar encabezados de seguridad
  response.headers.set('x-correlation-id', cid);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-xss-protection', '1; mode=block');
  
  return response;
};

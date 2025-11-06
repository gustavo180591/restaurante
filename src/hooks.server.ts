import type { Handle } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { verifySession } from '$lib/server/jwt';
import { prisma } from '$lib/db/prisma';
import { getTokenFromCookies, deleteSessionCookie } from '$lib/server/auth/utils';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/register',
  '/health',
  '/favicon.ico'
]);

// Tipos para el usuario autenticado
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        roles: string[];
        sessionVersion: number;
      } | null;
      cid: string;
    }
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  // Configurar ID de correlación
  const cid = event.request.headers.get('x-correlation-id') ?? randomUUID();
  event.locals.cid = cid;
  event.locals.user = null;

  // Obtener token de la cookie
  const token = getTokenFromCookies(event.cookies);
  
  if (token) {
    try {
      console.log('Found session token, verifying...');
      
      // Verificar el token JWT
      const payload = await verifySession(token);
      
      // Buscar usuario en la base de datos
      const userId = parseInt(payload.sub);
      if (isNaN(userId)) {
        console.error('Invalid user ID in token:', payload.sub);
        event.cookies.delete('session', { path: '/' });
        return resolve(event);
      }
      
      const user = await prisma.usuarios.findUnique({
        where: { Id_usuario: userId },
        include: {
          Clientes: {
            select: { Id_Cliente: true },
            take: 1
          },
          Empleados: {
            select: { Id_empleado: true },
            take: 1
          }
        }
      });

      // Validar usuario
      if (user && user.activo && user.sessionVersion === payload.sv) {
        // Verificar que tenga al menos un perfil (Cliente o Empleado)
        const hasProfile = (user.Clientes && user.Clientes.length > 0) || 
                         (user.Empleados && user.Empleados.length > 0);
        
        if (hasProfile) {
          // Usar el rol del usuario directamente del modelo
          event.locals.user = {
            id: user.Id_usuario.toString(),
            roles: [user.rol],
            sessionVersion: user.sessionVersion
          };
        } else {
          // Usuario sin perfil válido
          console.warn(`[${cid}] User ${user.Id_usuario} has no associated profile`);
          event.cookies.delete('session', { path: '/' });
        }
      } else if (user && !user.activo) {
        // Usuario inactivo
        console.warn(`[${cid}] Inactive user login attempt: ${user.Id_usuario}`);
        event.cookies.delete('session', { path: '/' });
      } else if (user && user.sessionVersion !== payload.sv) {
        // Versión de sesión desactualizada (cerrada en otro dispositivo)
        console.warn(`[${cid}] Session version mismatch for user: ${user.Id_usuario}`);
        event.cookies.delete('session', { path: '/' });
      }
    } catch (error) {
      // Token inválido o expirado
      console.error(`[${cid}] Invalid session token:`, error);
      event.cookies.delete('session', { path: '/' });
    }
  }

  // Verificar autenticación para rutas protegidas
  const { pathname } = new URL(event.request.url);
  const isPublicRoute = Array.from(PUBLIC_ROUTES).some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Manejar rutas de API
  if (pathname.startsWith('/api/') && !isPublicRoute) {
    if (!event.locals.user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'No autenticado' 
        }), 
        { 
          status: 401,
          headers: { 
            'content-type': 'application/json',
            'x-correlation-id': cid 
          }
        }
      );
    }
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

import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { SESSION_COOKIE_NAME, createSessionToken } from '$lib/auth/session';
import { invalidateSession } from '$lib/auth/session';
import { rateLimit } from '$lib/security/rate-limit';

// Configuración de rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por ventana de tiempo
  keyGenerator: (event) => {
    // Usamos la IP + user-agent como clave para el rate limiting
    const ip = event.getClientAddress();
    const userAgent = event.request.headers.get('user-agent') || '';
    return `${ip}-${userAgent}`;
  },
  message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo más tarde.'
});

const loginSchema = z.object({
  usuario: z.string().min(3).max(65).trim(),
  clave: z.string().min(6).max(200)
});

// Función para simular un retraso aleatorio
const randomDelay = () => new Promise(resolve => 
  setTimeout(resolve, 100 + Math.random() * 200)
);

export const POST: RequestHandler = async (event) => {
  // Aplicar rate limiting
  // Aplicar rate limiting
  // Aplicar rate limiting
  try {
    loginLimiter(event);
  } catch (error) {
    const rateLimitError = error as { status?: number; message: string; retryAfter?: string };
    if (rateLimitError.status === 429) {
      return new Response(
        JSON.stringify({ error: rateLimitError.message }), 
        { 
          status: 429, 
          headers: { 
            'content-type': 'application/json',
            'Retry-After': rateLimitError.retryAfter || '60'
          } 
        }
      );
    }
    throw error;
  }

  try {
    // Añadir retraso aleatorio para prevenir timing attacks
    await randomDelay();
    
    // Validar entrada
    const payload = loginSchema.parse(await event.request.json());
    
    // Buscar usuario con su perfil y foto
    const user = await prisma.usuarios.findFirst({
      where: { 
        usuario: payload.usuario,
        activo: true
      },
      include: { 
        perfil: true,  // Relación con Perfiles
        foto: true     // Relación con Fotos
      }
    });

    // Añadir retraso adicional si el usuario no existe o la contraseña es incorrecta
    // Esto ayuda a prevenir ataques de enumeración de usuarios
    if (!user || !(await bcrypt.compare(payload.clave, user?.clave || ''))) {
      await randomDelay();
      return new Response(
        JSON.stringify({ error: 'Usuario o contraseña incorrectos' }), 
        { 
          status: 401, 
          headers: { 
            'content-type': 'application/json',
            'X-RateLimit-Remaining': event.request.headers.get('X-RateLimit-Remaining') || '0'
          } 
        }
      );
    }

    // Invalidar sesiones anteriores
    await invalidateSession(user.Id_usuario);

    // Crear token de sesión con la versión actual
    const sessionToken = createSessionToken({
      id: user.Id_usuario,
      role: user.perfil.NombrePerfil as 'Admin' | 'Operador' | 'Mozo',
      email: user.email || undefined,
      userAgent: event.request.headers.get('user-agent') || '',
      ip: event.getClientAddress(),
      sessionVersion: user.sessionVersion
    });

    // Establecer cookie de sesión segura
    event.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
      priority: 'high',
      // Considerar agregar 'partitioned' si se usa SameSite=None
    });

    // Actualizar último acceso
    await prisma.$transaction([
      prisma.usuarios.update({
        where: { Id_usuario: user.Id_usuario },
        data: { 
          ultimoAcceso: new Date(),
          // Incrementar el contador de inicios de sesión si es necesario
          // loginCount: { increment: 1 }
        }
      }),
      // Aquí podrías agregar un registro de auditoría
      // prisma.auditLog.create({
      //   data: {
      //     action: 'LOGIN',
      //     userId: user.Id_usuario,
      //     ip: event.getClientAddress(),
      //     userAgent: event.request.headers.get('user-agent') || ''
      //   }
      // })
    ]);

    return new Response(
      JSON.stringify({ 
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.Id_usuario,
          usuario: user.usuario,
          email: user.email,
          perfil: user.perfil.NombrePerfil,
          foto: user.foto ? user.foto.Ruta : null
        }
      }),
      { 
        status: 200,
        headers: { 
          'content-type': 'application/json',
          'X-RateLimit-Remaining': event.request.headers.get('X-RateLimit-Remaining') || '0'
        } 
      }
    );
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    
    // Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Datos de entrada inválidos',
          details: error.issues // Usamos 'issues' en lugar de 'errors' en Zod v3+
        }), 
        { 
          status: 400, 
          headers: { 'content-type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Error en el servidor',
        // En desarrollo, podríamos incluir más detalles
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Error desconocido'
        })
      }), 
      { 
        status: 500, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
};

// Endpoint para cerrar sesión
export const DELETE: RequestHandler = async ({ cookies, locals }) => {
  try {
    if (locals.user) {
      await invalidateSession(locals.user.id);
    }
    
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return new Response(
      JSON.stringify({ error: 'Error al cerrar sesión' }), 
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};

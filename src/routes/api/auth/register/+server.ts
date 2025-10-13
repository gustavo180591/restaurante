import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '$lib/auth/session';
import { SESSION_COOKIE_NAME } from '$lib/auth/session';
import { rateLimit } from '$lib/security/rate-limit';

// Configuración de rate limiting
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 registros por hora por IP
  keyGenerator: (event) => {
    const ip = event.getClientAddress();
    const userAgent = event.request.headers.get('user-agent') || '';
    return `${ip}-${userAgent}`;
  },
  message: 'Demasiados intentos de registro. Por favor, intente de nuevo más tarde.'
});

const registerSchema = z.object({
  dni: z.string().min(8).max(20).trim(),
  nombres: z.string().min(2).max(100).trim(),
  apellidos: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  telefono: z.string().max(20).trim().optional(),
  usuario: z.string().min(3).max(65).trim(),
  clave: z.string().min(6).max(200)
});

export const POST: RequestHandler = async (event) => {
  try {
    // Aplicar rate limiting
    registerLimiter(event);

    const data = await event.request.json();
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      return json(
        { error: 'Datos de registro inválidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { dni, nombres, apellidos, email, telefono, usuario, clave } = result.data;

    // Verificar si el DNI ya existe
    const dniExists = await prisma.usuarios.findFirst({
      where: { dni: { equals: dni, mode: 'insensitive' } }
    });

    if (dniExists) {
      return json(
        { error: 'El DNI ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const userExists = await prisma.usuarios.findFirst({
      where: { 
        OR: [
          { usuario: { equals: usuario, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } }
        ]
      }
    });

    if (userExists) {
      return json(
        { error: 'El nombre de usuario o correo electrónico ya está en uso' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(clave, 10);

    // Crear el usuario
    const user = await prisma.usuarios.create({
      data: {
        dni,
        nombres,
        apellidos,
        email,
        telefono: telefono || null,
        usuario,
        clave: hashedPassword,
        Perfiles_Id_Perfil: 3, // Asignar perfil de cliente por defecto
        sessionVersion: 1 // Iniciar versión de sesión
      }
    });

    // Crear token de sesión
    const sessionToken = createSessionToken({
      id: user.Id_usuario,
      sessionVersion: user.sessionVersion
    });

    // Devolver respuesta exitosa sin iniciar sesión automáticamente
    return json(
      { message: 'Usuario registrado exitosamente' },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.status === 429) {
      return json(
        { error: error.message },
        { 
          status: 429,
          headers: { 'Retry-After': error.retryAfter || '3600' }
        }
      );
    }

    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

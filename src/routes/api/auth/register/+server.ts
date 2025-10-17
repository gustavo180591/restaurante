import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
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

    // Verificar si el DNI ya existe en personas
    const dniExists = await prisma.personas.findFirst({
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

    // Usar transacción para asegurar consistencia de datos
    await prisma.$transaction(async (tx) => {
      // Crear la persona primero
      const persona = await tx.personas.create({
        data: {
          dni,
          nombres,
          Apellidos: apellidos,
          email,
          Telefono: telefono || '',
          genero: 1 // Valor por defecto, ajustar según necesidades
        }
      });

      // Crear el usuario
      const user = await tx.usuarios.create({
        data: {
          usuario,
          clave: hashedPassword,
          email,
          Perfiles_Id_Perfil: 3, // Asignar perfil de cliente por defecto
          sessionVersion: 1 // Iniciar versión de sesión
        }
      });

      // Crear el cliente que vincula persona y usuario
      const cliente = await tx.clientes.create({
        data: {
          Personas_Id_Persona: persona.Id_Persona,
          Usuarios_Id_usuario: user.Id_usuario
        }
      });

      return { persona, user, cliente };
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

    if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
      const rateLimitError = error as { status: number; message: string; retryAfter?: string };
      return json(
        { error: rateLimitError.message },
        {
          status: 429,
          headers: { 'Retry-After': rateLimitError.retryAfter || '3600' }
        }
      );
    }

    return json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
};

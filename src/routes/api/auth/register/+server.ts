import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { rateLimit } from '$lib/security/rate-limit';
import { createSessionToken } from '$lib/auth/session';
import { createSession } from '$lib/server/auth/session';

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
  telefono: z.string().max(20).trim(),
  direccion: z.string().max(255).optional(),
  genero: z.number().int().positive(),
  clave: z.string().min(6).max(200),
  confirmarClave: z.string().min(6).max(200)
}).refine((data) => data.clave === data.confirmarClave, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarClave']
});

export const POST: RequestHandler = async (event) => {
  try {
    // Aplicar rate limiting
    registerLimiter(event);

    const data = await event.request.json();
    
    // Normalize field names to handle case variations
    const normalizedData = {
      dni: data.dni,
      nombres: data.nombres,
      apellidos: data.apellidos || data.apellido, // Handle both 'apellidos' and 'apellido'
      email: data.email,
      telefono: data.telefono || data.teléfono, // Handle both 'telefono' and 'teléfono'
      direccion: data.direccion || data.dirección, // Handle both 'direccion' and 'dirección'
      genero: data.genero,
      clave: data.clave,
      confirmarClave: data.confirmarClave || data.clave // Make confirmarClave optional by defaulting to clave
    };

    const result = registerSchema.safeParse(normalizedData);

    if (!result.success) {
      console.error('Validation error:', result.error);
      return json(
        { 
          error: 'Datos de registro inválidos', 
          details: result.error.flatten(),
          receivedData: data // Include received data for debugging
        },
        { status: 400 }
      );
    }

    const { dni, nombres, apellidos, email, telefono, direccion, genero, clave } = result.data;
    
    // Set default role
    const rol = 'cliente';

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

    // Verificar si el correo ya existe
    const emailExists = await prisma.usuarios.findFirst({
      where: { 
        email: { equals: email, mode: 'insensitive' }
      }
    });

    if (emailExists) {
      return json(
        { error: 'El correo electrónico ya está en uso' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (clave.length < 8) {
      return json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Hash the password with a cost factor of 12 (recommended for production)
    const hashedPassword = await bcrypt.hash(clave, 12);

    // Usar transacción para asegurar consistencia de datos
    return await prisma.$transaction(async (tx) => {
      // Crear la persona primero
      // Crear la persona primero con perfil de cliente (Id_Perfil = 3)
      // Create the person record
      const persona = await tx.personas.create({
        data: {
          dni,
          nombres,
          Apellidos: apellidos,
          email,
          Telefono: telefono,
          genero,
          direccion: direccion || null,
          rol: 'CLIENTE', // Use the role from above
        }
      });

      // Crear el usuario usando el email como nombre de usuario
      // Create the user record
      const user = await tx.usuarios.create({
        data: {
          usuario: email, // Use email as username
          clave: hashedPassword,
          email,
          activo: true, // Ensure user is active by default
          sessionVersion: 1, // Start session version
          // Remove any reference to Perfiles_Id_Perfil
           fotoId: null,  // Explicitly set to null as it's optional
        }
      });

      // Crear el cliente que vincula persona y usuario
      const cliente = await tx.clientes.create({
        data: {
           Personas_Id_Persona: persona.Id_Persona,
        usuarioId: user.id  
        }
      });

      // Create session for the new user
    const sessionToken = createSessionToken({
      id: user.id,
      role: user.rol as 'Admin' | 'Operador' | 'Mozo',
    email: user.email || undefined,
      userAgent: event.request.headers.get('user-agent') || '',
      ip: event.getClientAddress(),
      sessionVersion: user.sessionVersion || 1
    });
      // Get user data for the response
      const userData = {
  id: user.id,  // Changed from user.Id_usuario to user.id
  email: user.email,
  usuario: user.usuario,
  rol: rol
};
      
      // Return the response with session cookie
      const response = json(
        { 
          message: 'Usuario registrado exitosamente',
          user: userData
        },
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Set the session cookie with proper attributes
      response.headers.set(
        'Set-Cookie',
        `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax` + 
        (process.env.NODE_ENV === 'production' ? '; Secure' : '')
      );
      
      return response;
    });

  } catch (error) {
    console.error('Error en registro:', error);

    if (error && typeof error === 'object' && 'status' in error) {
      if (error.status === 429) {
        const rateLimitError = error as { status: number; message: string; retryAfter?: string };
        return json(
          { error: rateLimitError.message },
          {
            status: 429,
            headers: { 'Retry-After': rateLimitError.retryAfter || '3600' }
          }
        );
      }
    }

    // More detailed error handling
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Registration error details:', error);
    
    return json(
      { 
        error: 'Error en el registro',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
};

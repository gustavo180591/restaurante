import { json, type RequestHandler } from '@sveltejs/kit';
import { compare } from 'bcryptjs';
import { prisma } from '$lib/db/prisma';
import { createSessionCookie } from '$lib/server/auth/utils';

// Tipos para la respuesta de login
type LoginResponse = {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string | null;
        username: string;
        roles: string[];
    };
};

// Esquema de validación para el body de la petición
const loginSchema = {
    email: (value: string) => {
        if (!value) return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo electrónico inválido';
        return null;
    },
    password: (value: string) => {
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
    }
};

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        let email: string;
        let password: string;
        let rememberMe = false;

        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const data = await request.json();
            email = data.email;
            password = data.password;
            rememberMe = data.rememberMe || false;
        } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            email = formData.get('email') as string;
            password = formData.get('password') as string;
            rememberMe = formData.get('remember-me') === 'on';
        } else {
            return json(
                { success: false, message: 'Content-Type must be application/json or multipart/form-data' },
                { status: 400 }
            );
        }

        // Validar campos
        const emailError = loginSchema.email(email);
        const passwordError = loginSchema.password(password);
        
        if (emailError || passwordError) {
            return json(
                { success: false, message: emailError || passwordError },
                { status: 400 }
            );
        }

        console.log('Attempting login for email:', email);
        
        // Buscar usuario por email o nombre de usuario
        const user = await prisma.usuarios.findFirst({
            where: {
                OR: [
                    { email: email },
                    { usuario: email }  // También permite iniciar sesión con nombre de usuario
                ]
            },
            include: {
                clientes: { 
                    select: { Id_Cliente: true },
                    take: 1 
                },
                empleados: { 
                    select: { Id_empleado: true },
                    take: 1 
                }
            }
        });
        
        console.log('User found:', user ? 'Yes' : 'No');

        // Validar credenciales sin revelar si el usuario existe
        if (!user) {
            console.log('No user found with email/username:', email);
            return json(
                { success: false, message: 'Credenciales inválidas' },
                { status: 401 }
            );
        }
        
        const passwordMatch = await compare(password, user.clave);
        if (!passwordMatch) {
            console.log('Invalid password for user:', user.id);
            return json(
                { success: false, message: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return json(
                { success: false, message: 'Usuario inactivo' },
                { status: 403 }
            );
        }

        // Verificar que tenga al menos un perfil (Cliente o Empleado)
        const hasProfile = user.clientes.length > 0 || user.empleados.length > 0;
        if (!hasProfile) {
            return json(
                { success: false, message: 'Usuario sin perfil asociado (Cliente/Empleado)' },
                { status: 403 }
            );
        }

        // Obtener roles del usuario
        const roles = [user.rol];
        const userId = user.id.toString(); 

        // Crear el token de sesión (asumiendo que el usuario tiene una propiedad sessionVersion)
        const sessionCookie = await createSessionCookie(userId, user.sessionVersion || 1, roles);
        
        // Crear la respuesta primero
        const response = json({
        success: true,
    message: 'Inicio de sesión exitoso',
    user: {
        id: user.id.toString(),  // Changed from userId to user.id
        email: user.email,
        username: user.usuario,
        roles: [user.rol]
    }
});

        // Establecer la cookie en la respuesta
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            // No especificar el dominio para que funcione en localhost
        };
        
        console.log('Setting session cookie with options:', cookieOptions);
        cookies.set(sessionCookie.name, sessionCookie.value, cookieOptions);

        return response;
    } catch (error) {
        console.error('Login error:', error);
        
        // Manejo de errores genérico
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};

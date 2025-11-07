import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import { createSessionCookie } from '$lib/server/auth/utils';
import { logError } from '$lib/server/utils/errorHandler';

class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

interface UserSession {
    id: string;
    name: string | null;
    email: string;
    role: string;
    dni: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        // 1. Obtener datos del formulario
        console.log('Headers:', Object.fromEntries(request.headers.entries()));
        const requestBody = await request.text();
        console.log('Raw request body:', requestBody);
        
        let email: string | undefined;
        let password: string | undefined;
        
        try {
            const data = JSON.parse(requestBody);
            email = data.email;
            password = data.password;
            console.log('Parsed login data:', { email: email ? 'present' : 'missing', password: password ? 'present' : 'missing' });
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            throw new AuthenticationError('Formato de solicitud inválido');
        }

        if (!email || !password) {
            throw new AuthenticationError('Email y contraseña son requeridos');
        }

        // 2. Buscar usuario
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) {
            console.log('No user found with email:', email);
            throw new AuthenticationError('Credenciales inválidas');
        }

        // 3. Comparar contraseñas (en producción, usar bcrypt o similar)
        // NOTA: En un entorno de producción, NUNCA almacenes contraseñas en texto plano
        // Este es solo un ejemplo básico y debe ser reemplazado con hashing seguro
        const validPassword = user.password === password.trim();
        
        if (!validPassword) {
            console.log('Invalid password for user:', email);
            throw new AuthenticationError('Credenciales inválidas');
        }

        // 4. Crear sesión
        // Convertir el ID a string si es necesario
        const userId = user.id;
        // Usamos 1 como versión de sesión inicial
        const sessionCookie = await createSessionCookie(userId.toString(), 1, [user.role]);
        
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        // 5. Devolver datos del usuario (sin información sensible)
        const userData: UserSession = {
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            dni: user.dni
        };

        return json({
            success: true,
            user: userData
        });

    } catch (error: unknown) {
        if (error instanceof AuthenticationError) {
            return json(
                { success: false, message: error.message },
                { status: 401 }
            );
        }
        
        // Registrar el error en el servidor
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        await logError({
            error: new Error(errorMessage),
            context: 'Login failed',
            metadata: { email: 'user@example.com' }
        });
        
        return json(
            { 
                success: false, 
                message: 'Error en el servidor',
                // En desarrollo, incluir más detalles del error
                ...(process.env.NODE_ENV === 'development' && { 
                    error: errorMessage,
                    stack: errorStack
                })
            },
            { status: 500 }
        );
    }
};
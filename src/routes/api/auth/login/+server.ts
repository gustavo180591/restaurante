import { json, error, type RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || process.env.JWT_SECRET;

const prisma = new PrismaClient();

interface LoginResponse {
    success: boolean;
    message?: string;
    user?: {
        id: number;
        username: string;
        email: string | null;
        profile: {
            Id_Perfil: number;
            NombrePerfil: string;
        };
        persona?: {
            nombres: string;
            apellidos: string;
            email: string | null;
        } | null;
        foto: string | null;
    };
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const formData = await request.formData();
        const usuario = formData.get('usuario') as string;
        const clave = formData.get('clave') as string;

        if (!usuario || !clave) {
            throw error(400, 'Usuario y contraseña son requeridos');
        }

        // Buscar el usuario en la base de datos
        const user = await prisma.usuarios.findFirst({
            where: { usuario },
            include: {
                Perfiles: true,
                Empleados: {
                    include: {
                        Personas: true
                    }
                },
                Clientes: {
                    include: {
                        Personas: true
                    }
                },
                Fotos: true
            }
        });

        // Verificar si el usuario existe
        if (!user) {
            throw error(401, 'Usuario o contraseña incorrectos');
        }

        // Verificar la contraseña
        const passwordMatch = await compare(clave, user.clave);
        if (!passwordMatch) {
            throw error(401, 'Usuario o contraseña incorrectos');
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            throw error(403, 'Tu cuenta ha sido desactivada. Contacta al administrador.');
        }

        // Crear el token JWT con jose
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({
            userId: user.Id_usuario,
            username: user.usuario,
            profileId: user.Perfiles_Id_Perfil,
            sessionVersion: user.sessionVersion
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);

        // Configurar la cookie de sesión
        cookies.set('session', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 semana
        });

        // Actualizar último acceso
        await prisma.usuarios.update({
            where: { Id_usuario: user.Id_usuario },
            data: {
                ultimoAcceso: new Date()
            }
        });

        // Obtener datos de la persona (puede ser de Empleado o Cliente)
        let personaData = null;
        if (user.Empleados?.length > 0 && user.Empleados[0].Personas) {
            const persona = user.Empleados[0].Personas;
            personaData = {
                nombres: persona.nombres || '',
                apellidos: persona.Apellidos || '', // Note: Capital A in Apellidos
                email: persona.email || null
            };
        } else if (user.Clientes?.length > 0 && user.Clientes[0].Personas) {
            const persona = user.Clientes[0].Personas;
            personaData = {
                nombres: persona.nombres || '',
                apellidos: persona.Apellidos || '', // Note: Capital A in Apellidos
                email: persona.email || null
            };
        }

        // Devolver información básica del usuario (sin datos sensibles)
        const response: LoginResponse = {
            success: true,
            user: {
                id: user.Id_usuario,
                username: user.usuario,
                email: user.email,
                profile: {
                    Id_Perfil: user.Perfiles.Id_Perfil,
                    NombrePerfil: user.Perfiles.NombrePerfil
                },
                persona: personaData,
                foto: user.Fotos ? user.Fotos.Ruta : null
            }
        };
        
        return json(response);

    } catch (err: any) {
        console.error('Login error:', err);
        const errorResponse: LoginResponse = {
            success: false,
            message: err.message || 'Error al iniciar sesión'
        };
        return json(errorResponse, { status: err.status || 500 });
    }
}

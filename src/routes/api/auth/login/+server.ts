import { json, error } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

const prisma = new PrismaClient();

export async function POST({ request, cookies }) {
    try {
        const formData = await request.formData();
        const usuario = formData.get('usuario') as string;
        const clave = formData.get('clave') as string;

        if (!usuario || !clave) {
            throw error(400, 'Usuario y contraseña son requeridos');
        }

        // Buscar el usuario en la base de datos
        const user = await prisma.usuarios.findUnique({
            where: { usuario },
            include: {
                Perfiles: true,
                Personas: true,
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

        // Crear el token JWT
        const token = sign(
            {
                userId: user.Id_usuario,
                username: user.usuario,
                profileId: user.Perfiles_Id_Perfil,
                sessionVersion: user.sessionVersion
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

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

        // Devolver información básica del usuario (sin datos sensibles)
        return json({
            success: true,
            user: {
                id: user.Id_usuario,
                username: user.usuario,
                email: user.email,
                profile: user.Perfiles,
                persona: user.Personas ? {
                    nombres: user.Personas.nombres,
                    apellidos: user.Personas.Apellidos,
                    email: user.Personas.email
                } : null,
                foto: user.Fotos ? user.Fotos.Ruta : null
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return json(
            { success: false, message: err.message || 'Error al iniciar sesión' },
            { status: err.status || 500 }
        );
    }
}

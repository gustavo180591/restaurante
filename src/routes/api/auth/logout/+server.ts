import { json, type RequestHandler } from '@sveltejs/kit';
import { deleteSessionCookie } from '$lib/server/auth/utils';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // Eliminar la cookie de sesión
        cookies.delete('session', { path: '/' });
        
        return json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return json(
            { success: false, message: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
};

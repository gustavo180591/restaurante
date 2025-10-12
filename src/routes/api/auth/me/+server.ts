import { prisma } from '$lib/db/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: 'No autenticado' }), 
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    const user = await prisma.usuarios.findUnique({
      where: { Id_usuario: locals.user.id },
      select: {
        Id_usuario: true,
        usuario: true,
        email: true,
        activo: true,
        ultimoAcceso: true,
        perfil: {
          select: {
            Id_Perfil: true,
            NombrePerfil: true
          }
        },
        foto: {
          select: {
            Id_Foto: true,
            Ruta: true
          }
        }
      }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }), 
        { status: 404, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        id: user.Id_usuario,
        usuario: user.usuario,
        email: user.email,
        activo: user.activo,
        ultimoAcceso: user.ultimoAcceso,
        perfil: {
          id: user.perfil.Id_Perfil,
          nombre: user.perfil.NombrePerfil
        },
        foto: user.foto ? {
          id: user.foto.Id_Foto,
          ruta: user.foto.Ruta
        } : null
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
};

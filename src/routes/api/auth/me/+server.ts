import { prisma } from '$lib/db/prisma';
import type { RequestHandler } from './$types';
import type { Rol } from '@prisma/client';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: 'No autenticado' }), 
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    // Get user with their related data
    const user = await prisma.usuarios.findUnique({
      where: { Id_usuario: locals.user.id },
      include: {
        Fotos: {
          select: {
            Id_Foto: true,
            Ruta: true
          }
        },
        Clientes: {
          include: {
            Personas: {
              select: {
                Id_Persona: true,
                nombres: true,
                Apellidos: true,
                rol: true,
                email: true,
                Telefono: true,
                direccion: true
              }
            }
          }
        },
        Empleados: {
          include: {
            Personas: {
              select: {
                Id_Persona: true,
                nombres: true,
                Apellidos: true,
                rol: true,
                email: true,
                Telefono: true,
                direccion: true
              }
            }
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

    // Update last access time
    await prisma.usuarios.update({
      where: { Id_usuario: user.Id_usuario },
      data: { ultimoAcceso: new Date() }
    });

    // Get persona data from either Clientes or Empleados
    const personaData = user.Clientes[0]?.Personas || user.Empleados[0]?.Personas;
    
    // Determine the user's role
    let role: Rol = 'cliente';
    if (user.Empleados.length > 0) {
      role = user.Empleados[0].Personas.rol;
    } else if (user.Clientes.length > 0) {
      role = user.Clientes[0].Personas.rol;
    }
    
    return new Response(
      JSON.stringify({
        id: user.Id_usuario,
        usuario: user.usuario,
        email: user.email || (personaData?.email || null),
        activo: user.activo,
        ultimoAcceso: user.ultimoAcceso,
        rol: role,
        personaId: personaData?.Id_Persona || null,
        nombres: personaData?.nombres || null,
        apellidos: personaData?.Apellidos || null,
        telefono: personaData?.Telefono || null,
        direccion: personaData?.direccion || null
      }),
      { 
        status: 200, 
        headers: { 
          'content-type': 'application/json',
          'cache-control': 'no-store, max-age=0'
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener los datos del usuario',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }), 
      { 
        status: 500, 
        headers: { 
          'content-type': 'application/json',
          'cache-control': 'no-store, max-age=0'
        } 
      }
    );
  }
};

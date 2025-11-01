import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Esquema de validación para actualización
const menuUpdateSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  descripcion: z.string().max(500).optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  activo: z.boolean().optional(),
  estadoId: z.number().int().positive().optional()
});

// Obtener un menú específico por ID
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    const menuId = parseInt(id);
    if (isNaN(menuId)) {
      throw error(400, 'ID de menú inválido');
    }

    // Obtener el menú con toda su información
    const menu = await prisma.menu.findUnique({
      where: {
        Id_Menu: menuId
      },
      include: {
        Estados: true,
        Turnos: true,
        MenuEspecialidad: {
          include: {
            especialidad: true,
            MenuEspTipoPlato: {
              include: {
                tipoPlato: true,
                Platos_has_MenuEspTipoPlato: {
                  include: {
                    plato: {
                      include: {
                        foto: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!menu) {
      throw error(404, 'Menú no encontrado');
    }

    // Formatear respuesta detallada
    const menuFormateado = {
      id: menu.Id_Menu,
      nombre: menu.NombreMenu,
      descripcion: menu.Descripcion,
      fecha: menu.Fecha?.toISOString().split('T')[0] || null,
      activo: menu.Activo,
      estado: menu.Estados?.NombEstado || 'Pendiente',
      turno: menu.Turnos ? {
        id: menu.Turnos.Id_Turno,
        nombre: menu.Turnos.Nombre,
        horaInicio: menu.Turnos.HoraInicio,
        horaFin: menu.Turnos.HoraFin
      } : null,
      especialidades: menu.MenuEspecialidad.map(me => ({
        id: me.Id_MenuEspecialidad,
        especialidad: {
          id: me.especialidad.Id_especialidad,
          nombre: me.especialidad.NombreEspecialidad
        },
        tiposPlato: me.MenuEspTipoPlato.map(metp => ({
          id: metp.Id_MenuEspTipoPlato,
          tipoPlato: {
            id: metp.tipoPlato.Id_TipoPlato,
            nombre: metp.tipoPlato.NombreTipo
          },
          platos: metp.Platos_has_MenuEspTipoPlato.map(phmetp => ({
            id: phmetp.Id_PlatoCarta,
            plato: {
              id: phmetp.plato.Id_Plato,
              nombre: phmetp.plato.NombrePlato,
              precio: phmetp.plato.Precio,
              descripcion: phmetp.plato.Descripcion,
              foto: phmetp.plato.foto ? {
                id: phmetp.plato.foto.Id_Foto,
                ruta: phmetp.plato.foto.Ruta
              } : null
            }
          }))
        }))
      }))
    };

    return json(menuFormateado);

  } catch (err: any) {
    console.error('Error al obtener el menú:', err);

    if (err.status) {
      throw err; // Re-lanzar errores conocidos
    }

    throw error(500, 'Error interno del servidor');
  }
};

// Actualizar un menú específico
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      throw error(400, 'ID de menú inválido');
    }

    // Verificar que el menú existe
    const menuExistente = await prisma.menu.findUnique({
      where: { Id_Menu: id }
    });

    if (!menuExistente) {
      throw error(404, 'Menú no encontrado');
    }

    // Validar datos de entrada
    const body = await request.json();
    const updateData = menuUpdateSchema.parse(body);

    // Actualizar el menú
    const menuActualizado = await prisma.menu.update({
      where: { Id_Menu: id },
      data: {
        ...(updateData.nombre && { NombreMenu: updateData.nombre }),
        ...(updateData.descripcion !== undefined && { Descripcion: updateData.descripcion }),
        ...(updateData.fecha && { Fecha: new Date(updateData.fecha) }),
        ...(updateData.activo !== undefined && { Activo: updateData.activo }),
        ...(updateData.estadoId && { Estados_Id_estado: updateData.estadoId })
      },
      include: {
        Estados: true,
        Turnos: true
      }
    });

    return json({
      id: menuActualizado.Id_Menu,
      nombre: menuActualizado.NombreMenu,
      descripcion: menuActualizado.Descripcion,
      fecha: menuActualizado.Fecha?.toISOString().split('T')[0] || null,
      activo: menuActualizado.Activo,
      estado: menuActualizado.Estados?.NombEstado || 'Pendiente',
      turno: menuActualizado.Turnos?.Nombre || 'Sin turno'
    });

  } catch (err) {
    console.error('Error al actualizar el menú:', err);

    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Datos de entrada inválidos',
          details: err.errors
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores de validación
    }

    throw error(500, 'Error interno del servidor al actualizar el menú');
  }
};

// Eliminar un menú específico (soft delete)
export const DELETE: RequestHandler = async ({ params, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const { id } = params;
    const menuId = parseInt(id);
    if (isNaN(menuId)) {
      throw error(400, 'ID de menú inválido');
    }

    // Verificar que el menú existe
    const menuExistente = await prisma.menu.findUnique({
      where: { Id_Menu: menuId }
    });

    if (!menuExistente) {
      throw error(404, 'Menú no encontrado');
    }

    // Soft delete: marcar como inactivo
    await prisma.menu.update({
      where: { Id_Menu: menuId },
      data: { Activo: false }
    });

    return new Response(null, { status: 204 });

  } catch (err) {
    console.error('Error al eliminar el menú:', err);

    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores conocidos
    }

    throw error(500, 'Error interno del servidor al eliminar el menú');
  }
};

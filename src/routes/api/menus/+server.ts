import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Esquemas de validación
const menuCreateSchema = z.object({
  nombre: z.string().min(2).max(100, 'El nombre debe tener máximo 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción debe tener máximo 500 caracteres').optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido').optional(),
  activo: z.boolean().optional()
});

const menuUpdateSchema = menuCreateSchema.partial();

// Listar menús con filtros opcionales
export const GET: RequestHandler = async ({ url }) => {
  try {
    const activo = url.searchParams.get('activo');
    const fecha = url.searchParams.get('fecha');

    // Construir filtros
    const where: any = {};

    if (activo !== null) {
      where.Activo = activo === 'true';
    }

    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      where.Fecha = {
        gte: fechaInicio,
        lte: fechaFin
      };
    }

    // Obtener menús con relaciones y conteos
    const menus = await prisma.menu.findMany({
      where,
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
      },
      orderBy: [
        { Fecha: 'desc' },
        { NombreMenu: 'asc' }
      ]
    });

    // Formatear respuesta con estadísticas
    const menusFormateados = menus.map(menu => {
      const totalPlatos = menu.MenuEspecialidad.reduce((total, me) => {
        return total + me.MenuEspTipoPlato.reduce((subtotal, metp) => {
          return subtotal + metp.Platos_has_MenuEspTipoPlato.length;
        }, 0);
      }, 0);

      return {
        id: menu.Id_Menu,
        nombre: menu.NombreMenu,
        descripcion: menu.Descripcion,
        fecha: menu.Fecha?.toISOString().split('T')[0] || null,
        activo: menu.Activo,
        estado: menu.Estados?.NombEstado || 'Pendiente',
        turno: menu.Turnos?.Nombre || 'Sin turno',
        totalPlatos,
        especialidades: menu.MenuEspecialidad.length,
        tiposPlato: menu.MenuEspecialidad.reduce((total, me) => {
          return total + me.MenuEspTipoPlato.length;
        }, 0)
      };
    });

    return json(menusFormateados);

  } catch (err) {
    console.error('Error al obtener menús:', err);
    throw error(500, 'Error interno del servidor');
  }
};

// Crear nuevo menú
export const POST: RequestHandler = async ({ request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const body = await request.json();
    const { nombre, descripcion, fecha, activo } = menuCreateSchema.parse(body);

    // Crear el menú
    const nuevoMenu = await prisma.menu.create({
      data: {
        NombreMenu: nombre,
        Descripcion: descripcion || '',
        Fecha: fecha ? new Date(fecha) : new Date(),
        Activo: activo !== undefined ? activo : true,
        Estados_Id_estado: 1 // Estado por defecto (pendiente)
      },
      include: {
        Estados: true,
        Turnos: true
      }
    });

    return json({
      id: nuevoMenu.Id_Menu,
      nombre: nuevoMenu.NombreMenu,
      descripcion: nuevoMenu.Descripcion,
      fecha: nuevoMenu.Fecha?.toISOString().split('T')[0] || null,
      activo: nuevoMenu.Activo,
      estado: nuevoMenu.Estados?.NombEstado || 'Pendiente',
      turno: nuevoMenu.Turnos?.Nombre || 'Sin turno'
    }, { status: 201 });

  } catch (err) {
    console.error('Error al crear menú:', err);

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
      throw err;
    }

    throw error(500, 'Error interno del servidor al crear el menú');
  }
};

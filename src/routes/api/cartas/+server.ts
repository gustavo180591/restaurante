import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Listar cartas con filtros opcionales
export const GET: RequestHandler = async ({ url }) => {
  try {
    const fecha = url.searchParams.get('fecha');
    const turno = url.searchParams.get('turno');
    const estado = url.searchParams.get('estado');

    // Construir filtros
    const where: any = {};

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

    if (turno) {
      where.TurnosMenu = {
        Nombre: {
          contains: turno,
          mode: 'insensitive'
        }
      };
    }

    if (estado) {
      where.Estados = {
        NombEstado: {
          contains: estado,
          mode: 'insensitive'
        }
      };
    }

    // Obtener cartas con relaciones
    const cartas = await prisma.cartas.findMany({
      where,
      include: {
        Estados: true,
        TurnosMenu: true,
        CartaDetalle: {
          include: {
            platoCarta: {
              include: {
                plato: {
                  include: {
                    foto: true
                  }
                },
                menuEspTipo: {
                  include: {
                    tipoPlato: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { Fecha: 'desc' },
        { TurnosMenu: { Nombre: 'asc' } }
      ]
    });

    // Formatear respuesta
    const cartasFormateadas = cartas.map(carta => ({
      id: carta.Id_Carta,
      fecha: carta.Fecha.toISOString().split('T')[0],
      turno: carta.TurnosMenu?.Nombre || 'Sin turno',
      estado: carta.Estados?.NombEstado || 'Pendiente',
      platos: carta.CartaDetalle.length,
      detalles: carta.CartaDetalle.map(detalle => ({
        id: detalle.Id_CartaDetalle,
        plato: {
          id: detalle.platoCarta.plato.Id_Plato,
          nombre: detalle.platoCarta.plato.NombrePlato,
          precio: detalle.platoCarta.plato.Precio,
          foto: detalle.platoCarta.plato.foto ? {
            id: detalle.platoCarta.plato.foto.Id_Foto,
            ruta: detalle.platoCarta.plato.foto.Ruta
          } : null
        },
        tipoPlato: detalle.platoCarta.menuEspTipo.tipoPlato.NombreTipo
      }))
    }));

    return json(cartasFormateadas);

  } catch (err) {
    console.error('Error al obtener cartas:', err);
    throw error(500, 'Error interno del servidor');
  }
};

// Crear nueva carta
export const POST: RequestHandler = async ({ request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const body = await request.json();
    const cartaSchema = z.object({
      fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
      turnoId: z.number().int().positive('ID de turno inválido'),
      estadoId: z.number().int().positive('ID de estado inválido').optional()
    });

    const { fecha, turnoId, estadoId } = cartaSchema.parse(body);

    // Verificar que el turno existe
    const turno = await prisma.turnosMenu.findUnique({
      where: { Id_Turno: turnoId }
    });

    if (!turno) {
      throw error(400, 'Turno no encontrado');
    }

    // Crear la carta
    const nuevaCarta = await prisma.cartas.create({
      data: {
        Fecha: new Date(fecha),
        TurnosMenu_Id_Turno: turnoId,
        Estados_Id_estado: estadoId || 1 // Estado por defecto (pendiente)
      },
      include: {
        Estados: true,
        TurnosMenu: true
      }
    });

    return json({
      id: nuevaCarta.Id_Carta,
      fecha: nuevaCarta.Fecha.toISOString().split('T')[0],
      turno: nuevaCarta.TurnosMenu?.Nombre || 'Sin turno',
      estado: nuevaCarta.Estados?.NombEstado || 'Pendiente',
      platos: 0
    }, { status: 201 });

  } catch (err) {
    console.error('Error al crear carta:', err);

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

    throw error(500, 'Error interno del servidor al crear la carta');
  }
};

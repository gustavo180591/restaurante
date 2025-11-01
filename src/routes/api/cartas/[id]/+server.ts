import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Obtener una carta específica por ID
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    const cartaId = parseInt(id);
    if (isNaN(cartaId)) {
      throw error(400, 'ID de carta inválido');
    }

    // Obtener la carta con toda su información
    const carta = await prisma.cartas.findUnique({
      where: {
        idCartas: cartaId
      },
      include: {
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
                    tipoPlato: true,
                    menuEspecialidad: {
                      include: {
                        especialidad: true,
                        turno: true
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

    if (!carta) {
      throw error(404, 'Carta no encontrada');
    }

    // Formatear la respuesta
    const cartaFormateada = {
      id: carta.idCartas,
      fecha: carta.Fecha.toISOString().split('T')[0],
      estado: carta.Estado,
      notas: carta.Notas,
      total: carta.Total,
      platos: carta.CartaDetalle.map((detalle: any) => ({
        id: detalle.idCartaDetalle,
        plato: {
          id: detalle.platoCarta.plato.Id_Plato,
          nombre: detalle.platoCarta.plato.NombrePlato,
          precio: detalle.platoCarta.plato.Precio,
          descripcion: detalle.platoCarta.plato.Descripcion,
          foto: detalle.platoCarta.plato.foto ? {
            id: detalle.platoCarta.plato.foto.Id_Foto,
            ruta: detalle.platoCarta.plato.foto.Ruta
          } : null
        },
        tipoPlato: detalle.platoCarta.menuEspTipo.tipoPlato.NombreTipo,
        especialidad: detalle.platoCarta.menuEspTipo.menuEspecialidad?.especialidad.NombreEspecialidad,
        turno: detalle.platoCarta.menuEspTipo.menuEspecialidad?.turno.Nombre,
        createdAt: detalle.createdAt
      }))
    };

    return json(cartaFormateada);

  } catch (err: any) {
    console.error('Error al obtener la carta:', err);

    if (err.status) {
      throw err; // Re-lanzar errores conocidos
    }

    throw error(500, 'Error interno del servidor');
  }
};

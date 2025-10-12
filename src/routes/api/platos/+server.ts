import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Esquema de validación para la creación de platos
const createPlatoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  activo: z.boolean().default(true),
  fotoId: z.number().int().positive().optional(),
  tiposPlato: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un tipo de plato'),
  especialidades: z.array(z.number().int().positive()).optional().default([])
});

// Obtener todos los platos
export const GET: RequestHandler = async ({ locals }) => {
  // Verificar autenticación
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const platos = await prisma.platos.findMany({
      include: {
        foto: true,
        Platos_has_MenuEspTipoPlato: {
          include: {
            menuEspTipo: {
              include: {
                tipoPlato: true,
                MenuEspecialidad: {
                  include: {
                    especialidad: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { NombrePlato: 'asc' }
    });

    // Procesar la respuesta para un formato más amigable
    const formattedPlatos = platos.map(plato => {
      const tipos = [...new Set(plato.Platos_has_MenuEspTipoPlato.map(p => ({
        id: p.menuEspTipo.tipoPlato.Id_TipoPlato,
        nombre: p.menuEspTipo.tipoPlato.NombreTipo
      })))];

      const especialidades = [...new Set(
        plato.Platos_has_MenuEspTipoPlato
          .filter(p => p.menuEspTipo.MenuEspecialidad)
          .map(p => ({
            id: p.menuEspTipo.MenuEspecialidad.especialidad.Id_especialidad,
            nombre: p.menuEspTipo.MenuEspecialidad.especialidad.NombreEspecialidad
          }))
      )];

      return {
        id: plato.Id_Plato,
        nombre: plato.NombrePlato,
        descripcion: plato.Descripcion,
        precio: plato.Precio,
        activo: plato.Activo,
        foto: plato.foto ? {
          id: plato.foto.Id_Foto,
          ruta: plato.foto.Ruta
        } : null,
        tipos,
        especialidades,
        createdAt: plato.createdAt,
        updatedAt: plato.updatedAt
      };
    });

    return json(formattedPlatos);
  } catch (err) {
    console.error('Error al obtener los platos:', err);
    throw error(500, 'Error interno del servidor');
  }
};

// Crear un nuevo plato
export const POST: RequestHandler = async ({ request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    // Validar datos de entrada
    const body = await request.json();
    const result = createPlatoSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos de entrada inválidos',
          details: result.error.format()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { nombre, descripcion, precio, activo, fotoId, tiposPlato, especialidades } = result.data;

    // Verificar que los tipos de plato existan
    const tiposExistentes = await prisma.tipoPlato.findMany({
      where: { Id_TipoPlato: { in: tiposPlato } }
    });

    if (tiposExistentes.length !== tiposPlato.length) {
      throw error(400, 'Uno o más tipos de plato no existen');
    }

    // Verificar que las especialidades existan si se proporcionan
    if (especialidades && especialidades.length > 0) {
      const especialidadesExistentes = await prisma.especialidades.findMany({
        where: { Id_especialidad: { in: especialidades } }
      });

      if (especialidadesExistentes.length !== especialidades.length) {
        throw error(400, 'Una o más especialidades no existen');
      }
    }

    // Buscar o crear las relaciones MenuEspTipoPlato necesarias
    const menuEspTipoPlatos = await Promise.all(
      tiposPlato.flatMap(tipoId =>
        especialidades.length > 0
          ? especialidades.map(async (especialidadId) => {
              // Buscar si ya existe una relación MenuEspTipoPlato para este tipo y especialidad
              const existing = await prisma.menuEspTipoPlato.findFirst({
                where: {
                  TipoPlato_Id_TipoPlato: tipoId,
                  MenuEspecialidad: {
                    especialidad: {
                      Id_especialidad: especialidadId
                    }
                  }
                }
              });

              if (existing) return existing;

              // Si no existe, crear una nueva relación
              return prisma.menuEspTipoPlato.create({
                data: {
                  TipoPlato: {
                    connect: { Id_TipoPlato: tipoId }
                  },
                  MenuEspecialidad: {
                    connect: {
                      Especialidad_Id_especialidad_TurnosMenu_Id_Turno: {
                        Especialidad_Id_especialidad: especialidadId,
                        // Necesitamos un Turno por defecto, aquí asumimos que hay un turno con ID 1
                        // En una implementación real, deberías manejar esto de manera adecuada
                        TurnosMenu_Id_Turno: 1
                      }
                    }
                  }
                }
              });
            })
          : [
              // Si no hay especialidades, solo crear para el tipo de plato
              (async () => {
                // Buscar si ya existe una relación para este tipo sin especialidad
                const existing = await prisma.menuEspTipoPlato.findFirst({
                  where: {
                    TipoPlato_Id_TipoPlato: tipoId,
                    MenuEspecialidad: null
                  }
                });

                if (existing) return existing;

                return prisma.menuEspTipoPlato.create({
                  data: {
                    TipoPlato: {
                      connect: { Id_TipoPlato: tipoId }
                    }
                    // No conectamos MenuEspecialidad para este caso
                  }
                });
              })()
            ]
      )
    );

    // Crear el plato
    const plato = await prisma.$transaction(async (prisma) => {
      // 1. Crear el plato
      const nuevoPlato = await prisma.platos.create({
        data: {
          NombrePlato: nombre,
          Descripcion: descripcion,
          Precio: precio,
          Activo: activo,
          ...(fotoId && { Fotos_Id_Foto: fotoId })
        }
      });

      // 2. Crear las relaciones con MenuEspTipoPlato
      await Promise.all(
        menuEspTipoPlatos.map((menuEspTipo) =>
          prisma.platos_has_MenuEspTipoPlato.create({
            data: {
              Id_PlatoCarta: `plato_${nuevoPlato.Id_Plato}_${menuEspTipo.Id_MenuEspTipoPlato}_${Date.now()}`,
              Platos_Id_Plato: nuevoPlato.Id_Plato,
              MenuEspTipoPlato_Id_MenuEspTipoPlato: menuEspTipo.Id_MenuEspTipoPlato
            }
          })
        )
      );

      return nuevoPlato;
    });

    // Obtener el plato recién creado con sus relaciones para la respuesta
    const platoCreado = await prisma.platos.findUnique({
      where: { Id_Plato: plato.Id_Plato },
      include: {
        foto: true,
        Platos_has_MenuEspTipoPlato: {
          include: {
            menuEspTipo: {
              include: {
                tipoPlato: true,
                MenuEspecialidad: {
                  include: {
                    especialidad: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!platoCreado) {
      throw error(500, 'Error al recuperar el plato recién creado');
    }

    // Formatear la respuesta
    const tipos = [...new Set(
      platoCreado.Platos_has_MenuEspTipoPlato.map(p => ({
        id: p.menuEspTipo.tipoPlato.Id_TipoPlato,
        nombre: p.menuEspTipo.tipoPlato.NombreTipo
      }))
    )];

    const especialidadesUnicas = [...new Set(
      platoCreado.Platos_has_MenuEspTipoPlato
        .filter(p => p.menuEspTipo.MenuEspecialidad)
        .map(p => ({
          id: p.menuEspTipo.MenuEspecialidad.especialidad.Id_especialidad,
          nombre: p.menuEspTipo.MenuEspecialidad.especialidad.NombreEspecialidad
        }))
    )];

    const response = {
      id: platoCreado.Id_Plato,
      nombre: platoCreado.NombrePlato,
      descripcion: platoCreado.Descripcion,
      precio: platoCreado.Precio,
      activo: platoCreado.Activo,
      foto: platoCreado.foto ? {
        id: platoCreado.foto.Id_Foto,
        ruta: platoCreado.foto.Ruta
      } : null,
      tipos,
      especialidades: especialidadesUnicas,
      createdAt: platoCreado.createdAt,
      updatedAt: platoCreado.updatedAt
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Location': `/api/platos/${platoCreado.Id_Plato}`
      }
    });

  } catch (err) {
    console.error('Error al crear el plato:', err);
    
    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores de validación
    }
    
    throw error(500, 'Error interno del servidor al crear el plato');
  }
};

// Exportar otros métodos HTTP si son necesarios
export const PUT: RequestHandler = async () => {
  // Implementación pendiente
  throw error(501, 'No implementado');
};

export const DELETE: RequestHandler = async () => {
  // Implementación pendiente
  throw error(501, 'No implementado');
};

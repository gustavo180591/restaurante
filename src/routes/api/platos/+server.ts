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

// Esquema de validación para actualizar platos
const updatePlatoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255).optional(),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo').optional(),
  activo: z.boolean().optional(),
  fotoId: z.number().int().positive().optional().nullable(),
  tiposPlato: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un tipo de plato').optional(),
  especialidades: z.array(z.number().int().positive()).optional()
});

// Esquema de validación para filtros del catálogo
const catalogoQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val)),
  limit: z.string().optional().default('12').transform(val => parseInt(val)),
  search: z.string().optional(),
  tipo: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  especialidad: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  orderBy: z.enum(['nombre', 'precio', 'createdAt']).optional().default('nombre'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined)
});

// Obtener productos para el catálogo público
export const GET: RequestHandler = async ({ url }) => {
  try {
    const queryParams = Object.fromEntries(url.searchParams);
    const {
      page,
      limit,
      search,
      tipo,
      especialidad,
      orderBy,
      order,
      minPrice,
      maxPrice
    } = catalogoQuerySchema.parse(queryParams);

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      Activo: true // Solo productos activos
    };

    // Filtro de búsqueda en nombre y descripción
    if (search) {
      where.OR = [
        { NombrePlato: { contains: search, mode: 'insensitive' } },
        { Descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtro por tipo de plato
    if (tipo) {
      where.Platos_has_MenuEspTipoPlato = {
        some: {
          menuEspTipo: {
            tipoPlato: {
              Id_TipoPlato: tipo
            }
          }
        }
      };
    }

    // Filtro por especialidad
    if (especialidad) {
      where.Platos_has_MenuEspTipoPlato = {
        some: {
          menuEspTipo: {
            MenuEspecialidad: {
              especialidad: {
                Id_especialidad: especialidad
              }
            }
          }
        }
      };
    }

    // Filtros de precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.Precio = {};
      if (minPrice !== undefined) where.Precio.gte = minPrice;
      if (maxPrice !== undefined) where.Precio.lte = maxPrice;
    }

    // Obtener productos con filtros aplicados
    const productos = await prisma.platos.findMany({
      where,
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
      orderBy: {
        [orderBy]: order
      },
      take: limit,
      skip: offset
    });

    // Obtener el total de productos para la paginación
    const totalProductos = await prisma.platos.count({ where });

    // Formatear productos para el frontend
    const productosFormateados = productos.map(plato => {
      const tipos = [...new Set(plato.Platos_has_MenuEspTipoPlato.map(p => ({
        id: p.menuEspTipo.tipoPlato.Id_TipoPlato,
        nombre: p.menuEspTipo.tipoPlato.NombreTipo
      })))]

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
        foto: plato.foto ? {
          id: plato.foto.Id_Foto,
          ruta: plato.foto.Ruta
        } : null,
        tipos,
        especialidades,
        disponible: plato.Activo
      };
    });

    // Obtener listas de filtros disponibles
    const filtros = await prisma.$transaction(async (prisma) => {
      // Tipos de plato disponibles
      const tiposDisponibles = await prisma.tipoPlato.findMany({
        include: {
          MenuEspTipoPlato: {
            include: {
              Platos_has_MenuEspTipoPlato: {
                where: {
                  plato: {
                    Activo: true
                  }
                }
              }
            }
          }
        }
      });

      // Especialidades disponibles
      const especialidadesDisponibles = await prisma.especialidades.findMany({
        include: {
          MenuEspecialidad: {
            include: {
              MenuEspTipoPlato: {
                include: {
                  Platos_has_MenuEspTipoPlato: {
                    where: {
                      plato: {
                        Activo: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return {
        tipos: tiposDisponibles.filter(tipo =>
          tipo.MenuEspTipoPlato.some(menuEsp =>
            menuEsp.Platos_has_MenuEspTipoPlato.length > 0
          )
        ).map(tipo => ({
          id: tipo.Id_TipoPlato,
          nombre: tipo.NombreTipo
        })),
        especialidades: especialidadesDisponibles.filter(especialidad =>
          especialidad.MenuEspecialidad.some(menuEsp =>
            menuEsp.MenuEspTipoPlato.some(menuEspTipo =>
              menuEspTipo.Platos_has_MenuEspTipoPlato.length > 0
            )
          )
        ).map(especialidad => ({
          id: especialidad.Id_especialidad,
          nombre: especialidad.NombreEspecialidad
        }))
      };
    });

    return json({
      productos: productosFormateados,
      filtros,
      paginacion: {
        pagina: page,
        limite: limit,
        total: totalProductos,
        paginas: Math.ceil(totalProductos / limit)
      }
    });

  } catch (err) {
    console.error('Error al obtener el catálogo:', err);

    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Parámetros de consulta inválidos',
          details: err.format()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

// Actualizar un plato existente
export const PUT: RequestHandler = async ({ request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    // Validar datos de entrada
    const body = await request.json();
    const result = updatePlatoSchema.safeParse(body);

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

    // Buscar el plato existente
    const platoExistente = await prisma.platos.findUnique({
      where: { Id_Plato: parseInt(request.url.split('/').pop() || '0') },
      include: {
        Platos_has_MenuEspTipoPlato: true
      }
    });

    if (!platoExistente) {
      throw error(404, 'Plato no encontrado');
    }

    // Verificar que los tipos de plato existan si se proporcionan
    if (tiposPlato && tiposPlato.length > 0) {
      const tiposExistentes = await prisma.tipoPlato.findMany({
        where: { Id_TipoPlato: { in: tiposPlato } }
      });

      if (tiposExistentes.length !== tiposPlato.length) {
        throw error(400, 'Uno o más tipos de plato no existen');
      }
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

    // Crear o actualizar las relaciones MenuEspTipoPlato necesarias
    let menuEspTipoPlatos = [];
    if (tiposPlato && tiposPlato.length > 0) {
      menuEspTipoPlatos = await Promise.all(
        tiposPlato.flatMap(tipoId =>
          especialidades && especialidades.length > 0
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
                          TurnosMenu_Id_Turno: 1
                        }
                      }
                    }
                  }
                });
              })
            : [
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
                    }
                  });
                })()
              ]
        )
      );
    }

    // Actualizar el plato dentro de una transacción
    const platoActualizado = await prisma.$transaction(async (prisma) => {
      // 1. Actualizar el plato
      const plato = await prisma.platos.update({
        where: { Id_Plato: platoExistente.Id_Plato },
        data: {
          ...(nombre !== undefined && { NombrePlato: nombre }),
          ...(descripcion !== undefined && { Descripcion: descripcion }),
          ...(precio !== undefined && { Precio: precio }),
          ...(activo !== undefined && { Activo: activo }),
          ...(fotoId !== undefined && { Fotos_Id_Foto: fotoId })
        }
      });

      // 2. Si se proporcionaron nuevos tipos/especialidades, actualizar las relaciones
      if (tiposPlato && tiposPlato.length > 0) {
        // Eliminar relaciones existentes
        await prisma.platos_has_MenuEspTipoPlato.deleteMany({
          where: { Platos_Id_Plato: plato.Id_Plato }
        });

        // Crear nuevas relaciones
        await Promise.all(
          menuEspTipoPlatos.map((menuEspTipo) =>
            prisma.platos_has_MenuEspTipoPlato.create({
              data: {
                Id_PlatoCarta: `plato_${plato.Id_Plato}_${menuEspTipo.Id_MenuEspTipoPlato}_${Date.now()}`,
                Platos_Id_Plato: plato.Id_Plato,
                MenuEspTipoPlato_Id_MenuEspTipoPlato: menuEspTipo.Id_MenuEspTipoPlato
              }
            })
          )
        );
      }

      return plato;
    });

    // Obtener el plato actualizado con sus relaciones
    const platoConRelaciones = await prisma.platos.findUnique({
      where: { Id_Plato: platoActualizado.Id_Plato },
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

    if (!platoConRelaciones) {
      throw error(500, 'Error al recuperar el plato actualizado');
    }

    // Formatear la respuesta
    const tipos = [...new Set(
      platoConRelaciones.Platos_has_MenuEspTipoPlato.map(p => ({
        id: p.menuEspTipo.tipoPlato.Id_TipoPlato,
        nombre: p.menuEspTipo.tipoPlato.NombreTipo
      }))
    )];

    const especialidadesUnicas = [...new Set(
      platoConRelaciones.Platos_has_MenuEspTipoPlato
        .filter(p => p.menuEspTipo.MenuEspecialidad)
        .map(p => ({
          id: p.menuEspTipo.MenuEspecialidad.especialidad.Id_especialidad,
          nombre: p.menuEspTipo.MenuEspecialidad.especialidad.NombreEspecialidad
        }))
    )];

    const response = {
      id: platoConRelaciones.Id_Plato,
      nombre: platoConRelaciones.NombrePlato,
      descripcion: platoConRelaciones.Descripcion,
      precio: platoConRelaciones.Precio,
      activo: platoConRelaciones.Activo,
      foto: platoConRelaciones.foto ? {
        id: platoConRelaciones.foto.Id_Foto,
        ruta: platoConRelaciones.foto.Ruta
      } : null,
      tipos,
      especialidades: especialidadesUnicas,
      createdAt: platoConRelaciones.createdAt,
      updatedAt: platoConRelaciones.updatedAt
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error al actualizar el plato:', err);

    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores de validación
    }

    throw error(500, 'Error interno del servidor al actualizar el plato');
  }
};

// Eliminar un plato
export const DELETE: RequestHandler = async ({ request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    // Extraer el ID del plato de la URL
    const platoId = parseInt(request.url.split('/').pop() || '0');

    if (!platoId || platoId <= 0) {
      throw error(400, 'ID de plato inválido');
    }

    // Verificar que el plato existe
    const platoExistente = await prisma.platos.findUnique({
      where: { Id_Plato: platoId },
      include: {
        Platos_has_MenuEspTipoPlato: true
      }
    });

    if (!platoExistente) {
      throw error(404, 'Plato no encontrado');
    }

    // Verificar si el plato está siendo utilizado en alguna carta
    const cartasConPlato = await prisma.cartaDetalle.findMany({
      where: {
        Platos_has_MenuEspTipoPlato: {
          Platos_Id_Plato: platoId
        }
      }
    });

    if (cartasConPlato.length > 0) {
      throw error(409, 'No se puede eliminar el plato porque está siendo utilizado en cartas existentes');
    }

    // Eliminar el plato dentro de una transacción
    await prisma.$transaction(async (prisma) => {
      // 1. Eliminar las relaciones con MenuEspTipoPlato
      await prisma.platos_has_MenuEspTipoPlato.deleteMany({
        where: { Platos_Id_Plato: platoId }
      });

      // 2. Eliminar el plato
      await prisma.platos.delete({
        where: { Id_Plato: platoId }
      });
    });

    return new Response(null, { status: 204 });

  } catch (err) {
    console.error('Error al eliminar el plato:', err);

    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores de validación
    }

    throw error(500, 'Error interno del servidor al eliminar el plato');
  }
};

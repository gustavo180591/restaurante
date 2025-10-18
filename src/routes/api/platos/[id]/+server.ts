import { prisma } from '$lib/db/prisma';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { platoUpdateSchema } from '$lib/validation/schemas';
import type { RequestHandler } from './$types';

// Obtener un producto específico por ID (público)
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    // Validar que el ID sea un número
    const productoId = parseInt(id);
    if (isNaN(productoId)) {
      throw error(400, 'ID de producto inválido');
    }

    // Obtener el producto con toda su información
    const producto = await prisma.platos.findUnique({
      where: {
        Id_Plato: productoId,
        Activo: true // Solo productos activos
      },
      include: {
        foto: true,
        Platos_has_MenuEspTipoPlato: {
          include: {
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
    });

    if (!producto) {
      throw error(404, 'Producto no encontrado');
    }

    // Formatear la respuesta
    const tipos = [...new Set(producto.Platos_has_MenuEspTipoPlato.map((p: any) => ({
      id: p.menuEspTipo.tipoPlato.Id_TipoPlato,
      nombre: p.menuEspTipo.tipoPlato.NombreTipo
    })))];

    const especialidades = [...new Set(
      producto.Platos_has_MenuEspTipoPlato
        .filter((p: any) => p.menuEspTipo.menuEspecialidad)
        .map((p: any) => ({
          id: p.menuEspTipo.menuEspecialidad.especialidad.Id_especialidad,
          nombre: p.menuEspTipo.menuEspecialidad.especialidad.NombreEspecialidad
        }))
    )];

    const turnos = [...new Set(
      producto.Platos_has_MenuEspTipoPlato
        .filter((p: any) => p.menuEspTipo.menuEspecialidad)
        .map((p: any) => ({
          id: p.menuEspTipo.menuEspecialidad.turno.Id_Turno,
          nombre: p.menuEspTipo.menuEspecialidad.turno.Nombre,
          horaInicio: p.menuEspTipo.menuEspecialidad.turno.HoraInicio,
          horaFin: p.menuEspTipo.menuEspecialidad.turno.HoraFin,
          descripcion: p.menuEspTipo.menuEspecialidad.turno.Descripcion
        }))
    )];

    const productoFormateado = {
      id: producto.Id_Plato,
      nombre: producto.NombrePlato,
      descripcion: producto.Descripcion,
      precio: producto.Precio,
      foto: producto.foto ? {
        id: producto.foto.Id_Foto,
        ruta: producto.foto.Ruta
      } : null,
      tipos,
      especialidades,
      turnos,
      disponible: producto.Activo,
      createdAt: producto.createdAt,
      updatedAt: producto.updatedAt
    };

    // Obtener productos relacionados (misma categoría o especialidad)
    const productosRelacionados = await prisma.platos.findMany({
      where: {
        Activo: true,
        Id_Plato: { not: productoId }, // Excluir el producto actual
        OR: [
          // Mismo tipo de plato
          {
            Platos_has_MenuEspTipoPlato: {
              some: {
                menuEspTipo: {
                  tipoPlato: {
                    Id_TipoPlato: {
                      in: tipos.map((t: any) => t.id)
                    }
                  }
                }
              }
            }
          },
          // Misma especialidad
          {
            Platos_has_MenuEspTipoPlato: {
              some: {
                menuEspTipo: {
                  menuEspecialidad: {
                    especialidad: {
                      Id_especialidad: {
                        in: especialidades.map((e: any) => e.id)
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        foto: true,
        Platos_has_MenuEspTipoPlato: {
          include: {
            menuEspTipo: {
              include: {
                tipoPlato: true,
                menuEspecialidad: {
                  include: {
                    especialidad: true
                  }
                }
              }
            }
          }
        }
      },
      take: 4, // Máximo 4 productos relacionados
      orderBy: {
        Precio: 'asc' // Ordenar por precio ascendente
      }
    });

    const relacionadosFormateados = productosRelacionados.map((p: any) => {
      const tiposRel = [...new Set(p.Platos_has_MenuEspTipoPlato.map((r: any) => ({
        id: r.menuEspTipo.tipoPlato.Id_TipoPlato,
        nombre: r.menuEspTipo.tipoPlato.NombreTipo
      })))];

      const especialidadesRel = [...new Set(
        p.Platos_has_MenuEspTipoPlato
          .filter((r: any) => r.menuEspTipo.menuEspecialidad)
          .map((r: any) => ({
            id: r.menuEspTipo.menuEspecialidad.especialidad.Id_especialidad,
            nombre: r.menuEspTipo.menuEspecialidad.especialidad.NombreEspecialidad
          }))
      )];

      return {
        id: p.Id_Plato,
        nombre: p.NombrePlato,
        descripcion: p.Descripcion,
        precio: p.Precio,
        foto: p.foto ? {
          id: p.foto.Id_Foto,
          ruta: p.foto.Ruta
        } : null,
        tipos: tiposRel,
        especialidades: especialidadesRel,
        disponible: p.Activo
      };
    });

    return json({
      producto: productoFormateado,
      relacionados: relacionadosFormateados
    });

  } catch (err: any) {
    console.error('Error al obtener el producto:', err);

    if (err.status) {
      throw err; // Re-lanzar errores conocidos
    }

    throw error(500, 'Error interno del servidor');
  }
};

// Actualizar un plato específico
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      throw error(400, 'ID de plato inválido');
    }

    // Verificar que el plato existe
    const platoExistente = await prisma.platos.findUnique({
      where: { Id_Plato: id },
      include: {
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

    if (!platoExistente) {
      throw error(404, 'Plato no encontrado');
    }

    // Validar datos de entrada
    const body = await request.json();
    const result = platoUpdateSchema.safeParse(body);

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

    // Verificar que los tipos de plato existan si se proporcionan
    if (tiposPlato) {
      const tiposExistentes = await prisma.tipoPlato.findMany({
        where: { Id_TipoPlato: { in: tiposPlato } }
      });
      if (tiposExistentes.length !== tiposPlato.length) {
        throw error(400, 'Uno o más tipos de plato no existen');
      }
    }

    // Verificar que las especialidades existan si se proporcionan
    if (especialidades) {
      const especialidadesExistentes = await prisma.especialidades.findMany({
        where: { Id_especialidad: { in: especialidades } }
      });
      if (especialidadesExistentes.length !== especialidades.length) {
        throw error(400, 'Una o más especialidades no existen');
      }
    }

    // Actualizar el plato en una transacción
    const platoActualizado = await prisma.$transaction(async (prisma) => {
      // 1. Actualizar los campos básicos del plato
      const updatedPlato = await prisma.platos.update({
        where: { Id_Plato: id },
        data: {
          ...(nombre && { NombrePlato: nombre }),
          ...(descripcion !== undefined && { Descripcion: descripcion }),
          ...(precio !== undefined && { Precio: precio }),
          ...(activo !== undefined && { Activo: activo }),
          ...(fotoId !== undefined && { Fotos_Id_Foto: fotoId })
        }
      });

      // 2. Si se proporcionan nuevos tipos o especialidades, actualizar las relaciones
      if (tiposPlato || especialidades) {
        // Eliminar relaciones existentes
        await prisma.platos_has_MenuEspTipoPlato.deleteMany({
          where: { Platos_Id_Plato: id }
        });

        // Crear nuevas relaciones si se proporcionan tipos
        if (tiposPlato && tiposPlato.length > 0) {
          const nuevasRelaciones = [];

          for (const tipoId of tiposPlato) {
            if (especialidades && especialidades.length > 0) {
              for (const especialidadId of especialidades) {
                // Buscar o crear MenuEspTipoPlato
                const menuEspTipo = await prisma.menuEspTipoPlato.upsert({
                  where: {
                    TipoPlato_Id_TipoPlato_MenuEspecialidad_Id_MenuEspecialidad_TurnosMenu_Id_Turno: {
                      TipoPlato_Id_TipoPlato: tipoId,
                      MenuEspecialidad_Id_MenuEspecialidad_TurnosMenu_Id_Turno: {
                        Especialidad_Id_especialidad: especialidadId,
                        TurnosMenu_Id_Turno: 1 // Asumiendo turno por defecto
                      }
                    }
                  },
                  update: {},
                  create: {
                    TipoPlato: { connect: { Id_TipoPlato: tipoId } },
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

                nuevasRelaciones.push({
                  Platos_Id_Plato: id,
                  MenuEspTipoPlato_Id_MenuEspTipoPlato: menuEspTipo.Id_MenuEspTipoPlato
                });
              }
            } else {
              // Sin especialidades
              const menuEspTipo = await prisma.menuEspTipoPlato.upsert({
                where: {
                  TipoPlato_Id_TipoPlato_MenuEspecialidad_Id_MenuEspecialidad_TurnosMenu_Id_Turno: {
                    TipoPlato_Id_TipoPlato: tipoId,
                    MenuEspecialidad_Id_MenuEspecialidad_TurnosMenu_Id_Turno: {
                      Especialidad_Id_especialidad: 0, // Sin especialidad
                      TurnosMenu_Id_Turno: 0
                    }
                  }
                },
                update: {},
                create: {
                  TipoPlato: { connect: { Id_TipoPlato: tipoId } }
                }
              });

              nuevasRelaciones.push({
                Platos_Id_Plato: id,
                MenuEspTipoPlato_Id_MenuEspTipoPlato: menuEspTipo.Id_MenuEspTipoPlato
              });
            }
          }

          // Crear las relaciones
          await Promise.all(nuevasRelaciones.map(rel =>
            prisma.platos_has_MenuEspTipoPlato.create({
              data: {
                Id_PlatoCarta: `plato_${id}_${rel.MenuEspTipoPlato_Id_MenuEspTipoPlato}_${Date.now()}`,
                Platos_Id_Plato: rel.Platos_Id_Plato,
                MenuEspTipoPlato_Id_MenuEspTipoPlato: rel.MenuEspTipoPlato_Id_MenuEspTipoPlato
              }
            })
          ));
        }
      }

      return updatedPlato;
    });

    // Obtener el plato actualizado con relaciones para la respuesta
    const platoConRelaciones = await prisma.platos.findUnique({
      where: { Id_Plato: id },
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
      updatedAt: platoConRelaciones.updatedAt
    };

    return json(response);

  } catch (err) {
    console.error('Error al actualizar el plato:', err);
    
    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores de validación
    }
    
    throw error(500, 'Error interno del servidor al actualizar el plato');
  }
};

// Eliminar un plato específico por ID (soft delete)
// DELETE /api/platos/[id]
export const DELETE: RequestHandler = async ({ params, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  try {
    const { id } = params;
    const platoId = parseInt(id);
    if (isNaN(platoId)) {
      throw error(400, 'ID de plato inválido');
    }

    // Verificar que el plato existe
    const platoExistente = await prisma.platos.findUnique({
      where: { Id_Plato: platoId }
    });

    if (!platoExistente) {
      throw error(404, 'Plato no encontrado');
    }

    // Soft delete: marcar como inactivo
    await prisma.platos.update({
      where: { Id_Plato: platoId },
      data: { Activo: false }
    });

    return new Response(null, { status: 204 });

  } catch (err) {
    console.error('Error al eliminar el plato:', err);
    
    if (err.status && err.status < 500) {
      throw err; // Re-lanzar errores conocidos
    }
    
    throw error(500, 'Error interno del servidor al eliminar el plato');
  }
};
import { prisma } from '$lib/db/prisma';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Esquema de validación para la actualización de platos
const updatePlatoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255).optional(),
  descripcion: z.string().optional().nullable(),
  precio: z.number().min(0, 'El precio no puede ser negativo').optional(),
  activo: z.boolean().optional(),
  fotoId: z.number().int().positive().optional().nullable(),
  tiposPlato: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un tipo de plato').optional(),
  especialidades: z.array(z.number().int().positive()).optional()
}).refine(data => {
  // Al menos un campo debe ser proporcionado para la actualización
  return Object.keys(data).length > 0;
}, {
  message: 'Debe proporcionar al menos un campo para actualizar',
  path: ['general']
});

// Importar tipos de Prisma
import type { Platos } from '@prisma/client';

// Interfaz extendida para incluir relaciones
type PlatoConRelaciones = Omit<Platos, 'Precio'> & {
  Precio: number | { toNumber: () => number };
  foto: {
    Id_Foto: number;
    Ruta: string;
  } | null;
  Platos_has_MenuEspTipoPlato: Array<{
    Id_PlatoCarta: string;
    Platos_Id_Plato: number;
    MenuEspTipoPlato_Id_MenuEspTipoPlato: number;
    menuEspTipo: {
      Id_MenuEspTipoPlato: number;
      tipoPlato: {
        Id_TipoPlato: number;
        NombreTipo: string;
      } | null;
      menuEspecialidad: {
        Id_MenuEspecialidad: number;
        especialidad: {
          Id_especialidad: number;
          NombreEspecialidad: string;
        } | null;
      } | null;
    };
  }>;
};

export const GET: RequestHandler = async ({ params, locals }) => {
  // Verificar autenticación
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  const platoId = parseInt(params.id);
  
  // Validar que el ID sea un número válido
  if (isNaN(platoId)) {
    throw error(400, 'ID de plato no válido');
  }

  try {
    // Buscar el plato con sus relaciones
    const plato = await getPlatoWithRelations(platoId);

    // Si no se encuentra el plato, devolver 404
    if (!plato) {
      throw error(404, 'Plato no encontrado');
    }

    return new Response(JSON.stringify(formatPlatoResponse(plato)), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Error al obtener el plato:', err);
    throw error(500, 'Error interno del servidor');
  }
};

// Función auxiliar para formatear la respuesta del plato
const formatPlatoResponse = (plato: PlatoConRelaciones) => {
  const tipos = plato.Platos_has_MenuEspTipoPlato
    .filter(p => p.menuEspTipo?.tipoPlato) // Filtrar relaciones con tipoPlato nulo
    .map(p => ({
      id: p.menuEspTipo!.tipoPlato!.Id_TipoPlato,
      nombre: p.menuEspTipo!.tipoPlato!.NombreTipo
    }));

  const especialidades = plato.Platos_has_MenuEspTipoPlato
    .filter(p => p.menuEspTipo?.menuEspecialidad?.especialidad)
    .map(p => ({
      id: p.menuEspTipo!.menuEspecialidad!.especialidad!.Id_especialidad,
      nombre: p.menuEspTipo!.menuEspecialidad!.especialidad!.NombreEspecialidad
    }));

  // Eliminar duplicados
  const tiposUnicos = [...new Map(tipos.map(item => [item.id, item])).values()];
  const especialidadesUnicas = [...new Map(especialidades.map(item => [item.id, item])).values()];

  // Convertir Precio a número si es un objeto Decimal
  const precio = typeof plato.Precio === 'number' ? plato.Precio : plato.Precio.toNumber();

  return {
    id: plato.Id_Plato,
    nombre: plato.NombrePlato,
    descripcion: plato.Descripcion,
    precio,
    activo: plato.Activo,
    tipos: tiposUnicos,
    especialidades: especialidadesUnicas,
    foto: plato.foto ? {
      id: plato.foto.Id_Foto,
      ruta: plato.foto.Ruta
    } : null,
    createdAt: plato.createdAt,
    updatedAt: plato.updatedAt
  };
};

// Función para obtener un plato con sus relaciones
const getPlatoWithRelations = async (platoId: number): Promise<PlatoConRelaciones | null> => {
  const plato = await prisma.platos.findUnique({
    where: { Id_Plato: platoId },
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
    }
  });

  if (!plato) return null;

  // Mapear a la interfaz PlatoConRelaciones
  return {
    ...plato,
    Platos_has_MenuEspTipoPlato: plato.Platos_has_MenuEspTipoPlato.map(rel => ({
      Id_PlatoCarta: rel.Id_PlatoCarta,
      Platos_Id_Plato: rel.Platos_Id_Plato,
      MenuEspTipoPlato_Id_MenuEspTipoPlato: rel.MenuEspTipoPlato_Id_MenuEspTipoPlato,
      menuEspTipo: {
        Id_MenuEspTipoPlato: rel.menuEspTipo.Id_MenuEspTipoPlato,
        tipoPlato: rel.menuEspTipo.tipoPlato ? {
          Id_TipoPlato: rel.menuEspTipo.tipoPlato.Id_TipoPlato,
          NombreTipo: rel.menuEspTipo.tipoPlato.NombreTipo
        } : null,
        menuEspecialidad: rel.menuEspTipo.menuEspecialidad ? {
          Id_MenuEspecialidad: rel.menuEspTipo.menuEspecialidad.Id_MenuEspecialidad,
          especialidad: rel.menuEspTipo.menuEspecialidad.especialidad
        } : null
      }
    }))
  };
};

// Actualizar un plato existente
export const PUT: RequestHandler = async ({ request, params, locals }) => {
  if (!locals.user) throw error(401, 'No autenticado');

  const platoId = Number(params.id);
  if (Number.isNaN(platoId)) throw error(400, 'ID de plato no válido');

  const body = await request.json();
  const result = updatePlatoSchema.safeParse(body);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Datos de entrada inválidos', details: result.error.format() }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { nombre, descripcion, precio, activo, fotoId, tiposPlato, especialidades } = result.data;

  const platoExistente = await prisma.platos.findUnique({ where: { Id_Plato: platoId } });
  if (!platoExistente) throw error(404, 'Plato no encontrado');

  const platoActualizado = await prisma.$transaction(async (tx) => {
    // 1) Datos básicos
    const updateData: {
      NombrePlato?: string;
      Descripcion?: string | null;
      Precio?: number;
      Activo?: boolean;
      Fotos_Id_Foto?: number | null;
    } = {};

    if (nombre !== undefined) updateData.NombrePlato = nombre;
    if (descripcion !== undefined) updateData.Descripcion = descripcion;
    if (precio !== undefined) updateData.Precio = precio;
    if (activo !== undefined) updateData.Activo = activo;
    if (fotoId !== undefined) updateData.Fotos_Id_Foto = fotoId;

    if (Object.keys(updateData).length > 0) {
      await tx.platos.update({ where: { Id_Plato: platoId }, data: updateData });
    }

    // 2) Relaciones (opcional)
    if (tiposPlato || especialidades) {
      // limpiamos todo y volvemos a crear (simple y claro)
      await tx.platos_has_MenuEspTipoPlato.deleteMany({ where: { Platos_Id_Plato: platoId } });

      if (tiposPlato && tiposPlato.length > 0) {
        // buscamos las combinaciones válidas de MenuEspTipoPlato
        const rels: { Id_MenuEspTipoPlato: number }[] = [];

        for (const tipoId of tiposPlato) {
          if (especialidades && especialidades.length > 0) {
            // por cada especialidad pedida
            const found = await tx.menuEspTipoPlato.findMany({
              where: {
                TipoPlato_Id_TipoPlato: tipoId,
                // Usar camelCase en la relación:
                menuEspecialidad: {
                  // si tu modelo tiene Turnos también, podés agregar el filtro acá
                  Especialidades_Id_especialidad: { in: especialidades }
                }
              },
              select: { Id_MenuEspTipoPlato: true }
            });
            rels.push(...found);
          } else {
            // si no enviaron especialidades, asociamos a TODOS los contextos de ese tipo
            const found = await tx.menuEspTipoPlato.findMany({
              where: { TipoPlato_Id_TipoPlato: tipoId },
              select: { Id_MenuEspTipoPlato: true }
            });
            rels.push(...found);
          }
        }

        // crear los vínculos en la tabla puente (requiere Id_PlatoCarta)
        const dataCreate = rels.map((r) => ({
          Id_PlatoCarta: `${platoId}-${r.Id_MenuEspTipoPlato}`,
          Platos_Id_Plato: platoId,
          MenuEspTipoPlato_Id_MenuEspTipoPlato: r.Id_MenuEspTipoPlato
        }));

        if (dataCreate.length > 0) {
          await tx.platos_has_MenuEspTipoPlato.createMany({ data: dataCreate });
        }
      }
    }

    // 3) Devolver el plato con relaciones
    return getPlatoWithRelations(platoId);
  });

  return new Response(JSON.stringify(formatPlatoResponse(platoActualizado!)), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// Eliminar un plato existente
export const DELETE: RequestHandler = async ({ params, locals }) => {
  // Verificar autenticación y permisos
  if (!locals.user) {
    throw error(401, 'No autenticado');
  }

  const platoId = parseInt(params.id);
  
  // Validar que el ID sea un número válido
  if (isNaN(platoId)) {
    throw error(400, 'ID de plato no válido');
  }

  try {
    // Verificar que el plato existe
    const plato = await prisma.platos.findUnique({
      where: { Id_Plato: platoId }
    });

    if (!plato) {
      throw error(404, 'Plato no encontrado');
    }

    // Iniciar transacción para eliminar relaciones y luego el plato
    await prisma.$transaction([
      // 1. Eliminar relaciones con tipos de plato
      prisma.platos_has_MenuEspTipoPlato.deleteMany({
        where: { Platos_Id_Plato: platoId }
      }),
      
      // 2. Eliminar el plato
      prisma.platos.delete({
        where: { Id_Plato: platoId }
      })
    ]);

    return new Response(null, { status: 204 });

  } catch (err) {
    console.error('Error al eliminar el plato:', err);
    
    if (err instanceof Error && 'message' in err) {
      if (err.message.includes('foreign key constraint')) {
        throw error(400, 'No se puede eliminar el plato porque tiene registros relacionados');
      }
      throw error(500, 'Error interno del servidor');
    }
    
    throw error(500, 'Error interno del servidor');
  }
};
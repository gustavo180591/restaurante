import { z } from 'zod';

// Esquema para actualizar platos (parcial del esquema de creación)
export const platoUpdateSchema = z.object({
  nombre: z.string().min(3).max(255).optional(),
  descripcion: z.string().optional(),
  precio: z.number().min(0).optional(),
  activo: z.boolean().optional(),
  fotoId: z.number().int().positive().optional(),
  tiposPlato: z.array(z.number().int().positive()).min(1).optional(),
  especialidades: z.array(z.number().int().positive()).optional()
});

// Esquema para crear platos (ya usado en el código existente)
export const platoCreateSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(255),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  activo: z.boolean().default(true),
  fotoId: z.number().int().positive().optional(),
  tiposPlato: z.array(z.number().int().positive()).min(1, 'Debe seleccionar al menos un tipo de plato'),
  especialidades: z.array(z.number().int().positive()).optional().default([])
});

// Otros esquemas que podrían necesitarse
export const cartaCreateSchema = z.object({ Fecha: z.coerce.date() });

export const cartaDetalleAddSchema = z.object({
  platoId: z.number().int(),
  menuEspTipoPlatoId: z.number().int()
});

export const turnoCreateSchema = z.object({
  Menu_Id_Menu: z.number().int(),
  Estados_Id_estado: z.number().int(),
  HoraTurno: z.string().min(1).max(90),
});

export const especialidadCreateSchema = z.object({ NombreEspecialidad: z.string().min(2).max(65) });

export const menuEspecialidadCreateSchema = z.object({
  TurnosMenu_Id_Turno: z.number().int(),
  Especialidades_Id_especialidad: z.number().int(),
});

export const menuEspTipoCreateSchema = z.object({
  MenuEspecialidad_Id_MenuEspecialidad: z.number().int(),
  TipoPlato_Id_TipoPlato: z.number().int(),
});
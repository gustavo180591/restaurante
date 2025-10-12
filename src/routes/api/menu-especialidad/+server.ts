// src/routes/api/menu-especialidad/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const menuEspecialidadSchema = z.object({
  Especialidades_Id_especialidad: z.number().int().positive(),
  TurnosMenu_Id_Turno: z.number().int().positive()
});

export const GET: RequestHandler = async () => {
  const relaciones = await prisma.menuEspecialidad.findMany({
    include: { 
      especialidad: true,
      turno: true
    }
  });
  return new Response(JSON.stringify(relaciones), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = menuEspecialidadSchema.parse(await request.json());
  const relacion = await prisma.menuEspecialidad.create({ 
    data,
    include: {
      especialidad: true,
      turno: true
    }
  });
  return new Response(JSON.stringify(relacion), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
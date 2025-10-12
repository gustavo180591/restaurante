// src/routes/api/especialidades/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const especialidadSchema = z.object({
  NombreEspecialidad: z.string().min(2).max(100),
  Descripcion: z.string().max(500).optional().nullable(),
  Activo: z.boolean().default(true)
});

export const GET: RequestHandler = async () => {
  const especialidades = await prisma.especialidades.findMany({
    orderBy: { NombreEspecialidad: 'asc' }
  });
  return new Response(JSON.stringify(especialidades), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = especialidadSchema.parse(await request.json());
  const especialidad = await prisma.especialidades.create({ data });
  return new Response(JSON.stringify(especialidad), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
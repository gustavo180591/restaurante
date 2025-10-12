// src/routes/api/menu-esp-tipo/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const menuEspTipoSchema = z.object({
  MenuEspecialidad_Id_MenuEspecialidad: z.number().int().positive(),
  TipoPlato_Id_TipoPlato: z.number().int().positive(),
  Estados_Id_estado: z.number().int().positive()
});

export const GET: RequestHandler = async () => {
  const relaciones = await prisma.menuEspTipoPlato.findMany({
    include: { 
      menuEspecialidad: true, 
      tipoPlato: true
    }
  });
  return new Response(JSON.stringify(relaciones), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = menuEspTipoSchema.parse(await request.json());
  const relacion = await prisma.menuEspTipoPlato.create({ 
    data,
    include: {
      menuEspecialidad: true,
      tipoPlato: true
    }
  });
  return new Response(JSON.stringify(relacion), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
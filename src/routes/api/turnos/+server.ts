// src/routes/api/turnos/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const turnoSchema = z.object({
  HoraInicio: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'HoraInicio must be in format HH:MM:SS'),
  HoraFin: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'HoraFin must be in format HH:MM:SS'),
  Nombre: z.string().min(2).max(100),
  Descripcion: z.string().max(255).optional().nullable(),
  Activo: z.boolean().default(true),
  menuId: z.number().int().positive('Menu ID must be a positive integer'),
  estadoId: z.number().int().positive('Estado ID must be a positive integer')
});

export const GET: RequestHandler = async () => {
  const turnos = await prisma.turnosMenu.findMany({
    include: { menu: true, estado: true },
    orderBy: { HoraInicio: 'asc' }
  });
  return new Response(JSON.stringify(turnos), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const requestData = turnoSchema.parse(await request.json());
  
  // Convert time strings to Date objects for Prisma
  const [horaInicioHours, horaInicioMinutes] = requestData.HoraInicio.split(':').map(Number);
  const [horaFinHours, horaFinMinutes] = requestData.HoraFin.split(':').map(Number);
  
  const horaInicio = new Date();
  horaInicio.setHours(horaInicioHours, horaInicioMinutes, 0, 0);
  
  const horaFin = new Date();
  horaFin.setHours(horaFinHours, horaFinMinutes, 0, 0);

  const turno = await prisma.turnosMenu.create({
    data: {
      HoraInicio: horaInicio,
      HoraFin: horaFin,
      Nombre: requestData.Nombre,
      Descripcion: requestData.Descripcion,
      Activo: requestData.Activo,
      Menu_Id_Menu: requestData.menuId,
      Estados_Id_estado: requestData.estadoId
    },
    include: {
      menu: true,
      estado: true
    }
  });
  
  return new Response(JSON.stringify(turno), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
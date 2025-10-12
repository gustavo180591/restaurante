// src/routes/api/menu/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const menuSchema = z.object({
  NombreMenu: z.string().min(2).max(100)
});

export const GET: RequestHandler = async () => {
  const menus = await prisma.menu.findMany({
    include: { Turnos: true },
    orderBy: { Id_Menu: 'desc' }
  });
  return new Response(JSON.stringify(menus), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const requestData = menuSchema.parse(await request.json());
  const menu = await prisma.menu.create({
    data: {
      NombreMenu: requestData.NombreMenu
    }
  });
  return new Response(JSON.stringify(menu), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
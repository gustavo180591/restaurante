// src/routes/api/estados/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';

export const GET: RequestHandler = async () => {
  const estados = await prisma.estados.findMany({
    orderBy: { NombEstado: 'asc' }
  });
  return new Response(JSON.stringify(estados), {
    headers: { 'content-type': 'application/json' }
  });
};
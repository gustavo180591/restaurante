// src/routes/api/tipos-plato/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const tipoPlatoSchema = z.object({
  NombreTipo: z.string().min(2).max(50)
});

export const GET: RequestHandler = async () => {
  const tipos = await prisma.tipoPlato.findMany({
    orderBy: { NombreTipo: 'asc' }
  });
  return new Response(JSON.stringify(tipos), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const data = tipoPlatoSchema.parse(await request.json());
  const tipo = await prisma.tipoPlato.create({ data });
  return new Response(JSON.stringify(tipo), {
    status: 201,
    headers: { 'content-type': 'application/json' }
  });
};
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { z } from 'zod';

const createSchema = z.object({
  NombrePlato: z.string().min(2).max(95),
  Precio: z.coerce.number().nonnegative(),
  Fotos_Id_Foto: z.number().int().nullable().optional()
});

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') ?? undefined;
  const data = await prisma.platos.findMany({
    where: q ? { NombrePlato: { contains: q, mode: 'insensitive' } } : undefined,
    include: { foto: true },
    orderBy: { Id_Plato: 'desc' }
  });
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = createSchema.parse(await request.json());
  if (body.Fotos_Id_Foto != null) {
    const exists = await prisma.fotos.findUnique({ where: { Id_Foto: body.Fotos_Id_Foto } });
    if (!exists) return new Response('La imagen no existe', { status: 400 });
  }
  const created = await prisma.platos.create({ data: { ...body, Fotos_Id_Foto: body.Fotos_Id_Foto ?? null } });
  return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } });
};

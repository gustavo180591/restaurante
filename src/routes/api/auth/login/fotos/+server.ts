import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { putObject } from '$lib/uploads/storage';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return new Response('No autenticado', { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) return new Response('Archivo inválido', { status: 400 });

  const up = await putObject(file);
  const created = await prisma.fotos.create({ data: { Ruta: up.key, Tipo: file.type } });
  return new Response(JSON.stringify({ id: created.Id_Foto, url: up.url, key: up.key, mime: up.mime }), { status: 201, headers: { 'content-type': 'application/json' } });
};

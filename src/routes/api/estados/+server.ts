// src/routes/api/estados/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { cache } from '$lib/cache/redis';
import { prisma } from '$lib/db/prisma';

export const GET: RequestHandler = async () => {
  try {
    // Intentar obtener de caché primero
    const cachedEstados = await cache.estados.get();

    if (cachedEstados.length > 0) {
      return json(cachedEstados);
    }

    // Si no está en caché, consultar base de datos
    const estados = await prisma.estados.findMany({
      orderBy: { NombEstado: 'asc' }
    });

    // Guardar en caché para futuras consultas
    await cache.estados.set(estados);

    return json(estados);

  } catch (error) {
    console.error('Error al obtener estados:', error);
    throw error(500, 'Error interno del servidor');
  }
};
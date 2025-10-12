import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';

export const GET: RequestHandler = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new Response(
      JSON.stringify({ status: 'ok' }), 
      { 
        headers: { 'content-type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        status: 'degraded', 
        error: errorMessage 
      }), 
      { 
        status: 503, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
};

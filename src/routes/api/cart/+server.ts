import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Obtener carrito (por ahora solo devuelve estructura básica)
export const GET: RequestHandler = async () => {
  return json({
    message: 'Carrito API - Implementación futura',
    items: [],
    total: 0
  });
};

// Agregar item al carrito (por ahora solo devuelve confirmación)
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  // Validar datos básicos
  if (!body.producto || !body.cantidad) {
    return new Response(
      JSON.stringify({ error: 'Datos inválidos' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return json({
    message: 'Producto agregado al carrito (implementación futura)',
    producto: body.producto,
    cantidad: body.cantidad,
    nota: body.nota || null
  });
};

// Actualizar carrito (por ahora solo devuelve confirmación)
export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json();

  return json({
    message: 'Carrito actualizado (implementación futura)',
    items: body.items || []
  });
};

// Limpiar carrito (por ahora solo devuelve confirmación)
export const DELETE: RequestHandler = async () => {
  return json({
    message: 'Carrito limpiado (implementación futura)'
  });
};

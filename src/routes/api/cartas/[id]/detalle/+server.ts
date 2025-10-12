// src/routes/api/cartas/[id]/detalle/+server.ts
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/prisma';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(400, 'ID de carta inválido');

  const detalles = await prisma.cartaDetalle.findMany({
    where: { Cartas_idCartas: id },
    include: { 
      platoCarta: {
        include: {
          plato: true,
          menuEspTipo: {
            include: {
              tipoPlato: true
            }
          }
        }
      } 
    }
  });

  return new Response(JSON.stringify(detalles), {
    headers: { 'content-type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ params, request }) => {
  const id = Number(params.id);
  if (isNaN(id)) throw error(400, 'ID de carta inválido');

  const data = z.object({
    Platos_Id_Plato: z.number().int().positive(),
    TipoPlato_Id_TipoPlato: z.number().int().positive(),
    Precio: z.number().positive()
  }).parse(await request.json());

  try {
    const detalle = await prisma.cartaDetalle.create({
      data: {
        Platos_has_MenuEspTipoPlato_Id_PlatoCarta: data.Platos_Id_Plato.toString(),
        Cartas_idCartas: id
      },
      include: {
        platoCarta: {
          include: {
            plato: true,
            menuEspTipo: {
              include: {
                tipoPlato: true
              }
            }
          }
        }
      }
    });

    return new Response(JSON.stringify(detalle), {
      status: 201,
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    console.error('Error creating detalle carta:', err);
    throw error(500, 'Error al crear el detalle de la carta');
  }
};
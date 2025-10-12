import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ cookies }) => { cookies.delete('sid', { path: '/' }); return new Response(null, { status: 204 }); };

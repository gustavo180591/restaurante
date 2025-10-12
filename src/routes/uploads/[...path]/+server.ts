import type { RequestHandler } from './$types';
import { readFile } from 'node:fs/promises';

export const GET: RequestHandler = async ({ params }) => {
  const dir = process.env.DISK_UPLOAD_DIR || './storage/uploads';
  const file = `${dir}/${params.path}`;
  try {
    const data = await readFile(file);
    const ext = file.split('.').pop()?.toLowerCase();
    const mime = ext==='png'?'image/png': (ext==='jpg'||ext==='jpeg')?'image/jpeg': ext==='webp'?'image/webp':'application/octet-stream';
    return new Response(data, { headers: { 'content-type': mime } });
  } catch { return new Response('Not found', { status: 404 }); }
};

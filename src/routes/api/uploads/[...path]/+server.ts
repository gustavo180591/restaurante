// src/routes/api/uploads/[...path]/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STORAGE_DRIVER, UPLOAD_DIR } from '$env/static/private';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const GET: RequestHandler = async ({ params }) => {
  if (STORAGE_DRIVER !== 'disk') {
    throw error(404, 'Not Found');
  }

  const filePath = path.join(__dirname, '../../..', UPLOAD_DIR, params.path);
  
  try {
    const file = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    const mime = getMimeType(ext);
    
    return new Response(file, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    throw error(404, 'Archivo no encontrado');
  }
};

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}
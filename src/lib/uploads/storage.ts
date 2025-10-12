import { randomUUID } from 'crypto';
import { extname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

export async function putObject(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = extname(file.name) || '.jpg';
  const key = `${new Date().toISOString().slice(0,10)}/${randomUUID()}${ext}`;
  const baseDir = process.env.DISK_UPLOAD_DIR || './storage/uploads';
  const full = `${baseDir}/${key}`;
  await mkdir(full.substring(0, full.lastIndexOf('/')), { recursive: true });
  await writeFile(full, buf);
  return { key, url: `/uploads/${key}`, mime: file.type };
}

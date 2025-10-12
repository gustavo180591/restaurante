// src/routes/api/upload/+server.ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UPLOAD_DIR } from '$env/static/private';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../..', UPLOAD_DIR);

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { image } = await request.json();
    if (!image) {
      throw error(400, 'No image provided');
    }

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const filename = `${uuidv4()}.jpg`;
    const filePath = path.join(uploadDir, filename);
    
    // Save file
    fs.writeFileSync(filePath, buffer);
    
    // Return the URL where the file can be accessed
    return json({ 
      success: true, 
      url: `/api/uploads/${filename}`
    });
  } catch (err) {
    console.error('Upload error:', err);
    throw error(500, 'Error uploading image');
  }
};
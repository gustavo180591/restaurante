import { randomBytes, createHash, createHmac, timingSafeEqual } from 'crypto';
import { env } from '$env/dynamic/private';
import { prisma } from '$lib/db/prisma';

export const SESSION_COOKIE_NAME = 'sid';
const SESSION_SECRET = env.SESSION_SECRET || 'default-session-secret';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

interface SessionData {
  id: number;
  role: 'Admin' | 'Operador' | 'Mozo';
  email?: string;
  lastActive: number;
  userAgent: string;
  ip: string;
  sessionVersion: number;
}

export function createSessionToken(data: Omit<SessionData, 'lastActive'>): string {
  const sessionData = {
    ...data,
    lastActive: Date.now(),
  };
  
  const encodedData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  const signature = createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('hex');
  
  return `${encodedData}.${signature}`;
}

export function parseSessionToken(token: string): SessionData | null {
  const [encodedData, signature] = token.split('.');
  if (!encodedData || !signature) return null;

  try {
    // Verificar la firma
    const expectedSignature = createHmac('sha256', SESSION_SECRET)
      .update(encodedData)
      .digest('hex');
    
    if (!timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )) {
      return null;
    }

    const sessionData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));
    
    // Verificar si la sesión ha expirado
    const sessionAge = Date.now() - sessionData.lastActive;
    if (sessionAge > SESSION_MAX_AGE * 1000) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error parsing session token:', error);
    return null;
  }
}

export async function invalidateSession(userId: number): Promise<void> {
  // Aquí podrías implementar la lógica para invalidar sesiones
  // Por ejemplo, guardando un contador de versión en la base de datos
  await prisma.usuarios.update({
    where: { Id_usuario: userId },
    data: { sessionVersion: { increment: 1 } }
  });
}

export function createCSRFToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(`${token}${SESSION_SECRET}`)
    .digest('hex');
  return { token, hash };
}

export function verifyCSRFToken(token: string, hash: string): boolean {
  const expectedHash = createHash('sha256')
    .update(`${token}${SESSION_SECRET}`)
    .digest('hex');
  return timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}
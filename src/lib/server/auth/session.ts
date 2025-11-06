import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { promisify } from 'util';

// Environment variables
const PRIVATE_SECRET = process.env.PRIVATE_SECRET || '';
const SESSION_SECRET = process.env.SESSION_SECRET || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PRIVATE_SECRET || !SESSION_SECRET) {
  throw new Error('Missing required environment variables: PRIVATE_SECRET and SESSION_SECRET must be set');
}

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY = Buffer.from(SESSION_SECRET.padEnd(32, '0').slice(0, 32), 'utf8');
const randomBytesAsync = promisify(randomBytes);

export interface SessionData {
  userId: string;
  roles: string[];
  sessionVersion: number;
  iat?: number;
  exp?: number;
  createdAt?: string;
}

/**
 * Encrypts session data into a string
 */
export async function encryptSession(session: SessionData): Promise<string> {
  const iv = await randomBytesAsync(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const sessionWithTimestamp = {
    ...session,
    createdAt: new Date().toISOString()
  };
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(sessionWithTimestamp), 'utf8'),
    cipher.final()
  ]);
  
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a session string back into session data
 */
export async function decryptSession(encryptedSession: string): Promise<SessionData | null> {
  try {
    const [ivHex, encryptedHex] = encryptedSession.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid session format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, KEY, iv);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    const sessionData = JSON.parse(decrypted.toString('utf8'));
    
    // Validate session data
    if (!sessionData.userId || !sessionData.roles || !sessionData.sessionVersion) {
      throw new Error('Invalid session data');
    }
    
    // Check if session is expired (30 days max age)
    if (sessionData.createdAt) {
      const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime();
      const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      if (sessionAge > maxSessionAge) {
        throw new Error('Session expired');
      }
    }
    
    return sessionData;
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

/**
 * Returns cookie options for session cookie
 */
export function getSessionCookieOptions() {
  const isProduction = NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    // Only set domain in production
    ...(isProduction ? { domain: 'yourdomain.com' } : {})
  };
}

/**
 * Creates a new session
 */
export async function createSession(userId: string, roles: string[], sessionVersion: number): Promise<string> {
  if (!userId || !roles || !Array.isArray(roles)) {
    throw new Error('Invalid session data');
  }

  const sessionData: SessionData = {
    userId,
    roles,
    sessionVersion,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 1 week
  };

  return encryptSession(sessionData);
}

/**
 * Extracts session token from cookie header
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = new Map(
    cookieHeader.split(';').map(c => {
      const [key, ...values] = c.trim().split('=');
      return [key, values.join('=')];
    })
  );
  
  return cookies.get('session') || null;
}

/**
 * Gets session data from request
 */
export async function getSessionFromRequest(request: Request): Promise<SessionData | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);
    
    if (!token) {
      return null;
    }
    
    return await decryptSession(token);
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Creates a cookie string that will delete the session
 */
export function createSessionDeletionCookie(): string {
  const isProduction = NODE_ENV === 'production';
  
  return [
    'session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    isProduction ? 'Secure' : '',
    isProduction ? 'Domain=yourdomain.com' : ''
  ].filter(Boolean).join('; ');
}

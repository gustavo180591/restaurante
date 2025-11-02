import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { dev } from '$app/environment';
import { SESSION_SECRET } from '$env/static/private';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Ensure the secret is the correct length for AES-256
const getKey = () => {
  // Ensure the key is exactly 32 bytes (256 bits) for AES-256
  const secret = SESSION_SECRET || 'fallback-secret-key-please-change';
  return Buffer.from(secret.padEnd(32, '0').slice(0, 32), 'utf-8');
};

const key = getKey();

export async function createSession(userId: number, event: any) {
  try {
    if (!userId) {
      throw new Error('User ID is required to create a session');
    }

    // Create a random IV
    const iv = randomBytes(IV_LENGTH);
    
    // Create a cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the user ID with timestamp
    const sessionData = {
      userId,
      createdAt: new Date().toISOString()
    };
    
    const dataString = JSON.stringify(sessionData);
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data
    const token = `${iv.toString('hex')}:${encrypted}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days

    // Create the cookie with security headers
    const cookie = [
      `session=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Expires=${expires.toUTCString()}`,
      !dev && 'Secure',
      'Max-Age=2592000' // 30 days in seconds
    ].filter(Boolean).join('; ');

    return { cookie, token };
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSessionToken(event: any) {
  try {
    const cookie = event.request.headers.get('cookie');
    if (!cookie) return null;
    
    const match = cookie.match(/session=([^;]+)/);
    if (!match?.[1]) return null;
    
    const token = match[1];
    const [ivHex, encrypted] = token.split(':');
    
    if (!ivHex || !encrypted) {
      console.error('Invalid session token format');
      return null;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== IV_LENGTH) {
      console.error('Invalid IV length');
      return null;
    }
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = '';
    try {
      decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
    
    // Parse the session data
    const sessionData = JSON.parse(decrypted);
    
    // Basic validation
    if (!sessionData?.userId || !sessionData?.createdAt) {
      console.error('Invalid session data');
      return null;
    }
    
    // Optional: Check if the session is too old
    const sessionAge = Date.now() - new Date(sessionData.createdAt).getTime();
    const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (sessionAge > maxSessionAge) {
      console.error('Session expired');
      return null;
    }
    
    return { userId: sessionData.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function deleteSession() {
  return [
    'session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0'
  ].join('; ');
}

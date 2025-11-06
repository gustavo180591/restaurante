import { z } from 'zod';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

// Configuration
const COOKIE = process.env.SESSION_COOKIE_NAME ?? '__sid';
const TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? '7');
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? '12');

// Schemas
export const registerSchema = z.object({
  email: z.string().email('Email inválido').min(3),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  name: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirm: z.string()
}).refine(data => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm']
});

export const loginSchema = z.object({
  emailOrDni: z.string().min(3, 'Email o DNI requerido'),
  password: z.string().min(1, 'Contraseña requerida')
});

// Auth functions
export async function createUser(data: z.infer<typeof registerSchema>) {
  const hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        dni: data.dni,
        name: data.name || null,
        password: hash
      }
    });
    return user;
  } catch (e: any) {
    if (e.code === 'P2002') {
      throw new Error('Email o DNI ya están registrados');
    }
    throw e;
  }
}

export async function verifyCredentials(emailOrDni: string, password: string) {
  const where = emailOrDni.includes('@')
    ? { email: emailOrDni.toLowerCase() }
    : { dni: emailOrDni };

  const user = await prisma.user.findUnique({ where });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

export async function createSession(
  userId: string, 
  ip?: string, 
  userAgent?: string
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TTL_DAYS);

  return prisma.session.create({
    data: { 
      userId, 
      expiresAt,
      ip,
      userAgent
    }
  });
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({ 
    where: { id: sessionId },
    include: { user: true }
  });

  if (!session) return null;
  
  // Delete expired session
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}

export async function destroySession(sessionId: string) {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export function sessionCookieAttributes() {
  return {
    name: COOKIE,
    options: {
      path: '/',
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: TTL_DAYS * 24 * 60 * 60
    }
  };
}
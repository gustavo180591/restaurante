// In /src/routes/api/auth/register/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createSession, sessionCookieAttributes } from '$lib/server/auth';

const registerSchema = z.object({
  email: z.string().email(),
  dni: z.string().min(8).max(20),
  name: z.string().min(2).optional(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const POST = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const result = registerSchema.safeParse(data);
    
    if (!result.success) {
      return json({ error: 'Invalid data', details: result.error.flatten() }, { status: 400 });
    }

    const { email, dni, name, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { dni }] }
    });

    if (existingUser) {
      return json(
        { error: 'User with this email or DNI already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        dni,
        name,
        password: hashedPassword
      }
    });

    // Create session
    const session = await createSession(user.id);
    const { name: cookieName, options } = sessionCookieAttributes();
    
    cookies.set(cookieName, session.id, options);

    return json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
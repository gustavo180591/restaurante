import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export Prisma types for type safety
export type { Usuarios, Clientes, Empleados } from '@prisma/client';

// Helper function to handle database errors
export function handleDbError(error: unknown): { success: boolean; message: string } {
  console.error('Database error:', error);
  
  if (error instanceof Error) {
    // Handle specific Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return { 
        success: false, 
        message: 'Error en la base de datos. Por favor, intente nuevamente.' 
      };
    }
    
    return { 
      success: false, 
      message: error.message || 'Error inesperado en la base de datos' 
    };
  }
  
  return { 
    success: false, 
    message: 'Error desconocido en la base de datos' 
  };
}

// Helper to exclude fields from a user object
export function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  return Object.fromEntries(
    Object.entries(user as any).filter(([key]) => !keys.includes(key as Key))
  ) as Omit<User, Key>;
}

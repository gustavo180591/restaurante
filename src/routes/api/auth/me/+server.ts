import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db/prisma';
import type { RequestHandler } from './$types';

type UserRole = 'ADMIN' | 'EMPLEADO' | 'CLIENTE';

interface UserResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    usuario: string;
    email: string | null;
    activo: boolean;
    ultimoAcceso: Date | null;
    rol: UserRole;
    esCliente: boolean;
    esEmpleado: boolean;
    clienteId: number | null;
    empleadoId: number | null;
  };
  error?: string;
}

export const GET: RequestHandler = async ({ locals }): Promise<Response> => {
  // Check if user is authenticated
  if (!locals.user) {
    return json(
      { success: false, message: 'No autenticado' } as UserResponse,
      { status: 401 }
    );
  }

  try {
    // Convert string ID to number
    const userId = parseInt(locals.user.id);
    if (isNaN(userId)) {
      return json(
        { success: false, message: 'ID de usuario inválido' } as UserResponse,
        { status: 400 }
      );
    }

    // Get user with their related data
    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      include: {
        clientes: {
          select: { Id_Cliente: true },
          take: 1
        },
        empleados: {
          select: { Id_empleado: true },
          take: 1
        }
      }
    });

    if (!user) {
      return json(
        { success: false, message: 'Usuario no encontrado' } as UserResponse,
        { status: 404 }
      );
    }

    // Update last access time
    await prisma.usuarios.update({
      where: { id: userId },
      data: { ultimoAcceso: new Date() }
    });

    // Determine user role based on what's available
    const role: UserRole = (user.rol as UserRole) || 'CLIENTE';
    
    // Prepare response data
    const response: UserResponse = {
      success: true,
      data: {
        id: user.id,
        usuario: user.usuario,
        email: user.email,
        activo: user.activo,
        ultimoAcceso: user.ultimoAcceso,
        rol: role,
        esCliente: user.clientes?.length > 0 || false,
        esEmpleado: user.empleados?.length > 0 || false,
        clienteId: user.clientes?.[0]?.Id_Cliente || null,
        empleadoId: user.empleados?.[0]?.Id_empleado || null
      }
    };
    
    return json(response, { 
      status: 200,
      headers: { 'cache-control': 'no-store, max-age=0' }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    const errorResponse: UserResponse = {
      success: false,
      message: 'Error al obtener los datos del usuario'
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error instanceof Error ? error.message : 'Error desconocido';
    }

    return json(errorResponse, { status: 500 });
  }
};

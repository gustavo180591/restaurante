import { prisma } from '../src/lib/db/prisma';
import { hash } from 'bcryptjs';
import { execSync } from 'child_process';

async function main() {
  const email = 'gustavo.faccendini@gmail.com';
  const newPassword = 'Mariel1805'; // Sin el $

  try {
    // Verificar si el usuario existe
    const user = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!user) {
      console.error('Usuario no encontrado');
      process.exit(1);
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hash(newPassword, 12);
    
    // Actualizar la contraseña
    await prisma.usuarios.update({
      where: { id: user.id },
      data: { 
        clave: hashedPassword,
        sessionVersion: { increment: 1 } // Invalidar sesiones existentes
      }
    });

    console.log('Contraseña actualizada exitosamente');
    console.log('Nuevo hash:', hashedPassword);
    
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

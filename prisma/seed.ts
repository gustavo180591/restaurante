import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  // Perfiles
  await prisma.perfiles.createMany({
    data: [{ NombrePerfil: 'Admin' }, { NombrePerfil: 'Operador' }, { NombrePerfil: 'Mozo' }],
    skipDuplicates: true
  });

  // Estados
  await prisma.estados.createMany({
    data: [{ NombEstado: 'Activo' }, { NombEstado: 'Inactivo' }],
    skipDuplicates: true
  });

  // Tipos de plato
  await prisma.tipoPlato.createMany({
    data: [
      { NombreTipo: 'Entrada' },
      { NombreTipo: 'Principal' },
      { NombreTipo: 'Postre' },
      { NombreTipo: 'Bebida' }
    ],
    skipDuplicates: true
  });

  // Usuario admin (si no existe)
  const adminPerfil = await prisma.perfiles.findFirst({ where: { NombrePerfil: 'Admin' } });
  const adminUser = await prisma.usuarios.findFirst({ where: { usuario: 'admin' } });
  if (!adminUser && adminPerfil) {
    const hash = await bcrypt.hash('admin', 10); // cambia en prod
    await prisma.usuarios.create({
      data: {
        usuario: 'admin',
        clave: hash,
        Perfiles_Id_Perfil: adminPerfil.Id_Perfil
      }
    });
  }
}

main().finally(async () => { await prisma.$disconnect(); });

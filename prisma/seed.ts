import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // No seed data - database will remain empty
  console.log('No seed data to apply.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

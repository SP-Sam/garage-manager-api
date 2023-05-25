import { PrismaClient, RoleSlug } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.employeeRole.createMany({
    data: [
      { name: 'Master', slug: RoleSlug.MASTER },
      { name: 'Manager', slug: RoleSlug.MANAGER },
      { name: 'Mechanic', slug: RoleSlug.MECHANIC },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

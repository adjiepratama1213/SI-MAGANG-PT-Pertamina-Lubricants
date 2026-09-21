import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `postgres://postgres:admin@localhost:5432/it_magang_db?schema=public`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.organization.deleteMany({
    where: { name: '123' }
  });
  console.log(`Deleted ${result.count} organization(s) named '123'.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

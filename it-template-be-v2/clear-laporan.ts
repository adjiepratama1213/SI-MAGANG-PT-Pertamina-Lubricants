import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: 'postgres://postgres:admin@localhost:5432/it_magang_db?schema=public' });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "Laporan" CASCADE');
  console.log('Laporan table dropped.');
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);

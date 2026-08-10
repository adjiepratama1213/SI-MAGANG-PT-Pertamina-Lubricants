import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const roundsOfHashing = 10;

// Resolve template variables in DATABASE_URL
function resolveDatabaseUrl(url: string): string {
  if (!url || !url.includes('${')) {
    return url;
  }
  return url
    .replace(/\$\{DB_USER\}/g, process.env.DB_USER || '')
    .replace(/\$\{DB_PASS\}/g, process.env.DB_PASS || '')
    .replace(/\$\{DB_HOST\}/g, process.env.DB_HOST || 'localhost')
    .replace(/\$\{DB_PORT\}/g, process.env.DB_PORT || '5432')
    .replace(/\$\{DB_NAME\}/g, process.env.DB_NAME || '');
}

const databaseUrl = process.env.DATABASE_URL || '';
const resolvedUrl = resolveDatabaseUrl(databaseUrl);
const adapter = new PrismaPg({ connectionString: resolvedUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // const createPlant = await prisma.plant.createMany({
    //   skipDuplicates: true,
    //   data: [
    //     { id: 'LP01', name: 'Production Unit Jakarta', address: 'Jakarta' },
    //     { id: 'LP02', name: 'Production Unit Cilacap', address: 'Cilacap' },
    //     { id: 'LP03', name: 'Production Unit Gresik', address: 'Gresik' },
    //   ],
    // });

    const createOrganization = await prisma.organization.createMany({
      skipDuplicates: true,
      data: [{ id: '30305042', name: 'Production Unit Jakarta', companyCode: '2508' }],
    });

    const createPosition = await prisma.position.createMany({
      skipDuplicates: true,
      data: [
        {
          id: '30305042',
          name: 'Production Unit Jakarta',
          isHead: false,
          organizationId: '30305042',
          teamId: '30305042',
          isOwner: false,
          isSync: false,
          isPublished: true,
          isChief: true,
        },
      ],
    });

    const createUsers = await prisma.user.createMany({
      skipDuplicates: true,
      data: [
        {
          name: 'Admin',
          email: 'coroo.wicaksono@gmail.com',
          password: await bcrypt.hash(`sandi123`, roundsOfHashing),
          role: 'SUPERSAIYAN',
          positionId: '30305042',
          webAuthnId: '987154236501',
        },
        {
          name: 'PTPL IT',
          email: 'kuncoro.wicaksono.adi.baroto@gmail.com',
          password: await bcrypt.hash(`ptplit123`, roundsOfHashing),
          role: 'PTPL_IT',
          positionId: '30305042',
          webAuthnId: '214398675104',
        },
      ],
    });

    console.log({
      createOrganization,
      createPosition,
      createUsers,
    });
  } catch (error) {
    console.error(error);
  }
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

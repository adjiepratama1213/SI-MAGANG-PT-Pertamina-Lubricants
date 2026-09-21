import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { seedOrganizations } from './seed-org';

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
    const createOrganization = await prisma.organization.createMany({
      skipDuplicates: true,
      data: [
        { id: '30305042', name: 'Production Unit Jakarta', companyCode: '2508' },
        ...seedOrganizations
      ],
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

    // Upsert users satu-satu agar kita dapat ID-nya untuk relasi profil
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { phone: '081200000001' },
      create: {
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin', roundsOfHashing),
        role: 'SUPERSAIYAN',
        positionId: '30305042',
        webAuthnId: 'admin_webauthn_id_1',
        phone: '081200000001',
      },
    });

    const vpUser = await prisma.user.upsert({
      where: { email: 'vp@example.com' },
      update: { phone: '081200000002' },
      create: {
        name: 'VP',
        email: 'vp@example.com',
        password: await bcrypt.hash('admin', roundsOfHashing),
        role: 'EMPLOYEE',
        positionId: '30305042',
        webAuthnId: 'vp_webauthn_id_1',
        phone: '081200000002',
      },
    });

    const mentorUser = await prisma.user.upsert({
      where: { email: 'mentor@example.com' },
      update: { phone: '081200000003' },
      create: {
        name: 'Mentor',
        email: 'mentor@example.com',
        password: await bcrypt.hash('mentor123', roundsOfHashing),
        role: 'EMPLOYEESTAFF',
        positionId: '30305042',
        webAuthnId: 'mentor_webauthn_id_1',
        phone: '081200000003',
      },
    });

    const pesertaUser = await prisma.user.upsert({
      where: { email: 'peserta@example.com' },
      update: { phone: '081200000004' },
      create: {
        name: 'Peserta',
        email: 'peserta@example.com',
        password: await bcrypt.hash('peserta', roundsOfHashing),
        role: 'PESERTA',
        positionId: '30305042',
        webAuthnId: 'peserta_webauthn_id_1',
        phone: '081200000004',
      },
    });

    // Buat EmployeeProfile untuk Admin
    const adminProfile = await prisma.employeeProfile.upsert({
      where: { userId: adminUser.id },
      update: { subFungsi: 'IT Support', gender: 'PRIA' },
      create: {
        userId: adminUser.id,
        employeeId: 'NIP-ADMIN-001',
        jabatan: 'IT Administrator',
        direktorat: 'Direktorat Keuangan',
        fungsi: 'Teknologi Informasi',
        subFungsi: 'IT Support',
        gender: 'PRIA',
      },
    });

    // Buat EmployeeProfile untuk VP
    const vpProfile = await prisma.employeeProfile.upsert({
      where: { userId: vpUser.id },
      update: { direktorat: 'FINANCE & BUSINESS SUPPORT', fungsi: 'HUMAN CAPITAL & QUALITY MANAGEMENT', subFungsi: 'HC Admin', gender: 'PRIA' },
      create: {
        userId: vpUser.id,
        employeeId: 'NIP-VP-001',
        jabatan: 'Vice President',
        direktorat: 'FINANCE & BUSINESS SUPPORT',
        fungsi: 'HUMAN CAPITAL & QUALITY MANAGEMENT',
        subFungsi: 'HC Admin',
        gender: 'PRIA',
      },
    });

    // Buat EmployeeProfile untuk Mentor
    const mentorProfile = await prisma.employeeProfile.upsert({
      where: { userId: mentorUser.id },
      update: { subFungsi: 'Development', gender: 'PRIA' },
      create: {
        userId: mentorUser.id,
        employeeId: 'NIP-MENTOR-001',
        jabatan: 'Staff IT',
        direktorat: 'Direktorat Keuangan',
        fungsi: 'Teknologi Informasi',
        subFungsi: 'Development',
        gender: 'PRIA',
      },
    });

    // Buat InternProfile untuk Peserta — hubungkan ke Mentor
    const internProfile = await prisma.internProfile.upsert({
      where: { userId: pesertaUser.id },
      update: {},
      create: {
        userId: pesertaUser.id,
        internId: 'PST-2026-001',
        university: 'Universitas Indonesia',
        gender: 'PRIA',
        dateOfBirth: new Date('2003-05-15'),
        major: 'Teknik Informatika',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-01-31'),
        program: 'PKL',
        mentorProfileId: mentorProfile.id,
      },
    });

    console.log({
      createOrganization,
      createPosition,
      users: { adminUser: adminUser.id, vpUser: vpUser.id, mentorUser: mentorUser.id, pesertaUser: pesertaUser.id },
      profiles: { adminProfile: adminProfile.id, vpProfile: vpProfile.id, mentorProfile: mentorProfile.id, internProfile: internProfile.id },
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

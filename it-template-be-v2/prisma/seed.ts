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
      update: {
        name: 'Admin',
        password: await bcrypt.hash('Admin12345', roundsOfHashing),
        role: 'SUPERSAIYAN',
        positionId: '30305042',
        jobTitle: 'HC & QM Administrator',
        phone: '081211112222',
        status: 'active',
      },
      create: {
        name: 'Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin12345', roundsOfHashing),
        role: 'SUPERSAIYAN',
        positionId: '30305042',
        webAuthnId: 'admin_webauthn_id_1',
        phone: '081211112222',
        jobTitle: 'HC & QM Administrator',
        status: 'active',
      },
    });

    const vpUser = await prisma.user.upsert({
      where: { email: 'vp@example.com' },
      update: {
        name: 'VP',
        password: await bcrypt.hash('Vp123456', roundsOfHashing),
        role: 'EMPLOYEE',
        positionId: '30305042',
        jobTitle: 'Vice President',
        phone: '081233334444',
        status: 'active',
      },
      create: {
        name: 'VP',
        email: 'vp@example.com',
        password: await bcrypt.hash('Vp123456', roundsOfHashing),
        role: 'EMPLOYEE',
        positionId: '30305042',
        webAuthnId: 'vp_webauthn_id_1',
        phone: '081233334444',
        jobTitle: 'Vice President',
        status: 'active',
      },
    });

    const mentorUser = await prisma.user.upsert({
      where: { email: 'mentor@example.com' },
      update: {
        name: 'Mentor',
        password: await bcrypt.hash('Mentor123', roundsOfHashing),
        role: 'EMPLOYEESTAFF',
        positionId: '30305042',
        jobTitle: 'Senior Specialist Human Capital',
        phone: '081255556666',
        status: 'active',
      },
      create: {
        name: 'Mentor',
        email: 'mentor@example.com',
        password: await bcrypt.hash('Mentor123', roundsOfHashing),
        role: 'EMPLOYEESTAFF',
        positionId: '30305042',
        webAuthnId: 'mentor_webauthn_id_1',
        phone: '081255556666',
        jobTitle: 'Senior Specialist Human Capital',
        status: 'active',
      },
    });

    const pesertaUser = await prisma.user.upsert({
      where: { email: 'peserta@example.com' },
      update: {
        name: 'Peserta',
        password: await bcrypt.hash('Peserta123', roundsOfHashing),
        role: 'PESERTA',
        positionId: '30305042',
        jobTitle: 'Peserta Magang',
        phone: '081277778888',
        status: 'active',
      },
      create: {
        name: 'Peserta',
        email: 'peserta@example.com',
        password: await bcrypt.hash('Peserta123', roundsOfHashing),
        role: 'PESERTA',
        positionId: '30305042',
        webAuthnId: 'peserta_webauthn_id_1',
        phone: '081277778888',
        jobTitle: 'Peserta Magang',
        status: 'active',
      },
    });

    // Buat / Update EmployeeProfile untuk Admin (Direktorat Finance & Business Support, Fungsi Human Capital & Quality Management)
    const adminProfile = await prisma.employeeProfile.upsert({
      where: { userId: adminUser.id },
      update: {
        employeeId: 'NIP-ADMIN-001',
        jabatan: 'Admin Human Capital & Quality Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'HR Operations & Quality Management (QMS)',
        gender: 'PRIA',
      },
      create: {
        userId: adminUser.id,
        employeeId: 'NIP-ADMIN-001',
        jabatan: 'Admin Human Capital & Quality Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'HR Operations & Quality Management (QMS)',
        gender: 'PRIA',
      },
    });

    // Buat / Update EmployeeProfile untuk VP (Direktorat Finance & Business Support, Fungsi Human Capital & Quality Management)
    const vpProfile = await prisma.employeeProfile.upsert({
      where: { userId: vpUser.id },
      update: {
        employeeId: 'NIP-VP-001',
        jabatan: 'Vice President Human Capital & Quality Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'HR Operations & Quality Management (QMS)',
        gender: 'PRIA',
      },
      create: {
        userId: vpUser.id,
        employeeId: 'NIP-VP-001',
        jabatan: 'Vice President Human Capital & Quality Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'HR Operations & Quality Management (QMS)',
        gender: 'PRIA',
      },
    });

    // Buat / Update EmployeeProfile untuk Mentor (Sesuai organisasi di database: DIR_FINANCE -> FUNC_HCQM -> SUB_RTM)
    const mentorProfile = await prisma.employeeProfile.upsert({
      where: { userId: mentorUser.id },
      update: {
        employeeId: 'NIP-MENTOR-001',
        jabatan: 'Sr. Specialist Recruitment & Talent Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'Recruitment & Talent Management',
        gender: 'PRIA',
      },
      create: {
        userId: mentorUser.id,
        employeeId: 'NIP-MENTOR-001',
        jabatan: 'Sr. Specialist Recruitment & Talent Management',
        direktorat: 'Finance & Business Support',
        fungsi: 'Human Capital & Quality Management',
        subFungsi: 'Recruitment & Talent Management',
        gender: 'PRIA',
      },
    });

    // Buat / Update InternProfile untuk Peserta — sesuai aturan form pendaftaran & terhubung ke Mentor
    const internProfile = await prisma.internProfile.upsert({
      where: { userId: pesertaUser.id },
      update: {
        internId: 'PST-2026-001',
        university: 'Universitas Indonesia',
        gender: 'PRIA',
        dateOfBirth: new Date('2003-05-15'),
        major: 'Teknik Informatika',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-01-31'),
        program: 'Internship PTPL',
        bankName: 'Bank Mandiri',
        bankAccount: '1370012345678',
        documentUrls: ['/uploads/documents/sample-cv.pdf', '/uploads/documents/surat-pengantar.pdf'],
        mentorProfileId: mentorProfile.id,
      },
      create: {
        userId: pesertaUser.id,
        internId: 'PST-2026-001',
        university: 'Universitas Indonesia',
        gender: 'PRIA',
        dateOfBirth: new Date('2003-05-15'),
        major: 'Teknik Informatika',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-01-31'),
        program: 'Internship PTPL',
        bankName: 'Bank Mandiri',
        bankAccount: '1370012345678',
        documentUrls: ['/uploads/documents/sample-cv.pdf', '/uploads/documents/surat-pengantar.pdf'],
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

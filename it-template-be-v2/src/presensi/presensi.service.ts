import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IzinDto, CheckInOutDto } from './dto/presensi.dto';
import { PresensiStatus } from '@prisma/client';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async checkIn(userId: string, dto: CheckInOutDto, file?: Express.Multer.File) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await this.prisma.presensi.findFirst({
      where: {
        internProfileId: intern.id,
        tanggalInput: { gte: todayStart, lte: todayEnd },
      },
    });

    if (existing && existing.masuk) {
      throw new BadRequestException('Already checked in today');
    }

    const now = new Date();
    let status: PresensiStatus = PresensiStatus.HADIR;
    if (now.getHours() >= 8) {
      status = PresensiStatus.ALPHA;
    }

    let fileUrl = null;
    if (file) {
      fileUrl = `/uploads/${file.filename}`;
    }

    if (existing) {
      return this.prisma.presensi.update({
        where: { id: existing.id },
        data: {
          masuk: now,
          presensiStatus: status,
          lat: dto.lat,
          lng: dto.lng,
          keterangan: status === PresensiStatus.ALPHA ? (dto.keterangan || null) : null,
          fileBukti: status === PresensiStatus.ALPHA ? fileUrl : null,
        },
      });
    }

    return this.prisma.presensi.create({
      data: {
        internProfileId: intern.id,
        tanggalInput: now,
        masuk: now,
        presensiStatus: status,
        lat: dto.lat,
        lng: dto.lng,
        keterangan: status === PresensiStatus.ALPHA ? (dto.keterangan || null) : null,
        fileBukti: status === PresensiStatus.ALPHA ? fileUrl : null,
      },
    });
  }

  async checkOut(userId: string, dto: CheckInOutDto) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presensi = await this.prisma.presensi.findFirst({
      where: {
        internProfileId: intern.id,
        tanggalInput: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!presensi) {
      throw new BadRequestException('No check-in record found for today');
    }
    if (!presensi.masuk) {
      throw new BadRequestException('Anda belum melakukan check-in hari ini');
    }
    if (presensi.keluar) {
      throw new BadRequestException('Already checked out today');
    }

    const now = new Date();
    
    // Auto Alpha rule: Must check out after 16:00 and work >= 8 hours
    const diffHours = (now.getTime() - presensi.masuk.getTime()) / (1000 * 60 * 60);
    let finalStatus = presensi.presensiStatus;
    
    if (now.getHours() < 16 || diffHours < 8) {
      finalStatus = PresensiStatus.ALPHA;
    }

    return this.prisma.presensi.update({
      where: { id: presensi.id },
      data: {
        keluar: now,
        presensiStatus: finalStatus,
        lat: dto.lat || presensi.lat,
        lng: dto.lng || presensi.lng,
      },
    });
  }

  async submitIzin(userId: string, dto: IzinDto, file?: Express.Multer.File) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    const start = new Date(dto.tanggalMulai);
    const end = new Date(dto.tanggalSelesai);
    const newEntries = [];

    let fileUrl = null;
    if (file) {
      fileUrl = `/uploads/${file.filename}`;
    }

    // Insert for each day in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d);
      
      // Delete existing record for this date to prevent duplicates
      const currentDayStart = new Date(current);
      currentDayStart.setHours(0,0,0,0);
      const currentDayEnd = new Date(current);
      currentDayEnd.setHours(23,59,59,999);
      
      await this.prisma.presensi.deleteMany({
        where: {
          internProfileId: intern.id,
          tanggalInput: {
            gte: currentDayStart,
            lte: currentDayEnd
          }
        }
      });

      newEntries.push({
        internProfileId: intern.id,
        tanggalInput: new Date(current),
        presensiStatus: dto.tipe,
        keterangan: dto.keterangan || null,
        tanggalSelesai: end,
        fileBukti: fileUrl,
      });
    }

    await this.prisma.presensi.createMany({
      data: newEntries,
    });
    return { success: true, count: newEntries.length };
  }

  async getMyPresensi(userId: string) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    await this.ensureTodayPresensi([intern.id]);

    return this.prisma.presensi.findMany({
      where: { internProfileId: intern.id },
      orderBy: { tanggalInput: 'desc' },
    });
  }

  async getMentorPresensi(mentorUserId: string) {
    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { userId: mentorUserId },
      include: { internsMentored: true }
    });
    if (!mentor) throw new NotFoundException('Mentor profile not found');

    const internIds = mentor.internsMentored.map(i => i.id);
    await this.ensureTodayPresensi(internIds);

    return this.prisma.presensi.findMany({
      where: {
        internProfile: {
          mentorProfileId: mentor.id,
        },
      },
      include: {
        internProfile: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { tanggalInput: 'desc' },
    });
  }

  async updateStatus(id: string, presensiStatus: PresensiStatus) {
    const presensi = await this.prisma.presensi.findUnique({
      where: { id },
    });
    
    if (!presensi) {
      throw new NotFoundException('Presensi tidak ditemukan');
    }

    return this.prisma.presensi.update({
      where: { id },
      data: {
        presensiStatus,
      },
    });
  }

  async getAdminMonthlyPresensi(monthStr: string) {
    if (!monthStr || !monthStr.includes('-')) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM');
    }
    const [year, month] = monthStr.split('-');
    
    // Construct local startDate and endDate for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const interns = await this.prisma.internProfile.findMany({
      include: {
        user: { select: { name: true } },
        mentor: { 
          include: { user: { select: { name: true } } }
        },
        presensi: {
          where: {
            tanggalInput: { gte: startDate, lte: endDate }
          },
          orderBy: { tanggalInput: 'asc' }
        }
      }
    });

    return interns.map(intern => {
      let totalHadir = 0;
      let totalIzin = 0;
      let totalAlpha = 0;

      const presensiDetail = intern.presensi.map(p => {
        if (p.presensiStatus === 'HADIR' || p.presensiStatus === 'HADIR_TERLAMBAT') totalHadir++;
        else if (p.presensiStatus === 'IZIN' || p.presensiStatus === 'SAKIT') totalIzin++;
        else if (p.presensiStatus === 'ALPHA') totalAlpha++;

        // Convert UTC DB time to WIB String (assumes DB timezone handling)
        return {
          id: p.id,
          tanggal: new Date(p.tanggalInput).toLocaleDateString('id-ID'),
          masuk: p.masuk ? new Date(p.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          keluar: p.keluar ? new Date(p.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          status: p.presensiStatus,
          keterangan: p.keterangan || '-',
        };
      });

      return {
        id: intern.id,
        name: intern.user?.name || '-',
        nim: intern.internId || '-',
        kampus: intern.university || '-',
        program: intern.program || '-',
        direktorat: intern.mentor?.direktorat || '-',
        fungsi: intern.mentor?.fungsi || '-',
        subFungsi: intern.mentor?.subFungsi || '-',
        mentor: intern.mentor?.user?.name || '-',
        bulan: monthStr,
        totalHadir,
        totalIzin,
        totalAlpha,
        presensiDetail,
      };
    });
  }

  private async ensureTodayPresensi(internIds: string[]) {
    if (!internIds || internIds.length === 0) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    for (const internId of internIds) {
      const existing = await this.prisma.presensi.findFirst({
        where: {
          internProfileId: internId,
          tanggalInput: { gte: todayStart, lte: todayEnd },
        },
      });

      if (!existing) {
        await this.prisma.presensi.create({
          data: {
            internProfileId: internId,
            tanggalInput: new Date(),
            presensiStatus: PresensiStatus.ALPHA,
            keterangan: 'Belum melakukan absensi',
          },
        });
      }
    }
  }
}

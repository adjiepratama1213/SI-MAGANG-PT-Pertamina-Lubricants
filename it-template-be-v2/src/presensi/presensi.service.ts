import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IzinDto, CheckInOutDto } from './dto/presensi.dto';
import { PresensiStatus, NotificationCategory, NotificationType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PresensiService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private async validateInternPresensiEligibility(intern: any) {
    if (!intern) {
      throw new NotFoundException('Data profil peserta tidak ditemukan');
    }

    if (intern.endDate) {
      const end = new Date(intern.endDate);
      end.setHours(23, 59, 59, 999);
      const now = new Date();
      if (now > end) {
        throw new BadRequestException(
          'Presensi tidak dapat dilakukan karena masa magang Anda telah berakhir.'
        );
      } else if (intern.user && intern.user.status === 'banned') {
        // Durasi telah diperpanjang oleh Admin: pulihkan status ke active secara otomatis
        await this.prisma.user.update({
          where: { id: intern.user.id },
          data: { status: 'active' },
        });
        intern.user.status = 'active';
      }
    }

    if (!intern.user || intern.user.status !== 'active') {
      throw new BadRequestException(
        'Presensi tidak dapat dilakukan karena status akun peserta sedang tidak aktif.'
      );
    }

    if (!intern.mentorProfileId) {
      throw new BadRequestException(
        'Presensi tidak dapat dilakukan karena Anda belum memiliki mentor pembimbing.'
      );
    }
  }

  async checkIn(userId: string, dto: CheckInOutDto, file?: Express.Multer.File) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    await this.validateInternPresensiEligibility(intern);

    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException('Hari Sabtu dan Minggu adalah hari libur, tidak ada absensi.');
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const existing = await this.prisma.presensi.findFirst({
      where: {
        internProfileId: intern.id,
        tanggalInput: { gte: todayStart, lte: todayEnd },
      },
    });

    if (existing && existing.masuk) {
      throw new BadRequestException('Already checked in today');
    }

    let status: PresensiStatus = PresensiStatus.HADIR;
    if (now.getHours() >= 8) {
      status = PresensiStatus.HADIR_TERLAMBAT;
    }

    let fileUrl = null;
    if (file) {
      fileUrl = `/uploads/presensi/${file.filename}`;
    }

    if (existing) {
      return this.prisma.presensi.update({
        where: { id: existing.id },
        data: {
          masuk: now,
          presensiStatus: status,
          lat: dto.lat,
          lng: dto.lng,
          keterangan: status === PresensiStatus.HADIR_TERLAMBAT ? (dto.keterangan || 'Hadir Terlambat') : null,
          fileBukti: fileUrl || existing.fileBukti,
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
        keterangan: status === PresensiStatus.HADIR_TERLAMBAT ? (dto.keterangan || 'Hadir Terlambat') : null,
        fileBukti: fileUrl,
      },
    });
  }

  async checkOut(userId: string, dto: CheckInOutDto) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    await this.validateInternPresensiEligibility(intern);

    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException('Hari Sabtu dan Minggu adalah hari libur.');
    }

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

    // Regulasi: ketika check out di bawah jam 4 sore (sebelum 16:00), presensi terhitung ALPHA
    let finalStatus: PresensiStatus = presensi.presensiStatus;
    let keterangan = presensi.keterangan;

    if (now.getHours() < 16) {
      finalStatus = PresensiStatus.ALPHA;
      keterangan = keterangan
        ? `${keterangan} (Pulang lebih awal sebelum jam 16:00, terhitung Alpha)`
        : 'Pulang lebih awal sebelum jam 16:00 (Alpha)';
    }

    return this.prisma.presensi.update({
      where: { id: presensi.id },
      data: {
        keluar: now,
        presensiStatus: finalStatus,
        keterangan,
        lat: dto.lat || presensi.lat,
        lng: dto.lng || presensi.lng,
      },
    });
  }

  async submitIzin(userId: string, dto: IzinDto, file?: Express.Multer.File) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        mentor: {
          include: { user: true },
        },
      },
    });
    await this.validateInternPresensiEligibility(intern);

    const start = new Date(dto.tanggalMulai);
    const end = new Date(dto.tanggalSelesai);
    const newEntries = [];

    let fileUrl = null;
    if (file) {
      fileUrl = `/uploads/presensi/${file.filename}`;
    }

    // Insert for each day in range (excluding Saturday and Sunday)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d);
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Libur akhir pekan
      
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

    // Kirim notifikasi ke mentor jika sudah memiliki mentor
    if (intern.mentor?.user?.id) {
      const internName = intern.user?.name || 'Peserta Magang';
      const jenisPengajuan = dto.tipe === PresensiStatus.SAKIT ? 'Sakit' : 'Izin';
      const tglStr = `${start.toLocaleDateString('id-ID')} s/d ${end.toLocaleDateString('id-ID')}`;
      await this.notificationService.createNotification({
        userId: intern.mentor.user.id,
        title: `Pengajuan ${jenisPengajuan} dari Peserta`,
        message: `${internName} mengajukan ${jenisPengajuan} untuk periode ${tglStr}.${dto.keterangan ? ` Alasan: ${dto.keterangan}` : ''}`,
        category: NotificationCategory.PRESENSI,
        type: NotificationType.WARNING,
        redirectUrl: '/dashboard/mentor-presensi',
        metadata: { internId: intern.id, tipe: dto.tipe }
      });
    }

    return { success: true, count: newEntries.length };
  }

  async getMyPresensi(userId: string) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    await this.syncInternsPresensi([intern.id]);

    const records = await this.prisma.presensi.findMany({
      where: { internProfileId: intern.id },
      orderBy: { tanggalInput: 'desc' },
    });

    return records.filter(p => {
      const d = new Date(p.tanggalInput).getDay();
      return d !== 0 && d !== 6;
    });
  }

  async getMentorPresensi(mentorUserId: string) {
    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { userId: mentorUserId },
      include: { internsMentored: true }
    });
    if (!mentor) throw new NotFoundException('Mentor profile not found');

    const internIds = mentor.internsMentored.map(i => i.id);
    if (internIds.length > 0) {
      await this.syncInternsPresensi(internIds);
    }

    const records = await this.prisma.presensi.findMany({
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

    return records.filter(p => {
      const d = new Date(p.tanggalInput).getDay();
      return d !== 0 && d !== 6;
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

  async getAdminMonthlyPresensi(monthStr?: string) {
    const isAll = !monthStr || monthStr === 'all' || monthStr === 'semua';
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (!isAll) {
      if (!monthStr.includes('-')) {
        throw new BadRequestException('Invalid month format. Use YYYY-MM or all');
      }
      const [year, month] = monthStr.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    }

    // Selalu sinkronkan seluruh peserta aktif agar data presensi selalu akurat dan terhubung
    await this.syncAllActiveInterns();

    const interns = await this.prisma.internProfile.findMany({
      where: {
        mentorProfileId: { not: null },
      },
      include: {
        user: { select: { name: true, status: true } },
        mentor: { 
          include: { user: { select: { name: true } } }
        },
        presensi: {
          where: startDate && endDate ? {
            tanggalInput: { gte: startDate, lte: endDate }
          } : undefined,
          orderBy: { tanggalInput: 'asc' }
        }
      }
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return interns.map(intern => {
      let totalHadir = 0;
      let totalIzin = 0;
      let totalAlpha = 0;

      const presensiDetail = intern.presensi
        .filter(p => {
          const d = new Date(p.tanggalInput).getDay();
          return d !== 0 && d !== 6; // Hanya hari kerja (Senin - Jumat)
        })
        .map(p => {
          const pDate = new Date(p.tanggalInput);
          const isToday = pDate.getTime() >= todayStart.getTime() && pDate.getTime() <= todayEnd.getTime();
          const isPastWorkHours = now.getHours() >= 17;

          let status = p.presensiStatus as string;
          if (isToday && !p.masuk && (p.presensiStatus === 'ALPHA' || !p.presensiStatus)) {
            status = isPastWorkHours ? 'ALPHA' : 'BELUM CHECK IN';
          }

          if (status === 'HADIR' || status === 'HADIR_TERLAMBAT') {
            totalHadir++;
          } else if (status === 'IZIN' || status === 'SAKIT') {
            totalIzin++;
          } else if (status === 'ALPHA') {
            // Hitung ALPHA jika bukan hari ini, atau jika hari ini tapi jam kerja telah berakhir (>= 17:00)
            if (!isToday || isPastWorkHours || p.masuk) {
              totalAlpha++;
            }
          }

          const pad = (n: number) => String(n).padStart(2, '0');
          const formattedTanggal = `${pad(pDate.getDate())}/${pad(pDate.getMonth() + 1)}/${pDate.getFullYear()}`;

          return {
            id: p.id,
            tanggal: formattedTanggal,
            masuk: p.masuk ? new Date(p.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            keluar: p.keluar ? new Date(p.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            status,
            keterangan: p.keterangan || '-',
            lat: p.lat || null,
            lng: p.lng || null,
            fileBukti: p.fileBukti || null,
          };
        });

      const isUserActive = String(intern.user?.status).toLowerCase() === 'active';
      const isExpired = intern.endDate ? new Date(intern.endDate) < now : false;
      const isActive = isUserActive && !isExpired;

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
        bulan: isAll ? 'Semua Periode' : monthStr,
        userStatus: intern.user?.status || 'active',
        startDate: intern.startDate,
        endDate: intern.endDate,
        isActive,
        totalHadir,
        totalIzin,
        totalAlpha,
        presensiDetail,
      };
    });
  }

  /**
   * Sinkronisasi presensi otomatis untuk seluruh peserta magang aktif:
   * 1. Berjalan realtime setiap hari kerja (Senin - Jumat).
   * 2. Hari Sabtu & Minggu libur (tidak ada absensi).
   * 3. Hari kerja lampau yang tidak diabsen otomatis berstatus ALPHA.
   * 4. Hari kerja yang sedang berjalan (hari ini) tidak dipaksakan ALPHA agar peserta bisa absen normal.
   * 5. Sinkron di sisi peserta, mentor, dan admin.
   */
  async syncAllActiveInterns(targetStart?: Date, targetEnd?: Date) {
    const allInterns = await this.prisma.internProfile.findMany({
      where: {
        user: { status: 'active' },
        mentorProfileId: { not: null },
      },
      select: { id: true }
    });
    if (allInterns.length > 0) {
      await this.syncInternsPresensi(allInterns.map(i => i.id), targetStart, targetEnd);
    }
  }

  async syncInternsPresensi(internIds: string[], targetStart?: Date, targetEnd?: Date) {
    if (!internIds || internIds.length === 0) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const interns = await this.prisma.internProfile.findMany({
      where: { id: { in: internIds } },
      select: { id: true, startDate: true, endDate: true, createdAt: true },
    });

    for (const intern of interns) {
      // Hapus entri dummy ALPHA hari ini HANYA jika jam kerja masih berjalan (sebelum jam 17:00) dan peserta belum masuk
      if (now.getHours() < 17) {
        await this.prisma.presensi.deleteMany({
          where: {
            internProfileId: intern.id,
            tanggalInput: { gte: todayStart, lte: todayEnd },
            masuk: null,
            presensiStatus: PresensiStatus.ALPHA,
          },
        });
      }

      // Tanggal mulai magang
      const internStart = intern.startDate ? new Date(intern.startDate) : new Date(intern.createdAt);
      internStart.setHours(0, 0, 0, 0);

      // Tanggal selesai magang: presensi tidak boleh disinkronkan melebihi intern.endDate
      // Data riwayat presensi yang telah ada sebelumnya tetap tersimpan dan tidak dihapus.
      const internEnd = intern.endDate ? new Date(intern.endDate) : new Date(2099, 11, 31);
      internEnd.setHours(23, 59, 59, 999);

      // Batas awal sinkronisasi
      const startDate = targetStart
        ? new Date(Math.max(internStart.getTime(), targetStart.getTime()))
        : new Date(internStart);
      startDate.setHours(0, 0, 0, 0);

      // Batas akhir: tidak boleh melewati todayEnd, internEnd, atau targetEnd
      let maxEndTime = Math.min(todayEnd.getTime(), internEnd.getTime());
      if (targetEnd) {
        maxEndTime = Math.min(maxEndTime, targetEnd.getTime());
      }
      const endDate = new Date(maxEndTime);
      endDate.setHours(23, 59, 59, 999);

      if (startDate > endDate) {
        continue;
      }

      // Ambil seluruh presensi yang sudah ada di rentang tanggal ini
      const existingPresensi = await this.prisma.presensi.findMany({
        where: {
          internProfileId: intern.id,
          tanggalInput: { gte: startDate, lte: endDate },
        },
      });

      // Filter presensi akhir pekan (Sabtu & Minggu) untuk dibersihkan
      const weekendIdsToDelete: string[] = [];
      const existingDatesMap = new Map<string, any>();

      for (const p of existingPresensi) {
        const pDate = new Date(p.tanggalInput);
        const dayOfWeek = pDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendIdsToDelete.push(p.id);
        } else {
          const dateKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
          existingDatesMap.set(dateKey, p);
        }
      }

      if (weekendIdsToDelete.length > 0) {
        await this.prisma.presensi.deleteMany({
          where: { id: { in: weekendIdsToDelete } },
        });
      }

      // Buat entri ALPHA otomatis untuk hari kerja (Senin - Jumat) lampau atau hari ini yang jam kerjanya telah selesai (>= 17:00) yang belum diabsen
      const newAlphaEntries = [];
      const cur = new Date(startDate);

      while (cur <= endDate) {
        const dayOfWeek = cur.getDay(); // 0: Minggu, 6: Sabtu
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const isToday = cur.getTime() >= todayStart.getTime() && cur.getTime() <= todayEnd.getTime();
          const isPastWorkHoursToday = isToday && now.getHours() >= 17;
          const dateKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;

          // Buat record ALPHA jika hari sudah lewat, ATAU jika hari ini (isToday) tapi jam kerja sudah selesai (>= 17:00)
          if (!existingDatesMap.has(dateKey) && (!isToday || isPastWorkHoursToday)) {
            newAlphaEntries.push({
              internProfileId: intern.id,
              tanggalInput: new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 17, 0, 0),
              presensiStatus: PresensiStatus.ALPHA,
              keterangan: 'Tanpa Keterangan',
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
      }

      if (newAlphaEntries.length > 0) {
        await this.prisma.presensi.createMany({
          data: newAlphaEntries,
        });
      }
    }
  }
}

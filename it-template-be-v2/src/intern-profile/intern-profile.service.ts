import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
// Trigger restart
import { InternProfile, NotificationCategory, NotificationType, Role, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternProfileDto } from './dto/create-intern-profile.dto';
import { UpdateInternProfileDto } from './dto/update-intern-profile.dto';
import { SearchInternProfileDto } from './dto/search-intern-profile.dto';
import { NotificationService } from '../notification/notification.service';
import { PresensiService } from '../presensi/presensi.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class InternProfileService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private presensiService: PresensiService,
    private mailService: MailService,
  ) {}

  async onModuleInit() {
    // Jalankan pemeriksaan berkala durasi magang peserta saat startup
    this.checkAndDeactivateExpiredInterns().catch((err) =>
      console.warn('Initial expired intern check warning:', err)
    );

    // Jalankan pemeriksaan otomatis setiap 30 menit
    setInterval(() => {
      this.checkAndDeactivateExpiredInterns().catch((err) =>
        console.warn('Periodic expired intern check warning:', err)
      );
    }, 30 * 60 * 1000);
  }

  async checkAndDeactivateExpiredInterns() {
    try {
      const now = new Date();
      // Cari seluruh peserta magang aktif yang tanggal selesai magangnya (endDate) telah lewat
      const expiredInterns = await this.prisma.internProfile.findMany({
        where: {
          endDate: {
            lt: now,
          },
          user: {
            role: 'PESERTA',
            status: 'active',
          },
        },
        include: {
          user: true,
        },
      });

      for (const intern of expiredInterns) {
        if (intern.user && intern.endDate) {
          const end = new Date(intern.endDate);
          if (end.getHours() === 0 && end.getMinutes() === 0) {
            end.setHours(23, 59, 59, 999);
          }

          if (now > end) {
            // 1. Ubah status akun user menjadi tidak aktif (banned)
            await this.prisma.user.update({
              where: { id: intern.user.id },
              data: { status: 'banned' },
            });

            // 2. Kirim email pemberitahuan ke peserta
            try {
              await this.mailService.sendInternshipExpiredEmail(intern.user.email, intern.user.name);
            } catch (mailErr) {
              console.error('Failed to send expiration email to intern:', intern.user.email, mailErr);
            }

            // 3. Simpan notifikasi di sistem
            try {
              await this.notificationService.createNotification({
                userId: intern.user.id,
                title: 'Masa Magang Telah Berakhir',
                message:
                  'Durasi magang Anda telah selesai. Status akun Anda otomatis dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com jika memerlukan informasi lebih lanjut.',
                category: NotificationCategory.SISTEM,
                type: NotificationType.WARNING,
              });
            } catch (notifErr) {
              console.error('Failed to create expiration notification:', notifErr);
            }

            console.log(`[Regulasi Magang] Peserta ${intern.user.name} (${intern.user.email}) dinonaktifkan karena durasi magang telah berakhir.`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking and deactivating expired interns:', error);
    }
  }

  async findAll(
    search: SearchInternProfileDto
  ): Promise<{ results: InternProfile[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      // Periksa otomatis durasi magang seluruh peserta
      try {
        await this.checkAndDeactivateExpiredInterns();
      } catch (checkErr) {
        console.warn('Check expired interns in findAll warning:', checkErr);
      }

      // Sinkronisasi otomatis presensi seluruh peserta magang aktif
      try {
        await this.presensiService.syncAllActiveInterns();
      } catch (syncErr) {
        console.warn('Presensi sync in findAll warning:', syncErr);
      }

      const effectiveWhere: any = {
        ...where,
      };

      if (where?.user) {
        effectiveWhere.user = where.user;
      }

      const results = await this.prisma.internProfile.findMany({
        take,
        skip,
        where: effectiveWhere,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          mentor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          evaluation: true,
          Laporan: true,
          presensi: {
            orderBy: { tanggalInput: 'desc' },
          },
        },
      });

      const count = await this.prisma.internProfile.count({ where: effectiveWhere });

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Bersihkan presensi akhir pekan dan hari ini jika belum check-in
      const cleanedResults = results.map((intern: any) => {
        if (!intern.presensi) return intern;
        const validPresensi = intern.presensi.filter((p: any) => {
          const d = new Date(p.tanggalInput).getDay();
          if (d === 0 || d === 6) return false;
          const isToday = new Date(p.tanggalInput).getTime() >= todayStart.getTime() && new Date(p.tanggalInput).getTime() <= todayEnd.getTime();
          if (isToday && !p.masuk && p.presensiStatus === 'ALPHA' && now.getHours() < 17) return false;
          return true;
        });
        return {
          ...intern,
          presensi: validPresensi,
        };
      });

      return { results: cleanedResults, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      try {
        await this.presensiService.syncInternsPresensi([id]);
      } catch (err) {
        console.warn('Sync intern presensi warning in findOne:', err);
      }

      const intern: any = await this.prisma.internProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          mentor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          evaluation: true,
          Laporan: true,
          presensi: {
            orderBy: { tanggalInput: 'desc' },
          },
        },
      });

      if (!intern) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      if (intern.presensi) {
        intern.presensi = intern.presensi.filter((p: any) => {
          const d = new Date(p.tanggalInput).getDay();
          if (d === 0 || d === 6) return false;
          const isToday = new Date(p.tanggalInput).getTime() >= todayStart.getTime() && new Date(p.tanggalInput).getTime() <= todayEnd.getTime();
          if (isToday && !p.masuk && p.presensiStatus === 'ALPHA') return false;
          return true;
        });
      }

      return intern;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findByUserId(userId: string) {
    try {
      return this.prisma.internProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          mentor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          evaluation: true,
          Laporan: true,
          presensi: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async validateMentorQuota(mentorProfileId: string | null, currentInternId?: string) {
    if (!mentorProfileId) return;

    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { id: mentorProfileId }
    });
    if (!mentor || !mentor.subFungsi || !mentor.fungsi || !mentor.direktorat) return;

    const subFungsis = await this.prisma.organization.findMany({
      where: { name: mentor.subFungsi }
    });
    
    let targetOrg = null;
    for (const sf of subFungsis) {
      if (sf.parentId) {
        const f = await this.prisma.organization.findUnique({ where: { id: sf.parentId } });
        if (f && f.name === mentor.fungsi) {
           if (f.parentId) {
             const d = await this.prisma.organization.findUnique({ where: { id: f.parentId }});
             if (d && d.name === mentor.direktorat) {
                targetOrg = sf;
                break;
             }
           }
        }
      }
    }

    if (!targetOrg) return;

    const mentorsInSubFungsi = await this.prisma.employeeProfile.findMany({
      where: {
        direktorat: mentor.direktorat,
        fungsi: mentor.fungsi,
        subFungsi: mentor.subFungsi
      }
    });

    const mentorIds = mentorsInSubFungsi.map(m => m.id);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const internsCount = await this.prisma.internProfile.count({
      where: {
        mentorProfileId: { in: mentorIds },
        ...(currentInternId ? { id: { not: currentInternId } } : {}),
        user: {
          status: 'active',
        },
        OR: [
          { endDate: null },
          { endDate: { gte: todayStart } },
        ],
      },
    });

    if (internsCount >= targetOrg.kuota) {
      throw new BadRequestException(`Kuota untuk Sub-Fungsi ${mentor.subFungsi} sudah penuh (Maks: ${targetOrg.kuota}).`);
    }
  }

  async create(createDto: CreateInternProfileDto) {
    try {
      await this.validateMentorQuota(createDto.mentorProfileId || null);

      if (createDto.userId) {
        const existing = await this.prisma.internProfile.findUnique({
          where: { userId: createDto.userId },
        });
        if (existing) {
          return await this.update(existing.id, createDto as any);
        }
      }

      const created = await this.prisma.internProfile.create({
        data: {
          userId: createDto.userId,
          internId: createDto.internId,
          university: createDto.university,
          gender: createDto.gender,
          dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined,
          major: createDto.major,
          startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
          endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
          program: createDto.program,
          documentUrls: createDto.documentUrls,
          mentorProfileId: createDto.mentorProfileId,
          bankName: createDto.bankName,
          bankAccount: createDto.bankAccount,
        },
      });

      if (createDto.userId && createDto.endDate) {
        const parsedEnd = new Date(createDto.endDate);
        if (parsedEnd.getHours() === 0 && parsedEnd.getMinutes() === 0) {
          parsedEnd.setHours(23, 59, 59, 999);
        }
        if (new Date() <= parsedEnd) {
          await this.prisma.user.update({
            where: { id: createDto.userId },
            data: { status: 'active' },
          });
        }
      }

      return created;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateInternProfileDto) {
    try {
      if (updateDto.mentorProfileId !== undefined) {
        await this.validateMentorQuota(updateDto.mentorProfileId || null, id);
      }

      const existingIntern = await this.prisma.internProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, dateOfBirth, startDate, endDate, ...rest } = updateDto;
      const updated = await this.prisma.internProfile.update({
        where: { id },
        data: {
          ...rest,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      });

      // Sinkronisasi status user jika durasi magang diperpanjang atau telah berakhir
      const targetEnd = endDate ? new Date(endDate) : existingIntern?.endDate ? new Date(existingIntern.endDate) : null;
      if (targetEnd && existingIntern?.user) {
        if (targetEnd.getHours() === 0 && targetEnd.getMinutes() === 0) {
          targetEnd.setHours(23, 59, 59, 999);
        }
        const now = new Date();
        if (now > targetEnd && existingIntern.user.status !== 'banned') {
          await this.prisma.user.update({
            where: { id: existingIntern.user.id },
            data: { status: 'banned' },
          });
          try {
            await this.mailService.sendInternshipExpiredEmail(existingIntern.user.email, existingIntern.user.name);
          } catch (e) {
            console.error('Failed to send expired email in intern update:', e);
          }
        } else if (now <= targetEnd && existingIntern.user.status !== 'active') {
          await this.prisma.user.update({
            where: { id: existingIntern.user.id },
            data: { status: 'active' },
          });
        }
      }

      // Jika ada penugasan mentor baru / pergantian mentor
      if (
        updateDto.mentorProfileId &&
        updateDto.mentorProfileId !== existingIntern?.mentorProfileId
      ) {
        const mentorProfile = await this.prisma.employeeProfile.findUnique({
          where: { id: updateDto.mentorProfileId },
          include: { user: true },
        });

        if (mentorProfile?.user) {
          // 1. Notifikasi ke Peserta
          if (existingIntern?.user?.id) {
            await this.notificationService.createNotification({
              userId: existingIntern.user.id,
              title: 'Penugasan Pembimbing Lapangan (Mentor)',
              message: `Anda telah memiliki Mentor: Bapak/Ibu ${mentorProfile.user.name} dari Fungsi ${mentorProfile.fungsi || 'Terkait'}.`,
              category: NotificationCategory.BERKAS,
              type: NotificationType.SUCCESS,
              redirectUrl: '/dashboard/peserta',
              metadata: { mentorId: mentorProfile.id },
            });
          }

          // 2. Notifikasi ke Mentor
          await this.notificationService.createNotification({
            userId: mentorProfile.user.id,
            title: 'Penugasan Peserta Bimbingan Baru',
            message: `Anda ditugaskan membimbing peserta baru: ${existingIntern?.user?.name || 'Peserta'} (${existingIntern?.university || 'Magang'}).`,
            category: NotificationCategory.BERKAS,
            type: NotificationType.INFO,
            redirectUrl: '/dashboard/mentor/peserta',
            metadata: { internId: id },
          });
        }
      }

      return updated;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.internProfile.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async requestExtension(internProfileId: string, newEndDateStr: string, reason?: string) {
    try {
      let intern = await this.prisma.internProfile.findUnique({
        where: { id: internProfileId },
        include: { user: true },
      });

      if (!intern) {
        intern = await this.prisma.internProfile.findUnique({
          where: { userId: internProfileId },
          include: { user: true },
        });
      }

      if (!intern) {
        throw new NotFoundException('Intern profile not found');
      }

      const previousEndDate = intern.endDate;
      if (!previousEndDate) {
        throw new BadRequestException('Data magang saat ini belum memiliki tanggal selesai');
      }

      const newEndDate = new Date(newEndDateStr);
      if (isNaN(newEndDate.getTime())) {
        throw new BadRequestException('Format tanggal selesai perpanjangan tidak valid');
      }

      if (newEndDate <= previousEndDate) {
        throw new BadRequestException('Tanggal perpanjangan baru harus setelah tanggal selesai magang saat ini');
      }

      // Maksimal durasi perpanjangan adalah 6 bulan dari tanggal selesai sebelumnya
      const maxExtensionDate = new Date(previousEndDate);
      maxExtensionDate.setMonth(maxExtensionDate.getMonth() + 6);

      if (newEndDate > maxExtensionDate) {
        throw new BadRequestException('Durasi perpanjangan magang maksimal 6 bulan dari periode selesai saat ini');
      }

      const request = await this.prisma.internExtensionRequest.create({
        data: {
          internProfileId: intern.id,
          previousEndDate,
          newEndDate,
          reason: reason || null,
          status: 'PENDING',
        },
      });

      // Notifikasi ke seluruh Admin (SUPERSAIYAN, PTPL_IT, etc.)
      const adminUsers = await this.prisma.user.findMany({
        where: { role: { in: [Role.SUPERSAIYAN, Role.EMPLOYEE] } },
        select: { id: true },
      });

      const internName = intern.user?.name || 'Peserta Magang';
      const formattedDate = newEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      for (const admin of adminUsers) {
        await this.notificationService.createNotification({
          userId: admin.id,
          title: 'Pengajuan Perpanjangan Magang',
          message: `${internName} mengajukan perpanjangan durasi magang hingga ${formattedDate}.${reason ? ` Alasan: ${reason}` : ''}`,
          category: NotificationCategory.SISTEM,
          type: NotificationType.WARNING,
          redirectUrl: '/dashboard/peserta?tab=perpanjangan',
          metadata: { internProfileId: intern.id, requestId: request.id },
        });
      }

      return request;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllExtensions() {
    try {
      const requests = await this.prisma.internExtensionRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          internProfile: {
            include: {
              user: true,
              mentor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      return requests.map((r) => {
        const intern = r.internProfile;
        const user = intern?.user;
        const mentorUser = intern?.mentor?.user;

        return {
          id: r.id,
          internProfileId: r.internProfileId,
          userId: user?.id,
          name: user?.name || '-',
          nim: intern?.internId || '-',
          kampus: intern?.university || '-',
          jurusan: intern?.major || '-',
          program: intern?.program || 'PKL',
          mentor: mentorUser?.name || intern?.mentor?.employeeId || '-',
          previousEndDate: r.previousEndDate,
          newEndDate: r.newEndDate,
          periodeLama: r.previousEndDate ? new Date(r.previousEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          periodeBaru: r.newEndDate ? new Date(r.newEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          alasan: r.reason || 'Tidak ada keterangan',
          status: r.status || 'PENDING',
          adminNote: r.adminNote || null,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMyExtensions(userId: string) {
    try {
      const intern = await this.prisma.internProfile.findUnique({
        where: { userId },
      });

      if (!intern) {
        return [];
      }

      return this.prisma.internExtensionRequest.findMany({
        where: { internProfileId: intern.id },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async approveExtension(requestId: string, adminNote?: string) {
    try {
      const request = await this.prisma.internExtensionRequest.findUnique({
        where: { id: requestId },
        include: {
          internProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!request) {
        throw new NotFoundException('Pengajuan perpanjangan tidak ditemukan');
      }

      // Update status pengajuan
      const updatedRequest = await this.prisma.internExtensionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminNote: adminNote || 'Disetujui oleh Administrator',
        },
      });

      // Update internProfile.endDate dan pastikan user.status = 'active'
      if (request.internProfileId) {
        await this.prisma.internProfile.update({
          where: { id: request.internProfileId },
          data: {
            endDate: request.newEndDate,
          },
        });

        if (request.internProfile?.userId) {
          await this.prisma.user.update({
            where: { id: request.internProfile.userId },
            data: {
              status: UserStatus.active,
            },
          });

          // Notifikasi ke Peserta
          const formattedDate = new Date(request.newEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          await this.notificationService.createNotification({
            userId: request.internProfile.userId,
            title: 'Perpanjangan Magang Disetujui',
            message: `Selamat! Pengajuan perpanjangan magang Anda telah disetujui hingga ${formattedDate}. Status kepesertaan Anda tetap AKTIF.`,
            category: NotificationCategory.SISTEM,
            type: NotificationType.SUCCESS,
            redirectUrl: '/dashboard/peserta-dashboard',
            metadata: { requestId, newEndDate: request.newEndDate },
          });
        }
      }

      return updatedRequest;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async rejectExtension(requestId: string, adminNote?: string) {
    try {
      const request = await this.prisma.internExtensionRequest.findUnique({
        where: { id: requestId },
        include: {
          internProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!request) {
        throw new NotFoundException('Pengajuan perpanjangan tidak ditemukan');
      }

      const updatedRequest = await this.prisma.internExtensionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNote: adminNote || 'Pengajuan perpanjangan ditolak',
        },
      });

      if (request.internProfile?.userId) {
        await this.notificationService.createNotification({
          userId: request.internProfile.userId,
          title: 'Pengajuan Perpanjangan Magang Ditolak',
          message: `Pengajuan perpanjangan magang Anda ditolak oleh Admin.${adminNote ? ` Alasan: ${adminNote}` : ''}`,
          category: NotificationCategory.SISTEM,
          type: NotificationType.WARNING,
          redirectUrl: '/dashboard/peserta-dashboard',
          metadata: { requestId },
        });
      }

      return updatedRequest;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async submitEvaluationByUser(userId: string, data: any) {
    try {
      const intern = await this.prisma.internProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!intern) {
        throw new NotFoundException('Intern profile not found');
      }

      const internProfileId = intern.id;
      const {
        integritas,
        ketepatanWaktu,
        keahlian,
        kerjasama,
        komunikasi,
        penggunaanTI,
        pengembanganDiri,
        catatan,
      } = data;

      const nilaiRataRata =
        (integritas + ketepatanWaktu + keahlian + kerjasama + komunikasi + penggunaanTI + pengembanganDiri) / 7;

      let kategori = '-';
      if (nilaiRataRata >= 90) kategori = 'Sangat Baik';
      else if (nilaiRataRata >= 76) kategori = 'Baik';
      else if (nilaiRataRata >= 60) kategori = 'Cukup';
      else if (nilaiRataRata >= 50) kategori = 'Kurang';
      else kategori = 'Sangat Kurang';

      const evaluation = await this.prisma.internEvaluation.upsert({
        where: { internProfileId },
        update: {
          integritas,
          ketepatanWaktu,
          keahlian,
          kerjasama,
          komunikasi,
          penggunaanTI,
          pengembanganDiri,
          catatan,
          nilaiRataRata,
          kategori,
        },
        create: {
          internProfileId,
          integritas,
          ketepatanWaktu,
          keahlian,
          kerjasama,
          komunikasi,
          penggunaanTI,
          pengembanganDiri,
          catatan,
          nilaiRataRata,
          kategori,
        },
      });

      // Notifikasi ke peserta
      if (intern.user?.id) {
        await this.notificationService.createNotification({
          userId: intern.user.id,
          title: 'Evaluasi Akhir Telah Diterbitkan',
          message: `Evaluasi akhir magang Anda telah selesai dengan predikat: ${kategori} (Nilai Rata-rata: ${nilaiRataRata.toFixed(1)}).`,
          category: NotificationCategory.EVALUASI,
          type: NotificationType.SUCCESS,
          redirectUrl: '/dashboard/peserta-penilaian',
          metadata: { internProfileId },
        });
      }

      return evaluation;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async uploadCertificate(internProfileId: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      const fileUrl = `/uploads/certificates/${file.filename}`;

      const evalResult = await this.prisma.internEvaluation.upsert({
        where: { internProfileId },
        update: { certificateUrl: fileUrl },
        create: {
          internProfileId,
          integritas: 0,
          ketepatanWaktu: 0,
          keahlian: 0,
          kerjasama: 0,
          komunikasi: 0,
          penggunaanTI: 0,
          pengembanganDiri: 0,
          nilaiRataRata: 0,
          kategori: '-',
          certificateUrl: fileUrl,
        },
      });

      // Notifikasi ke peserta
      const intern = await this.prisma.internProfile.findUnique({
        where: { id: internProfileId },
        include: { user: true },
      });

      if (intern?.user?.id) {
        await this.notificationService.createNotification({
          userId: intern.user.id,
          title: 'Sertifikat Resmi Magang Diterbitkan',
          message: 'Selamat! Sertifikat resmi magang PT Pertamina Lubricants Anda telah diterbitkan dan siap diunduh.',
          category: NotificationCategory.EVALUASI,
          type: NotificationType.SUCCESS,
          redirectUrl: '/dashboard/peserta-penilaian',
          metadata: { internProfileId, certificateUrl: fileUrl },
        });
      }

      return evalResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

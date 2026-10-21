import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationCategory, NotificationType } from '@prisma/client';

@Injectable()
export class LaporanService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createLaporan(userId: string, data: { keterangan?: string; fileUrls: string[] }) {
    let intern = await this.prisma.internProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        mentor: {
          include: { user: true }
        }
      }
    });
    if (!intern) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      intern = await this.prisma.internProfile.create({
        data: { userId },
        include: {
          user: true,
          mentor: {
            include: { user: true }
          }
        }
      });
    }

    const createdLaporan = await this.prisma.laporan.create({
      data: {
        internId: intern.id,
        keterangan: data.keterangan || '',
        files: data.fileUrls,
        statusFeedback: 'Menunggu Evaluasi'
      }
    });

    // Kirim notifikasi ke Mentor jika peserta sudah memiliki mentor
    if (intern.mentor?.user?.id) {
      const internName = intern.user?.name || 'Peserta Magang';
      await this.notificationService.createNotification({
        userId: intern.mentor.user.id,
        title: 'Laporan Baru dari Peserta',
        message: `${internName} telah mengunggah Laporan Mingguan. Menunggu evaluasi & catatan dari Anda.`,
        category: NotificationCategory.LAPORAN,
        type: NotificationType.INFO,
        redirectUrl: '/dashboard/mentor-laporan',
        metadata: { laporanId: createdLaporan.id, internId: intern.id }
      });
    }

    return createdLaporan;
  }

  async getLaporanByUserId(userId: string) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId }
    });
    if (!intern) return [];

    return this.prisma.laporan.findMany({
      where: { internId: intern.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllLaporan() {
    return this.prisma.laporan.findMany({
      include: {
        intern: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateFeedback(id: string, data: { statusFeedback: string; komentar?: string }) {
    const updated = await this.prisma.laporan.update({
      where: { id },
      data: {
        statusFeedback: data.statusFeedback,
        komentar: data.komentar
      },
      include: {
        intern: {
          include: { user: true }
        }
      }
    });

    // Kirim notifikasi ke Peserta Magang bahwa laporannya sudah dinilai/diberi feedback
    if (updated.intern?.user?.id) {
      const notePreview = data.komentar ? `: "${data.komentar.slice(0, 80)}"` : '';
      await this.notificationService.createNotification({
        userId: updated.intern.user.id,
        title: 'Feedback Laporan dari Mentor',
        message: `Status laporan Anda: ${data.statusFeedback}${notePreview}. Silakan cek catatan mentor.`,
        category: NotificationCategory.LAPORAN,
        type: NotificationType.SUCCESS,
        redirectUrl: '/dashboard/peserta-laporan',
        metadata: { laporanId: id, status: data.statusFeedback }
      });
    }

    return updated;
  }

  async deleteLaporan(id: string, userId: string) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId }
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    const laporan = await this.prisma.laporan.findFirst({
      where: { id, internId: intern.id }
    });

    if (!laporan) throw new NotFoundException('Laporan not found or not owned by you');

    if (laporan.statusFeedback !== 'Menunggu Evaluasi' && laporan.statusFeedback !== 'Belum Dinilai' && laporan.statusFeedback !== 'Menunggu Ditinjau') {
      throw new Error('Laporan cannot be deleted because it has already been evaluated');
    }

    return this.prisma.laporan.delete({
      where: { id }
    });
  }
}

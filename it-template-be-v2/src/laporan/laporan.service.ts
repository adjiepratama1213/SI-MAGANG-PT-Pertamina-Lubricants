import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async createLaporan(userId: string, data: { keterangan?: string; fileUrls: string[] }) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { userId }
    });
    if (!intern) throw new NotFoundException('Intern profile not found');

    return this.prisma.laporan.create({
      data: {
        internId: intern.id,
        keterangan: data.keterangan || '',
        files: data.fileUrls,
        statusFeedback: 'Menunggu Evaluasi'
      }
    });
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
    return this.prisma.laporan.update({
      where: { id },
      data: {
        statusFeedback: data.statusFeedback,
        komentar: data.komentar
      }
    });
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

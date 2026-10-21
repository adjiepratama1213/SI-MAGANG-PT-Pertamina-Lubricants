import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  NotificationCategory, 
  NotificationType, 
  ReminderTarget, 
  Role 
} from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateMentorReminderDto } from './dto/create-mentor-reminder.dto';
import { UpdateMentorReminderDto } from './dto/update-mentor-reminder.dto';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './dto/create-feedback.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // NOTIFICATIONS QUERY & ACTIONS
  // ----------------------------------------------------

  async getUserNotifications(userId: string, category?: NotificationCategory, unreadOnly?: boolean) {
    const where: any = { userId };

    if (category) {
      where.category = category;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createNotification(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        category: dto.category || NotificationCategory.SISTEM,
        type: dto.type || NotificationType.INFO,
        redirectUrl: dto.redirectUrl,
        metadata: dto.metadata || {},
      },
    });
  }

  // ----------------------------------------------------
  // ADMIN REMINDER / BROADCAST FEATURE
  // ----------------------------------------------------

  async createReminder(createdById: string, dto: CreateReminderDto) {
    // 1. Simpan record AdminReminder
    const reminder = await this.prisma.adminReminder.create({
      data: {
        title: dto.title,
        content: dto.content,
        target: dto.target || ReminderTarget.ALL,
        urgency: dto.urgency || NotificationType.INFO,
        fileUrl: dto.fileUrl || null,
        fileName: dto.fileName || null,
        createdById,
      },
    });

    // 2. Cari target users berdasarkan target role
    let userFilter: any = { status: 'active' };
    if (dto.target === ReminderTarget.PESERTA) {
      userFilter = { role: Role.PESERTA, status: 'active' };
    } else if (dto.target === ReminderTarget.MENTOR) {
      userFilter = { role: Role.EMPLOYEESTAFF, status: 'active' };
    } else if (dto.target === ReminderTarget.VP) {
      userFilter = { role: Role.EMPLOYEE, status: 'active' };
    } else {
      // ALL: seluruh pengguna aktif
      userFilter = { status: 'active' };
    }

    const targetUsers = await this.prisma.user.findMany({
      where: userFilter,
      select: { id: true, role: true },
    });

    // 3. Dispatch notifikasi ke seluruh target user
    if (targetUsers.length > 0) {
      const notificationData = targetUsers.map((u) => {
        let redirect = '/dashboard';
        if (u.role === Role.PESERTA) redirect = '/dashboard/peserta-dashboard';
        else if (u.role === Role.EMPLOYEESTAFF) redirect = '/dashboard/mentor-dashboard';
        else if (u.role === Role.EMPLOYEE) redirect = '/dashboard/vp-approval';
        else if (u.role === Role.SUPERSAIYAN) redirect = '/dashboard/reminder';

        return {
          userId: u.id,
          title: dto.title,
          message: dto.content,
          category: NotificationCategory.REMINDER_ADMIN,
          type: dto.urgency || NotificationType.INFO,
          redirectUrl: redirect,
          metadata: {
            reminderId: reminder.id,
            target: dto.target,
            fileUrl: reminder.fileUrl,
            fileName: reminder.fileName,
          },
        };
      });

      await this.prisma.notification.createMany({
        data: notificationData,
      });
    }

    return {
      message: `Reminder berhasil dikirim ke ${targetUsers.length} pengguna`,
      reminder,
    };
  }

  async getReminders() {
    return this.prisma.adminReminder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteReminder(reminderId: string) {
    const reminder = await this.prisma.adminReminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder / Pengumuman tidak ditemukan');
    }

    // 1. Hapus notifikasi di lonceng yang berasal dari reminder ini
    try {
      await this.prisma.notification.deleteMany({
        where: {
          category: NotificationCategory.REMINDER_ADMIN,
          metadata: {
            path: ['reminderId'],
            equals: reminderId,
          },
        },
      });
    } catch {
      // Fallback
      const allAdminNotifs = await this.prisma.notification.findMany({
        where: { category: NotificationCategory.REMINDER_ADMIN },
      });
      const idsToDelete = allAdminNotifs
        .filter((n: any) => n.metadata && n.metadata.reminderId === reminderId)
        .map((n) => n.id);
      if (idsToDelete.length > 0) {
        await this.prisma.notification.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    }

    // 2. Hapus adminReminder itu sendiri
    await this.prisma.adminReminder.delete({
      where: { id: reminderId },
    });

    return { message: 'Pengumuman dan notifikasi terkait berhasil dihapus' };
  }

  // ----------------------------------------------------
  // MENTOR REMINDER & TUGAS FEATURE
  // ----------------------------------------------------

  async getMentorMentees(mentorUserId: string) {
    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { userId: mentorUserId },
      include: {
        internsMentored: {
          where: {
            user: { status: 'active' },
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, photoUrl: true }
            }
          }
        }
      }
    });

    if (!mentor) return [];

    return mentor.internsMentored.map((i) => ({
      id: i.id,
      userId: i.user.id,
      name: i.user.name,
      email: i.user.email,
      nim: i.internId || '-',
      university: i.university || '-',
      program: i.program || '-',
    }));
  }

  async getMentorReminders(mentorUserId: string) {
    return this.prisma.mentorReminder.findMany({
      where: { createdById: mentorUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMentorReminder(
    mentorUserId: string,
    dto: CreateMentorReminderDto,
    files?: Array<Express.Multer.File>,
  ) {
    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { userId: mentorUserId },
      include: {
        user: true,
        internsMentored: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Profil mentor tidak ditemukan');
    }

    const allMentees = mentor.internsMentored;
    if (allMentees.length === 0) {
      throw new BadRequestException('Anda belum memiliki peserta bimbingan yang terdaftar');
    }

    let targetInterns = [];
    if (dto.targetType === 'semua') {
      targetInterns = allMentees;
    } else {
      // Spesifik: pastikan HANYA peserta yang dibimbing mentor ini
      let selectedIds: any = dto.targetPesertaIds || [];
      if (typeof selectedIds === 'string') {
        try {
          selectedIds = JSON.parse(selectedIds);
        } catch {
          selectedIds = [selectedIds];
        }
      }
      targetInterns = allMentees.filter(
        (m) =>
          selectedIds.includes(m.id) ||
          selectedIds.includes(m.userId) ||
          selectedIds.includes(m.user?.name)
      );
    }

    if (targetInterns.length === 0) {
      throw new BadRequestException('Pilih minimal satu peserta bimbingan yang valid');
    }

    const targetNames = targetInterns.map((i) => i.user.name);
    const targetPesertaIds = targetInterns.map((i) => i.user.id);

    const fileUrls = files ? files.map((f) => `/uploads/reminders/${f.filename}`) : [];
    const fileNames = files ? files.map((f) => f.originalname) : [];

    // Format jadwal ke Bahasa Indonesia jika tersedia
    const formatIndoDate = (d: Date) => {
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    let scheduleText = '';
    if (dto.openedAt) {
      scheduleText += `\nDibuka: ${formatIndoDate(new Date(dto.openedAt))}`;
    }
    if (dto.dueAt) {
      scheduleText += `\nBatas Waktu: ${formatIndoDate(new Date(dto.dueAt))}`;
    }

    const messageWithSchedule = scheduleText ? `${dto.content}\n${scheduleText}` : dto.content;

    // 1. Simpan record MentorReminder ke database
    const reminder = await this.prisma.mentorReminder.create({
      data: {
        title: dto.title,
        content: dto.content,
        tipe: dto.tipe || 'informasi',
        targetType: dto.targetType,
        targetPesertaIds,
        targetNames,
        jadwal: dto.dueAt ? new Date(dto.dueAt) : (dto.openedAt ? new Date(dto.openedAt) : (dto.jadwal ? new Date(dto.jadwal) : null)),
        openedAt: dto.openedAt ? new Date(dto.openedAt) : null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        fileUrls,
        fileNames,
        status: 'Terkirim',
        createdById: mentorUserId,
      },
    });

    // 2. Dispatch notifikasi ke seluruh target peserta bimbingan
    const notifications = targetInterns.map((intern) => ({
      userId: intern.user.id,
      title: dto.title,
      message: messageWithSchedule,
      category: NotificationCategory.REMINDER_MENTOR,
      type: NotificationType.INFO,
      redirectUrl: '/dashboard/peserta-dashboard',
      metadata: {
        mentorReminderId: reminder.id,
        mentorName: mentor.user?.name,
        openedAt: dto.openedAt || null,
        dueAt: dto.dueAt || null,
        fileUrls,
        fileNames,
      },
    }));

    await this.prisma.notification.createMany({
      data: notifications,
    });

    return {
      message: `Reminder berhasil dikirim ke ${targetInterns.length} peserta bimbingan`,
      reminder,
    };
  }

  async updateMentorReminder(
    mentorUserId: string,
    reminderId: string,
    dto: UpdateMentorReminderDto,
    files?: Array<Express.Multer.File>,
  ) {
    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { userId: mentorUserId },
      include: {
        user: true,
        internsMentored: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!mentor) {
      throw new ForbiddenException('Hanya mentor terdaftar yang dapat mengubah reminder');
    }

    const reminder = await this.prisma.mentorReminder.findFirst({
      where: { id: reminderId, createdById: mentorUserId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder tidak ditemukan');
    }

    const allMentees = mentor.internsMentored || [];
    const targetType = dto.targetType || reminder.targetType;
    let targetInterns = [];

    if (targetType === 'semua') {
      targetInterns = allMentees;
    } else {
      let selectedIds: any = dto.targetPesertaIds !== undefined ? dto.targetPesertaIds : reminder.targetPesertaIds;
      if (typeof selectedIds === 'string') {
        try {
          selectedIds = JSON.parse(selectedIds);
        } catch {
          selectedIds = [selectedIds];
        }
      }
      targetInterns = allMentees.filter(
        (m) =>
          selectedIds.includes(m.id) ||
          selectedIds.includes(m.userId) ||
          selectedIds.includes(m.user?.name)
      );
    }

    if (targetInterns.length === 0) {
      throw new BadRequestException('Pilih minimal satu peserta bimbingan yang valid');
    }

    const targetNames = targetInterns.map((i) => i.user.name);
    const targetPesertaIds = targetInterns.map((i) => i.user.id);

    // Hitung fileUrls & fileNames
    let finalFileUrls: string[] = [];
    let finalFileNames: string[] = [];

    if (dto.existingFileUrls !== undefined) {
      finalFileUrls = Array.isArray(dto.existingFileUrls) ? [...dto.existingFileUrls] : [dto.existingFileUrls];
    } else {
      finalFileUrls = [...reminder.fileUrls];
    }

    if (dto.existingFileNames !== undefined) {
      finalFileNames = Array.isArray(dto.existingFileNames) ? [...dto.existingFileNames] : [dto.existingFileNames];
    } else {
      finalFileNames = [...reminder.fileNames];
    }

    if (files && files.length > 0) {
      const newUrls = files.map((f) => `/uploads/reminders/${f.filename}`);
      const newNames = files.map((f) => f.originalname);
      finalFileUrls.push(...newUrls);
      finalFileNames.push(...newNames);
    }

    const title = dto.title !== undefined ? dto.title.trim() : reminder.title;
    const content = dto.content !== undefined ? dto.content.trim() : reminder.content;
    const openedAt = dto.openedAt !== undefined ? (dto.openedAt ? new Date(dto.openedAt) : null) : reminder.openedAt;
    const dueAt = dto.dueAt !== undefined ? (dto.dueAt ? new Date(dto.dueAt) : null) : reminder.dueAt;

    const formatIndoDate = (d: Date) => {
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    let scheduleText = '';
    if (openedAt) {
      scheduleText += `\nDibuka: ${formatIndoDate(new Date(openedAt))}`;
    }
    if (dueAt) {
      scheduleText += `\nBatas Waktu: ${formatIndoDate(new Date(dueAt))}`;
    }

    const messageWithSchedule = scheduleText ? `${content}\n${scheduleText}` : content;

    const updatedReminder = await this.prisma.mentorReminder.update({
      where: { id: reminderId },
      data: {
        title,
        content,
        targetType,
        targetPesertaIds,
        targetNames,
        jadwal: dueAt || openedAt || null,
        openedAt,
        dueAt,
        fileUrls: finalFileUrls,
        fileNames: finalFileNames,
      },
    });

    // Sinkronisasi notifikasi ke peserta
    try {
      const allMentorNotifs = await this.prisma.notification.findMany({
        where: { category: NotificationCategory.REMINDER_MENTOR },
      });
      const idsToDelete = allMentorNotifs
        .filter((n: any) => n.metadata && (n.metadata as any).mentorReminderId === reminderId)
        .map((n) => n.id);
      if (idsToDelete.length > 0) {
        await this.prisma.notification.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      const notifications = targetInterns.map((intern) => ({
        userId: intern.user.id,
        title: title,
        message: messageWithSchedule,
        category: NotificationCategory.REMINDER_MENTOR,
        type: NotificationType.INFO,
        redirectUrl: '/dashboard/peserta-dashboard',
        metadata: {
          mentorReminderId: updatedReminder.id,
          mentorName: mentor.user?.name,
          openedAt: openedAt ? openedAt.toISOString() : null,
          dueAt: dueAt ? dueAt.toISOString() : null,
          fileUrls: finalFileUrls,
          fileNames: finalFileNames,
        },
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });
    } catch (notifErr) {
      console.error('Failed to sync notifications on reminder update:', notifErr);
    }

    return {
      message: 'Reminder berhasil diperbarui',
      reminder: updatedReminder,
    };
  }

  async deleteMentorReminder(mentorUserId: string, reminderId: string) {
    const reminder = await this.prisma.mentorReminder.findFirst({
      where: { id: reminderId, createdById: mentorUserId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder tidak ditemukan');
    }

    // Bersihkan notifikasi terkait jika ada
    try {
      const allMentorNotifs = await this.prisma.notification.findMany({
        where: { category: NotificationCategory.REMINDER_MENTOR },
      });
      const idsToDelete = allMentorNotifs
        .filter((n: any) => n.metadata && n.metadata.mentorReminderId === reminderId)
        .map((n) => n.id);
      if (idsToDelete.length > 0) {
        await this.prisma.notification.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    } catch {
      // Ignored
    }

    await this.prisma.mentorReminder.delete({
      where: { id: reminderId },
    });

    return { message: 'Reminder mentor berhasil dihapus' };
  }

  // ----------------------------------------------------
  // INTERN FEEDBACK FEATURE
  // ----------------------------------------------------

  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { internProfile: true },
    });

    if (!user || !user.internProfile) {
      throw new BadRequestException('Hanya peserta magang yang dapat mengirimkan feedback');
    }

    // 1. Simpan InternFeedback
    const feedback = await this.prisma.internFeedback.create({
      data: {
        internId: user.internProfile.id,
        category: dto.category,
        rating: dto.rating ?? 5,
        message: dto.message,
        isAnonymous: dto.isAnonymous ?? false,
      },
    });

    // 2. Beri notifikasi ke seluruh akun ADMIN (SUPERSAIYAN)
    const adminUsers = await this.prisma.user.findMany({
      where: { role: Role.SUPERSAIYAN },
      select: { id: true },
    });

    if (adminUsers.length > 0) {
      const pengirim = dto.isAnonymous ? 'Seorang peserta (Anonim)' : user.name;
      const previewPesan = dto.message.length > 70 ? `${dto.message.slice(0, 70)}...` : dto.message;

      const adminNotifications = adminUsers.map((admin) => ({
        userId: admin.id,
        title: `Umpan Balik Baru (${dto.category})`,
        message: `${pengirim} telah mengirimkan feedback baru: "${previewPesan}"`,
        category: NotificationCategory.FEEDBACK_PESERTA,
        type: NotificationType.INFO,
        redirectUrl: '/dashboard/feedback',
        metadata: { feedbackId: feedback.id, internId: user.internProfile.id },
      }));

      await this.prisma.notification.createMany({
        data: adminNotifications,
      });
    }

    return {
      message: 'Feedback berhasil dikirim. Terima kasih atas masukan Anda!',
      feedback,
    };
  }

  async getAllFeedbacks() {
    return this.prisma.internFeedback.findMany({
      where: {
        intern: {
          user: {
            status: 'active',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        intern: {
          include: {
            user: {
              select: { id: true, name: true, email: true, photoUrl: true, status: true },
            },
          },
        },
      },
    });
  }

  async getMyFeedbacks(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { internProfile: true },
    });

    if (!user || !user.internProfile) {
      return [];
    }

    return this.prisma.internFeedback.findMany({
      where: { internId: user.internProfile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFeedbackStatus(feedbackId: string, dto: UpdateFeedbackStatusDto) {
    const feedback = await this.prisma.internFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        intern: {
          include: { user: true },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    const updated = await this.prisma.internFeedback.update({
      where: { id: feedbackId },
      data: {
        status: dto.status,
        response: dto.response,
      },
    });

    // Beri notifikasi ke peserta jika feedback ditanggapi dan bukan anonim
    if (feedback.intern?.user?.id && !feedback.isAnonymous && dto.response) {
      await this.prisma.notification.create({
        data: {
          userId: feedback.intern.user.id,
          title: 'Feedback Anda Telah Ditanggapi Admin',
          message: `Admin telah menanggapi feedback (${feedback.category}) Anda: "${dto.response.slice(0, 100)}"`,
          category: NotificationCategory.FEEDBACK_PESERTA,
          type: NotificationType.SUCCESS,
          redirectUrl: '/dashboard/peserta/feedback',
        },
      });
    }

    return updated;
  }
}

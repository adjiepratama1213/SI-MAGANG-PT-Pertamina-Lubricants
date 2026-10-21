import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { uploadLocalFileToGcs } from 'src/common/utils/gcs.utils';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { CreateMentorReminderDto } from './dto/create-mentor-reminder.dto';
import { UpdateMentorReminderDto } from './dto/update-mentor-reminder.dto';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './dto/create-feedback.dto';
import { NotificationCategory } from '@prisma/client';

@ApiTags('Notification')
@Controller('notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ----------------------------------------------------
  // USER NOTIFICATIONS
  // ----------------------------------------------------

  @Get()
  async getMyNotifications(
    @Req() req: any,
    @Query('category') category?: NotificationCategory,
    @Query('unreadOnly') unreadOnly?: string
  ) {
    const userId = req.user.id;
    return this.notificationService.getUserNotifications(
      userId,
      category,
      unreadOnly === 'true'
    );
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    await this.notificationService.markAllAsRead(userId);
    return { message: 'Semua notifikasi telah ditandai sudah dibaca' };
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.notificationService.markAsRead(userId, id);
  }

  @Delete(':id')
  async deleteNotification(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.notificationService.deleteNotification(userId, id);
    return { message: 'Notifikasi berhasil dihapus' };
  }

  @Post('manual')
  async createManualNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.createNotification(dto);
  }

  // ----------------------------------------------------
  // ADMIN REMINDER / BROADCAST
  // ----------------------------------------------------

  @Post('reminder')
  async createReminder(@Req() req: any, @Body() dto: CreateReminderDto) {
    const userId = req.user.id;
    return this.notificationService.createReminder(userId, dto);
  }

  @Get('reminder')
  async getReminders() {
    return this.notificationService.getReminders();
  }

  @Delete('reminder/:id')
  async deleteReminder(@Param('id') id: string) {
    return this.notificationService.deleteReminder(id);
  }

  // ----------------------------------------------------
  // MENTOR REMINDER & TUGAS
  // ----------------------------------------------------

  @Get('mentor/mentees')
  async getMentorMentees(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getMentorMentees(userId);
  }

  @Get('mentor-reminder')
  async getMentorReminders(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getMentorReminders(userId);
  }

  @Post('mentor-reminder')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/reminders';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now();
          const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          cb(null, `${uniqueSuffix}-${cleanName}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
      },
    }),
  )
  async createMentorReminder(
    @Req() req: any,
    @Body() dto: CreateMentorReminderDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      for (const f of files) {
        uploadLocalFileToGcs(f.path, `uploads/reminders/${f.filename}`, f.mimetype)
          .then(() => console.log(`[GCP Storage] Lampiran reminder tersimpan di GCP: uploads/reminders/${f.filename}`))
          .catch(err => console.error(`[GCP Storage Error] Lampiran reminder gagal ke GCP:`, err));
      }
    }
    const userId = req.user.id;
    return this.notificationService.createMentorReminder(userId, dto, files);
  }

  @Patch('mentor-reminder/:id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/reminders';
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now();
          const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          cb(null, `${uniqueSuffix}-${cleanName}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
      },
    }),
  )
  async updateMentorReminder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMentorReminderDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      for (const f of files) {
        uploadLocalFileToGcs(f.path, `uploads/reminders/${f.filename}`, f.mimetype)
          .then(() => console.log(`[GCP Storage] Lampiran reminder update tersimpan di GCP: uploads/reminders/${f.filename}`))
          .catch(err => console.error(`[GCP Storage Error] Lampiran reminder update gagal ke GCP:`, err));
      }
    }
    const userId = req.user.id;
    return this.notificationService.updateMentorReminder(userId, id, dto, files);
  }

  @Delete('mentor-reminder/:id')
  async deleteMentorReminder(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.notificationService.deleteMentorReminder(userId, id);
  }

  // ----------------------------------------------------
  // INTERN FEEDBACK
  // ----------------------------------------------------

  @Post('feedback')
  async submitFeedback(@Req() req: any, @Body() dto: CreateFeedbackDto) {
    const userId = req.user.id;
    return this.notificationService.createFeedback(userId, dto);
  }

  @Get('feedback/my')
  async getMyFeedbacks(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationService.getMyFeedbacks(userId);
  }

  @Get('feedback')
  async getAllFeedbacks() {
    return this.notificationService.getAllFeedbacks();
  }

  @Patch('feedback/:id/status')
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackStatusDto
  ) {
    return this.notificationService.updateFeedbackStatus(id, dto);
  }
}

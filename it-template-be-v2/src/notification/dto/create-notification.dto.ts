import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { NotificationCategory, NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  metadata?: any;
}

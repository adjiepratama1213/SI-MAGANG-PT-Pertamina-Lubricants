import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ReminderTarget, NotificationType } from '@prisma/client';

export class CreateReminderDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ReminderTarget)
  target?: ReminderTarget;

  @IsOptional()
  @IsEnum(NotificationType)
  urgency?: NotificationType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

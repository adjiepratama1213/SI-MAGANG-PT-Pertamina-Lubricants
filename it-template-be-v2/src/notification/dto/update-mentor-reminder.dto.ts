import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateMentorReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  tipe?: string;

  @IsOptional()
  @IsString()
  targetType?: 'semua' | 'spesifik';

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : [];
      }
    }
    return value;
  })
  targetPesertaIds?: string[];

  @IsOptional()
  @IsString()
  jadwal?: string;

  @IsOptional()
  @IsString()
  openedAt?: string;

  @IsOptional()
  @IsString()
  dueAt?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : [];
      }
    }
    return value;
  })
  existingFileUrls?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : [];
      }
    }
    return value;
  })
  existingFileNames?: string[];
}

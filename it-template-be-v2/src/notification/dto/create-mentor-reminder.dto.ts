import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMentorReminderDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  tipe?: string;

  @IsNotEmpty()
  @IsString()
  targetType: 'semua' | 'spesifik';

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
}

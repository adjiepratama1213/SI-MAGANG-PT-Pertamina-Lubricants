import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PresensiStatus } from '@prisma/client';

export class IzinDto {
  @IsEnum(PresensiStatus)
  tipe: PresensiStatus;

  @IsDateString()
  tanggalMulai: string;

  @IsDateString()
  tanggalSelesai: string;

  @IsString()
  @IsOptional()
  keterangan?: string;
}

export class CheckInOutDto {
  @IsString()
  @IsOptional()
  lat?: string;

  @IsString()
  @IsOptional()
  lng?: string;

  @IsString()
  @IsOptional()
  keterangan?: string;
}

export class UpdateStatusDto {
  @IsEnum(PresensiStatus)
  status: PresensiStatus;
}

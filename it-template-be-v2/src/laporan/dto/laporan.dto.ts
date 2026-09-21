import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateLaporanDto {
  @IsString()
  @IsOptional()
  keterangan?: string;

  @IsArray()
  @IsOptional()
  fileUrls?: string[];
}

export class FeedbackLaporanDto {
  @IsString()
  statusFeedback: string;

  @IsString()
  @IsOptional()
  komentar?: string;
}

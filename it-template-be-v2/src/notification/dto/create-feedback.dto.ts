import { IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsString()
  category: string; // Fasilitas, Mentor, Sistem, Umum

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class UpdateFeedbackStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string; // Baru, Ditinjau, Ditindaklanjuti

  @IsOptional()
  @IsString()
  response?: string;
}

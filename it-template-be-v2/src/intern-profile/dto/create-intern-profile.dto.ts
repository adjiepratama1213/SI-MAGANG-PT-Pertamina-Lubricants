import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsOptional, IsString, IsDateString, IsArray, IsEnum } from 'class-validator';
import { IsMaxDurationMonths } from '../validators/max-duration.validator';

export class CreateInternProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  internId: string;

  @ApiProperty()
  @IsString()
  university: string;

  @ApiProperty({ enum: ['PRIA', 'WANITA'] })
  @IsOptional()
  @IsEnum($Enums.Gender)
  gender: $Enums.Gender;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty()
  @IsString()
  major: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsMaxDurationMonths('startDate', 6)
  endDate: string;

  @ApiProperty()
  @IsString()
  program: string;

  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  mentorProfileId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateEmployeeProfileDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jabatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direktorat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fungsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subFungsi?: string;

  @ApiProperty({ enum: ['PRIA', 'WANITA'], required: false })
  @IsOptional()
  @IsEnum($Enums.Gender)
  gender?: $Enums.Gender;
}

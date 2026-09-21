import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTeamDto implements Organization {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  id: string;

  createdAt: Date;
  updatedAt: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @ApiPropertyOptional()
  @IsString()
  parentId: string;

  @ApiPropertyOptional()
  @IsString()
  directors: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isPublished: boolean;

  @ApiPropertyOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsNumber()
  kuota: number;
}

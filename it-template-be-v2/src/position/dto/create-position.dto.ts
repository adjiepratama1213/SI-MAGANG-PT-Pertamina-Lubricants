import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class CreatePositionDto implements Prisma.PositionUncheckedCreateInput {
  @ApiProperty()
  @Type(() => String)
  id: string;

  createdAt: Date;
  updatedAt: Date;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiPropertyOptional()
  @IsString()
  teamId: string;

  @ApiPropertyOptional()
  @IsString()
  organizationParentId: string;

  @IsBoolean()
  isChief: boolean;

  @IsBoolean()
  isHead: boolean;

  @IsBoolean()
  isOwner: boolean;

  @IsBoolean()
  isPublished: boolean;

  @IsBoolean()
  isSync: boolean;
}

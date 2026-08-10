import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGcpItemDto {
  // export class CreateGcpItemDto implements Prisma.GcpItemUncheckedCreateInput {
  @ApiProperty()
  @Type(() => String)
  id: string;

  createdAt: Date;
  updatedAt: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  // @ApiProperty()
  // @IsArray()
  // tags: Prisma.TagUncheckedCreateNestedManyWithoutGcpItemInput;
  @ApiProperty()
  @IsArray()
  tagIds: string[];

  @ApiPropertyOptional()
  @IsString()
  publish: string;

  @ApiPropertyOptional()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  coverUrl: string;

  @ApiPropertyOptional()
  @IsString()
  metaTitle: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalViews?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalShares?: number;

  @ApiPropertyOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalComments?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalFavorites?: number;

  @ApiProperty()
  @IsArray()
  metaKeywords: string[];

  @ApiPropertyOptional()
  @IsString()
  metaDescription: string;

  @IsString()
  @IsOptional()
  authorId: string;

  @IsString()
  @IsOptional()
  teamId: string;

  @IsBoolean()
  @IsOptional()
  isFeatured: boolean;

  @IsBoolean()
  @IsOptional()
  isMicrosite: boolean;

  @IsString()
  @IsOptional()
  favoritePersonId?: string;
}

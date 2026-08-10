import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: 'Row per-page' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export class DashboardFilterDto {
  @ApiPropertyOptional({ description: 'Year' })
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  year: number = new Date().getFullYear();

  @ApiPropertyOptional({ description: 'Start Month' })
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  startMonth: number = 1;

  @ApiPropertyOptional({ description: 'End Month' })
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(12)
  endMonth: number = 12;
}

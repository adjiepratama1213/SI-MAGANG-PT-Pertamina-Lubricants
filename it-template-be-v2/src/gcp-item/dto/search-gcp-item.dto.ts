import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchGcpItemDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  datasetId?: any;

  @ApiPropertyOptional()
  @IsOptional()
  tableId?: any;

  @ApiPropertyOptional()
  @IsOptional()
  where?: any;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: any;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: any;

  @ApiPropertyOptional()
  @IsOptional()
  headerList?: string[];
}

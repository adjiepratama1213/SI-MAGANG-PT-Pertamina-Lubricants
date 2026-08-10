import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchPositionDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  where?: Prisma.PositionWhereInput;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: Prisma.PositionWhereUniqueInput;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: Prisma.PositionOrderByWithRelationInput;
}

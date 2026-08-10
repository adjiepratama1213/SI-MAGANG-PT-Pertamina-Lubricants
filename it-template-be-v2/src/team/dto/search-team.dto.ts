import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchTeamDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  where?: Prisma.OrganizationWhereInput;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: Prisma.OrganizationWhereUniqueInput;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: Prisma.OrganizationOrderByWithRelationInput;
}

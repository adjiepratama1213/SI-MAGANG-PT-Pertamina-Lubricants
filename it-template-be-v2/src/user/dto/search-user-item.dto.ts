import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchUserDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  where?: Prisma.UserWhereInput;

  @ApiPropertyOptional()
  @IsOptional()
  cursor?: Prisma.UserWhereUniqueInput;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: Prisma.UserOrderByWithRelationInput;
}

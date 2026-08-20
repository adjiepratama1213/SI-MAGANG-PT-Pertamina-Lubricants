import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Prisma } from '@prisma/client';

export class SearchInternProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  where?: Prisma.InternProfileWhereInput;

  @ApiProperty({ required: false })
  @IsOptional()
  orderBy?: Prisma.InternProfileOrderByWithRelationInput;

  @ApiProperty({ required: false })
  @IsOptional()
  cursor?: Prisma.InternProfileWhereUniqueInput;
}

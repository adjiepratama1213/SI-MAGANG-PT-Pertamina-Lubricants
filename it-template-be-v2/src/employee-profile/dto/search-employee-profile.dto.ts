import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Prisma } from '@prisma/client';

export class SearchEmployeeProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  skip?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  where?: Prisma.EmployeeProfileWhereInput;

  @ApiProperty({ required: false })
  @IsOptional()
  orderBy?: Prisma.EmployeeProfileOrderByWithRelationInput;

  @ApiProperty({ required: false })
  @IsOptional()
  cursor?: Prisma.EmployeeProfileWhereUniqueInput;
}

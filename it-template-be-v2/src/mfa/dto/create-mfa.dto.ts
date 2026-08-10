import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMfaDto {
  @ApiProperty()
  @IsString()
  id: string;
}

//src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @ApiProperty()
  token: string;
}
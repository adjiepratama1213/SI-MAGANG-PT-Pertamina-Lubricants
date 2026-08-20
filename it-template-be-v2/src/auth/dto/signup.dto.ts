//src/auth/dto/login.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  // @ApiProperty()
  // @IsString()
  // fullName: string;

  // @ApiProperty()
  // @IsString()
  // emailManager: string;

  // @ApiProperty()
  // @IsString()
  // phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  status: string;

  @ApiProperty()
  @IsString()
  positionId: string;

  // @ApiProperty()
  // @IsString()
  // teamId: string;

  @ApiProperty()
  @IsString()
  jobTitle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;
}

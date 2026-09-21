//src/auth/dto/login.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(32, { message: 'Password maksimal 32 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'Password harus mengandung huruf dan angka' })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

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

  // --- Data Akademis Peserta (Opsional) ---
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  major?: string;

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional()
  @IsOptional()
  documentUrls?: string[];
}

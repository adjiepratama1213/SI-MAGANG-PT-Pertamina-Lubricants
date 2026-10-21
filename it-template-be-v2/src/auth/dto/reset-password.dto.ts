import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SendResetOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @ApiProperty({ example: 'user@pertamina.com' })
  email: string;
}

export class VerifyResetOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @ApiProperty({ example: 'user@pertamina.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP verifikasi wajib diisi' })
  @MinLength(6, { message: 'Kode OTP harus 6 digit' })
  @MaxLength(6, { message: 'Kode OTP harus 6 digit' })
  @ApiProperty({ example: '123456' })
  otp: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @ApiProperty({ example: 'user@pertamina.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP verifikasi wajib diisi' })
  @MinLength(6, { message: 'Kode OTP harus 6 digit' })
  @MaxLength(6, { message: 'Kode OTP harus 6 digit' })
  @ApiProperty({ example: '123456' })
  otp: string;

  @IsString()
  @IsNotEmpty({ message: 'Kata sandi baru wajib diisi' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(32, { message: 'Password maksimal 32 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password harus mengandung kombinasi huruf dan angka',
  })
  @ApiProperty({ example: 'NewPass123' })
  newPassword: string;
}

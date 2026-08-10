import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { IsEmail } from 'class-validator';

export class CreateUserDto implements User {
  plantId: string;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  photoUrl: string;
  jobTitle: string;
  webAuthnId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  password: string;
  phone: string;

  @ApiProperty()
  name: string;

  role: $Enums.Role;
  status: $Enums.UserStatus;

  vendorId: number;
  idamanId: string;
  positionId: string;
  teamId: string;

  encryptedSecret: string;
  hashBackupCode: string;
}

import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';

export class UserEntity implements User {
  @ApiProperty()
  id: string;
  photoUrl: string;
  jobTitle: string;

  createdAt: Date;
  updatedAt: Date;
  email: string;
  phone: string;
  webAuthnId: string;
  isVerified?: boolean;

  @ApiHideProperty()
  password: string;

  role: $Enums.Role;
  name: string;
  vendorId: number;
  teamId: string;
  status: $Enums.UserStatus;
  idamanId: string;
  positionId: string;
  plantId: string;
  encryptedSecret: string;
  hashBackupCode: string;

  Vendor: any;
  Position: any;
  // Team: any;
}

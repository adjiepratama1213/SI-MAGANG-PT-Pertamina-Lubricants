import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class IdamanUserEntity {
  @ApiProperty()
  id: string;
  directoryId: string;

  createdAt: Date;
  updatedAt: Date;
  email: string;
  phone: string;
  photo: string;
  jobTitle: string;
  isActive: boolean;

  @ApiHideProperty()
  password: string;

  role: $Enums.Role;
  displayName: string;
  vendorId: number;
  teamId: string;
  plantId: string;

  position: any;
  Vendor: any;
  Team: any;
}

import { ApiProperty } from '@nestjs/swagger';

export class UserStatusEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  encryptedSecret: string;

  @ApiProperty({ enum: ['email', 'authenticator'], required: false })
  mfaType?: 'email' | 'authenticator';
}

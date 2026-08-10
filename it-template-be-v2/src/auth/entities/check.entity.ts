//src/auth/entity/auth.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenEntity {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;
}

//src/auth/entity/auth.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenEntity {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

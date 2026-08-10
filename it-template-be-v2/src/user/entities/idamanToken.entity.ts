import { ApiProperty } from '@nestjs/swagger';

export class IdamanTokenEntity {
  @ApiProperty()
  access_token: string;
  expires_in: number;
  token_type: string;
  bearer: string;
}

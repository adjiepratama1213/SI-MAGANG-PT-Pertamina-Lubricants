//src/auth/entity/auth.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entities/user.entity';
import { TokenEntity } from './token.entity';

export class AuthEntity extends TokenEntity {
  @ApiProperty()
  user: Partial<Omit<UserEntity, 'password'>>;
}

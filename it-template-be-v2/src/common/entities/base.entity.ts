import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export abstract class BaseModel {
  @ApiProperty()
  id: number;

  @ApiProperty({
    description: 'Identifies the date and time when the object was created.',
  })
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Identifies the date and time when the object was last updated.',
  })
  @Type(() => Date)
  updatedAt: Date;
}

import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class IdamanOrganizationEntity {
  @ApiProperty()
  id: string;

  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  parent: string;
  name: string;

  @ApiHideProperty()
  companyCode: string;
}

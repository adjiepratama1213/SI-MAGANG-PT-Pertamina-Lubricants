import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Position } from '@prisma/client';
import { IdamanOrganizationEntity } from './idamanOrganization.entity';

export class IdamanPositionEntity implements Position {
  @ApiProperty()
  id: string;

  createdAt: Date;
  updatedAt: Date;
  name: string;
  organization: IdamanOrganizationEntity;

  teamId: string;
  organizationId: string;
  organizationParentId: string;

  @ApiHideProperty()
  isHead: boolean;
  isChief: boolean;
  isOwner: boolean;
  isPublished: boolean;
  isSync: boolean;
}

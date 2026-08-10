import { PartialType } from '@nestjs/swagger';
import { CreateGcpItemDto } from './create-gcp-item.dto';

export class UpdateGcpItemDto extends PartialType(CreateGcpItemDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateInternProfileDto } from './create-intern-profile.dto';

export class UpdateInternProfileDto extends PartialType(CreateInternProfileDto) {}

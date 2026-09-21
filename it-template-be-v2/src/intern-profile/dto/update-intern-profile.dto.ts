import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';
import { CreateInternProfileDto } from './create-intern-profile.dto';
import { IsMaxDurationMonths } from '../validators/max-duration.validator';

export class UpdateInternProfileDto extends PartialType(CreateInternProfileDto) {
  @IsOptional()
  @IsDateString()
  @IsMaxDurationMonths('startDate', 6)
  endDate?: string;
}

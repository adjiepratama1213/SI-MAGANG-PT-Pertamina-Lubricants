import { Module } from '@nestjs/common';
import { BqueryService } from './bquery.service';

@Module({
  providers: [BqueryService],
  exports: [BqueryService],
})
export class BqueryModule {}

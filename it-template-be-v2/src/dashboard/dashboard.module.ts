import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { BqueryModule } from 'src/bquery/bquery.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [BqueryModule],
})
export class DashboardModule {}

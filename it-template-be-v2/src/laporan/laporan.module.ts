import { Module } from '@nestjs/common';
import { LaporanController } from './laporan.controller';
import { LaporanService } from './laporan.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LaporanController],
  providers: [LaporanService],
})
export class LaporanModule {}

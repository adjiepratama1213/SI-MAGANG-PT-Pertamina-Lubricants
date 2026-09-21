import { Module } from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { PresensiController } from './presensi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PresensiController],
  providers: [PresensiService],
  exports: [PresensiService],
})
export class PresensiModule {}

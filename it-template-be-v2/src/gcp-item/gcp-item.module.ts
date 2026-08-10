import { Module } from '@nestjs/common';
import { GcpItemService } from './gcp-item.service';
import { GcpItemController } from './gcp-item.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [GcpItemController],
  providers: [GcpItemService, ConfigService],
  imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
  exports: [GcpItemService],
})
export class GcpItemModule {}

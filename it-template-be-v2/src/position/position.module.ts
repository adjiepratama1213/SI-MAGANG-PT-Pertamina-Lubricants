import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [PositionController],
  providers: [PositionService],
  imports: [PrismaModule],
})
export class PositionModule {}

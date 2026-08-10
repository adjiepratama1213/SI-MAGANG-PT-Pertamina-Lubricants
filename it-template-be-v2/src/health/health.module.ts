import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}

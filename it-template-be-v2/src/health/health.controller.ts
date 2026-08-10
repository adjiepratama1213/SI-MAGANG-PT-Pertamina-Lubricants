import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Health Check')
@Controller('healthz')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      const checkHealth = await this.health.check([
        async () => this.prismaHealth.pingCheck('prisma', this.prisma),
      ]);
      return checkHealth;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}

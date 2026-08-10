import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL || '';

    // Resolve template variables if present
    const resolvedUrl = databaseUrl.includes('${')
      ? databaseUrl
          .replace(/\$\{DB_USER\}/g, process.env.DB_USER || '')
          .replace(/\$\{DB_PASS\}/g, process.env.DB_PASS || '')
          .replace(/\$\{DB_HOST\}/g, process.env.DB_HOST || 'localhost')
          .replace(/\$\{DB_PORT\}/g, process.env.DB_PORT || '5432')
          .replace(/\$\{DB_NAME\}/g, process.env.DB_NAME || '')
      : databaseUrl;

    // PrismaPg can accept either Pool or PoolConfig
    const adapter = new PrismaPg({ connectionString: resolvedUrl });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import config from './common/configs/config';
import { HealthModule } from './health/health.module';
import { PositionModule } from './position/position.module';
import { PrismaModule } from './prisma/prisma.module';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { MfaModule } from './mfa/mfa.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BqueryModule } from './bquery/bquery.module';
import { GcpItemModule } from './gcp-item/gcp-item.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { InternProfileModule } from './intern-profile/intern-profile.module';
import { PresensiModule } from './presensi/presensi.module';
import { LaporanModule } from './laporan/laporan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),

    // 🧱 Global rate limiter
    ThrottlerModule.forRoot([
      {
        ttl: 60, // jendela waktu 60 detik
        limit: 30, // maksimum 30 request per IP per menit
      },
    ]),

    // 🔹 Modul aplikasi kamu
    GcpItemModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UserModule,
    TeamModule,
    PositionModule,
    MailModule,
    MfaModule,
    DashboardModule,
    BqueryModule,
    EmployeeProfileModule,
    InternProfileModule,
    PresensiModule,
    LaporanModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      // 🛡️ Global guard untuk rate limiting
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

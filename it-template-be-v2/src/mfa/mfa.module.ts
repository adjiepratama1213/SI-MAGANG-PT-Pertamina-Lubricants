import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import CryptoService from './crypto.service';
import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

@Module({
  controllers: [MfaController],
  providers: [MfaService, CryptoService],
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, MailModule],
})
export class MfaModule {}

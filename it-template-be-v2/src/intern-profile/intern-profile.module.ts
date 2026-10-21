import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InternProfileController } from './intern-profile.controller';
import { InternProfileService } from './intern-profile.service';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { PresensiModule } from '../presensi/presensi.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [InternProfileController],
  providers: [InternProfileService],
  imports: [PrismaModule, AuthModule, NotificationModule, PresensiModule, MailModule],
  exports: [InternProfileService],
})
export class InternProfileModule {}

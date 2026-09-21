import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [HttpModule, PrismaModule, AuthModule, MailModule],
  exports: [UserService],
})
export class UserModule {}

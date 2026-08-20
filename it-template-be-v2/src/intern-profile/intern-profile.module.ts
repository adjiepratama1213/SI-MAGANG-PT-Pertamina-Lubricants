import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InternProfileController } from './intern-profile.controller';
import { InternProfileService } from './intern-profile.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InternProfileController],
  providers: [InternProfileService],
  imports: [PrismaModule, AuthModule],
  exports: [InternProfileService],
})
export class InternProfileModule {}

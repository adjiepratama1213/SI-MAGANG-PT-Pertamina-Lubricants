import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  imports: [PrismaModule, AuthModule],
  exports: [EmployeeProfileService],
})
export class EmployeeProfileModule {}

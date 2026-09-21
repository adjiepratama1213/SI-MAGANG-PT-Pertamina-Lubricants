import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { IzinDto, CheckInOutDto, UpdateStatusDto } from './dto/presensi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('presensi')
@UseGuards(JwtAuthGuard)
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  async checkIn(@Req() req: any, @Body() dto: CheckInOutDto, @UploadedFile() file?: Express.Multer.File) {
    return this.presensiService.checkIn(req.user.id, dto, file);
  }

  @Post('check-out')
  async checkOut(@Req() req: any, @Body() dto: CheckInOutDto) {
    return this.presensiService.checkOut(req.user.id, dto);
  }

  @Post('izin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async submitIzin(
    @Req() req: any,
    @Body() dto: IzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.presensiService.submitIzin(req.user.id, dto, file);
  }

  @Get('me')
  async getMyPresensi(@Req() req: any) {
    return this.presensiService.getMyPresensi(req.user.id);
  }

  @Get('mentor')
  async getMentorPresensi(@Req() req: any) {
    return this.presensiService.getMentorPresensi(req.user.id);
  }

  @Get('admin/monthly')
  async getAdminMonthlyPresensi(@Req() req: any, @Query('month') month: string) {
    // Usually here you'd check if user is admin, based on req.user.role
    return this.presensiService.getAdminMonthlyPresensi(month);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.presensiService.updateStatus(id, body.status);
  }
}

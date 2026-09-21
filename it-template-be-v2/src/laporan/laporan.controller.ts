import { Controller, Post, Body, UseGuards, Req, Get, UseInterceptors, UploadedFiles, Param, Patch, Delete } from '@nestjs/common';
import { LaporanService } from './laporan.service';
import { CreateLaporanDto, FeedbackLaporanDto } from './dto/laporan.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@UseGuards(AuthGuard('jwt'))
@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${originalName}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadLaporan(
    @Req() req: any, 
    @Body() body: CreateLaporanDto, 
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const fileUrls = files ? files.map(f => `/uploads/${f.filename}`) : [];
    return this.laporanService.createLaporan(req.user.id, {
      keterangan: body.keterangan,
      fileUrls
    });
  }

  @Get('me')
  async getMyLaporan(@Req() req: any) {
    return this.laporanService.getLaporanByUserId(req.user.id);
  }

  @Get('all')
  async getAllLaporan() {
    return this.laporanService.getAllLaporan();
  }

  @Patch(':id/feedback')
  async updateFeedback(@Param('id') id: string, @Body() body: FeedbackLaporanDto) {
    return this.laporanService.updateFeedback(id, body);
  }

  @Delete(':id')
  async deleteLaporan(@Req() req: any, @Param('id') id: string) {
    return this.laporanService.deleteLaporan(id, req.user.id);
  }
}

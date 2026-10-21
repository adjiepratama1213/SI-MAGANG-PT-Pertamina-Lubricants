import { Controller, Post, Body, UseGuards, Req, Get, UseInterceptors, UploadedFiles, Param, Patch, Delete, BadRequestException } from '@nestjs/common';
import { LaporanService } from './laporan.service';
import { CreateLaporanDto, FeedbackLaporanDto } from './dto/laporan.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { uploadLocalFileToGcs } from 'src/common/utils/gcs.utils';

@UseGuards(AuthGuard('jwt'))
@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './uploads/laporan';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${originalName}`);
      },
    }),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB per file (mendukung hingga 15MB file laporan)
    }
  }))
  async uploadLaporan(
    @Req() req: any, 
    @Body() body: CreateLaporanDto, 
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Minimal 1 file laporan harus diunggah');
    }

    // Sinkronisasi otomatis ke GCP Storage bucket di folder uploads/laporan/
    for (const f of files) {
      uploadLocalFileToGcs(f.path, `uploads/laporan/${f.filename}`, f.mimetype)
        .then(() => console.log(`[GCP Storage] Laporan tersimpan di GCP: uploads/laporan/${f.filename}`))
        .catch(err => console.error(`[GCP Storage Error] Laporan gagal ke GCP:`, err));
    }

    const fileUrls = files ? files.map(f => `/uploads/laporan/${f.filename}`) : [];
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

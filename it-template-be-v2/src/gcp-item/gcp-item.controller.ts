import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GcpItemService } from './gcp-item.service';
import { SearchGcpItemDto } from './dto/search-gcp-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { gcsBucket, uploadBufferToGcs, bucketName } from 'src/common/utils/gcs.utils';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Gcp Item')
@Controller('gcp-item')
export class GcpItemController {
  private bucket = gcsBucket;

  constructor(private readonly gcpItemService: GcpItemService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    if (!file) throw new HttpException('File is undefined.', HttpStatus.BAD_REQUEST);

    if (file.size > 20 * 1024 * 1024) {
      throw new HttpException('Ukuran berkas melebihi batas maksimal 20MB.', HttpStatus.BAD_REQUEST);
    }

    // Pastikan selalu ada subfolder yang rapi (documents, users, dll)
    const targetFolder = (folder && folder.trim() && folder !== 'undefined') 
      ? folder.trim() 
      : (file.mimetype.startsWith('image/') ? 'users' : 'documents');

    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}_${cleanOriginalName}`;
    const relativePath = `${targetFolder}/${uniqueName}`;
    const gcpDestinationPath = `uploads/${relativePath}`;

    // 1. Simpan langsung ke Google Cloud Storage (GCP Bucket)
    try {
      await uploadBufferToGcs(file.buffer, gcpDestinationPath, file.mimetype);
      console.log(`[GCP Storage] Berhasil upload berkas ke GCS: ${gcpDestinationPath}`);
    } catch (err) {
      console.error('[GCP Storage Error] Gagal upload ke GCS:', err);
    }

    // 2. Simpan juga salinan di folder local uploads/ agar kompatibel 100% dengan aplikasi
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', targetFolder);
      fs.mkdirSync(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(localFilePath, file.buffer);
    } catch (err) {
      console.warn('[Local Cache Warning] Gagal simpan cache lokal:', err);
    }

    const publicUrl = `http://localhost:8080/uploads/${relativePath}`;
    return {
      url: publicUrl,
      gcpPath: gcpDestinationPath,
      bucket: bucketName,
    };
  }

  @Post('upload-public')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFilePublic(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    if (!file) throw new HttpException('File is undefined.', HttpStatus.BAD_REQUEST);

    if (file.size > 20 * 1024 * 1024) {
      throw new HttpException('Ukuran berkas melebihi batas maksimal 20MB.', HttpStatus.BAD_REQUEST);
    }

    // Pastikan selalu ada subfolder yang rapi (documents, users, dll)
    const targetFolder = (folder && folder.trim() && folder !== 'undefined') 
      ? folder.trim() 
      : (file.mimetype.startsWith('image/') ? 'users' : 'documents');

    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}_${cleanOriginalName}`;
    const relativePath = `${targetFolder}/${uniqueName}`;
    const gcpDestinationPath = `uploads/${relativePath}`;

    // 1. Simpan langsung ke Google Cloud Storage (GCP Bucket)
    try {
      await uploadBufferToGcs(file.buffer, gcpDestinationPath, file.mimetype);
      console.log(`[GCP Storage] Berhasil upload berkas publik ke GCS: ${gcpDestinationPath}`);
    } catch (err) {
      console.error('[GCP Storage Error] Gagal upload ke GCS:', err);
    }

    // 2. Simpan juga salinan di folder local uploads/ agar kompatibel
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', targetFolder);
      fs.mkdirSync(uploadDir, { recursive: true });
      const localFilePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(localFilePath, file.buffer);
    } catch (err) {
      console.warn('[Local Cache Warning] Gagal simpan cache lokal:', err);
    }

    const publicUrl = `http://localhost:8080/uploads/${relativePath}`;
    return {
      url: publicUrl,
      gcpPath: gcpDestinationPath,
      bucket: bucketName,
    };
  }

  @ApiExcludeEndpoint()
  @Get('file/*')
  async getGcpFile(@Req() req: any, @Res() res: Response) {
    const rawPath = req.params[0] || '';
    const filePath = decodeURIComponent(rawPath);
    try {
      const gcpFile = this.bucket.file(filePath);
      const [exists] = await gcpFile.exists();
      if (exists) {
        const [metadata] = await gcpFile.getMetadata();
        res.set({
          'Content-Type': metadata.contentType || 'application/octet-stream',
          'Content-Length': metadata.size,
          'Cache-Control': 'public, max-age=86400',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        return gcpFile.createReadStream().pipe(res);
      }

      // Fallback ke file lokal jika belum ada di GCP
      const localPath = path.join(
        process.cwd(),
        filePath.startsWith('uploads') ? filePath : path.join('uploads', filePath)
      );
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }

      throw new HttpException('Berkas tidak ditemukan di storage', HttpStatus.NOT_FOUND);
    } catch (err) {
      console.error('[GCP File Stream Error]', err);
      throw new HttpException('Gagal mengambil berkas dari storage', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async create(@Request() req, @Body() createGcpItemDto: CreateGcpItemDto) {
  //   const userId = req.user.id;
  //   const teamId = req.user.teamId;

  //   createGcpItemDto.authorId = userId;
  //   createGcpItemDto.teamId = teamId;
  //   return this.gcpItemService.create(createGcpItemDto);
  // }

  // @Post('/search/:teamId')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiBody({ type: SearchGcpItemDto, required: false })
  // async findByTeamId(
  //   @Param('teamId') teamId?: string,
  //   @Body() search?: SearchGcpItemDto
  // ) {
  //   const { skip, take, orderBy, cursor } = search;
  //   return this.gcpItemService.findAll({
  //     where: teamId
  //       ? { AND: [{ teamId: teamId, isFeatured: false }] }
  //       : { AND: [{ isFeatured: false }] },
  //     orderBy,
  //     take,
  //     skip,
  //     cursor,
  //   });
  // }

  // @Post('/search-featured')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiBody({ type: SearchGcpItemDto, required: false })
  // async findByFeatured(@Body() search?: SearchGcpItemDto) {
  //   const { skip, take, orderBy, cursor } = search;
  //   return this.gcpItemService.findAll({
  //     where: { AND: [{ isFeatured: true }] },
  //     orderBy,
  //     take,
  //     skip,
  //     cursor,
  //   });
  // }

  // @Get()
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async findAll(
  //   @Query('orderBy') orderBy?: Prisma.GcpItemOrderByWithRelationInput,
  //   @Body() where?: Prisma.GcpItemWhereInput
  // ) {
  //   return this.gcpItemService.findAll({
  //     where,
  //     orderBy,
  //   });
  // }

  // @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async update(
  //   @Param('id') id: string,
  //   @Request() req,
  //   @Body() updateGcpItemDto: UpdateGcpItemDto
  // ) {
  //   const userId = req.user.id;

  //   updateGcpItemDto.authorId = userId;
  //   return this.gcpItemService.update(id, updateGcpItemDto);
  // }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async remove(@Param('id') id: string) {
  //   return this.gcpItemService.remove(id);
  // }

  @Get('datasets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDatasets() {
    const datasets = await this.gcpItemService.getDatasets();
    return datasets;
  }

  @Get('datasets-with-metadata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDatasetsWithMetadata() {
    const datasets = await this.gcpItemService.getDatasetsWithMetadata();
    return datasets;
  }

  @Get('table-from-datasets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTablesFromDataset(@Param('id') id: string) {
    const datasets = await this.gcpItemService.getTablesFromDataset(id);
    return datasets;
  }

  @Get('table-from-datasets-with-metadata/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTablesFromDatasetWithMetadata(@Param('id') id: string) {
    const datasets = await this.gcpItemService.getTablesFromDatasetWithMetadata(id);
    return datasets;
  }

  @Get('field-from-table/:datasetId/:tableName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getFieldsFromTable(
    @Param('datasetId') datasetId: string,
    @Param('tableName') tableName: string
  ) {
    const datasets = await this.gcpItemService.getFieldsFromTable(datasetId, tableName);
    return datasets;
  }

  @Get('data-from-table/:datasetId/:tableName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDataFromTable(
    @Param('datasetId') datasetId: string,
    @Param('tableName') tableName: string
  ) {
    const datasets = await this.gcpItemService.getDatasFromTable(datasetId, tableName);
    return datasets;
  }

  @Post('data-from-table/:datasetId/:tableId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: SearchGcpItemDto, required: false })
  async searchDataFromTable(
    @Param('datasetId') datasetId: string,
    @Param('tableId') tableId: string,
    @Body() search?: SearchGcpItemDto
  ) {
    const { headerList, skip, take, orderBy, cursor, where } = search;
    return this.gcpItemService.getDatasFromTableWithCustomQuery({
      datasetId,
      tableId,
      headerList,
      where: where,
      // where: { AND: [{ isFeatured: true }] },
      orderBy,
      take,
      skip,
      cursor,
    });
    // const datasets = await this.gcpItemService.getDatasFromTableWithCustomQuery(
    //   datasetId,
    //   tableName
    // );
    // return datasets;
  }

  // @Get('acquire-embed-session')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async acquireEmbedSession(@Request() req) {
  //   console.log("ME MASUK 1");
  //   const userAgent = req.headers['user-agent'];
  //   const user = req.user; // Assuming JWT decoded user info is in req.user
  //   console.log("ME MASUK 2");
  //   const tokens = await this.gcpItemService.acquireEmbedSession(userAgent, user);
  //   return tokens;
  // }

  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // async findOne(@Param('id') id: string) {
  //   return this.gcpItemService.findOne(id);
  // }

  // custom dashboard
  @Get('finance-executive-summary')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async getCustomNetProfit() {
    // async getCustomNetProfit(@Param('year') year: number) {
    const datasets = await this.gcpItemService.getCustomNetProfit();
    return datasets;
  }
}

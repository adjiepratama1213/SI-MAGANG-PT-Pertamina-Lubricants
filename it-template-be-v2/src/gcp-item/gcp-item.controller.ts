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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GcpItemService } from './gcp-item.service';
import { SearchGcpItemDto } from './dto/search-gcp-item.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Gcp Item')
@Controller('gcp-item')
export class GcpItemController {
  private storage = new Storage({
    keyFilename: process.env.GCP_PATH,
    projectId: process.env.GCP_PROJECT_ID,
  });
  private bucket = this.storage.bucket(process.env.GCP_BUCKET_NAME);

  constructor(private readonly gcpItemService: GcpItemService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    if (!file) throw new HttpException('File is undefined.', HttpStatus.BAD_REQUEST);

    const uploadDir = path.join(process.cwd(), 'uploads', folder || '');
    fs.mkdirSync(uploadDir, { recursive: true });
    
    const uniqueName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    const publicUrl = `http://localhost:8080/uploads/${folder ? folder + '/' : ''}${uniqueName}`;
    return { url: publicUrl };
  }

  @Post('upload-public')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFilePublic(@UploadedFile() file: Express.Multer.File, @Body('folder') folder: string) {
    if (!file) throw new HttpException('File is undefined.', HttpStatus.BAD_REQUEST);

    const uploadDir = path.join(process.cwd(), 'uploads', folder || '');
    fs.mkdirSync(uploadDir, { recursive: true });
    
    const uniqueName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    const publicUrl = `http://localhost:8080/uploads/${folder ? folder + '/' : ''}${uniqueName}`;
    return { url: publicUrl };
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

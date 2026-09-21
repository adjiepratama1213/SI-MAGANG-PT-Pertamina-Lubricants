import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InternProfileService } from './intern-profile.service';
import { CreateInternProfileDto } from './dto/create-intern-profile.dto';
import { UpdateInternProfileDto } from './dto/update-intern-profile.dto';
import { SearchInternProfileDto } from './dto/search-intern-profile.dto';

@ApiTags('Intern Profile')
@Controller('intern-profile')
export class InternProfileController {
  constructor(private readonly internProfileService: InternProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    return this.internProfileService.findAll({});
  }

  @Post('/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: SearchInternProfileDto, required: false })
  async search(@Body() search?: SearchInternProfileDto) {
    return this.internProfileService.findAll(search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.internProfileService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByUserId(@Param('userId') userId: string) {
    return this.internProfileService.findByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createDto: CreateInternProfileDto) {
    return this.internProfileService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateDto: UpdateInternProfileDto) {
    return this.internProfileService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.internProfileService.remove(id);
  }

  @Post(':id/extend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newEndDate: { type: 'string', format: 'date-time' },
        reason: { type: 'string' }
      }
    }
  })
  async extend(
    @Param('id') id: string,
    @Body('newEndDate') newEndDate: string,
    @Body('reason') reason?: string
  ) {
    return this.internProfileService.requestExtension(id, newEndDate, reason);
  }

  @Post(':userId/evaluation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async submitEvaluation(
    @Param('userId') userId: string,
    @Body() data: any
  ) {
    return this.internProfileService.submitEvaluationByUser(userId, data);
  }

  @Post(':internProfileId/certificate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/certificates';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'certificate-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  async uploadCertificate(
    @Param('internProfileId') internProfileId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.internProfileService.uploadCertificate(internProfileId, file);
  }
}

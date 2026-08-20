import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
}

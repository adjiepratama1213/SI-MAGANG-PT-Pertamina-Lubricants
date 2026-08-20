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
import { EmployeeProfileService } from './employee-profile.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { SearchEmployeeProfileDto } from './dto/search-employee-profile.dto';

@ApiTags('Employee Profile')
@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    return this.employeeProfileService.findAll({});
  }

  @Post('/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: SearchEmployeeProfileDto, required: false })
  async search(@Body() search?: SearchEmployeeProfileDto) {
    return this.employeeProfileService.findAll(search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.employeeProfileService.findOne(id);
  }

  @Get('by-user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByUserId(@Param('userId') userId: string) {
    return this.employeeProfileService.findByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createDto: CreateEmployeeProfileDto) {
    return this.employeeProfileService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeProfileDto) {
    return this.employeeProfileService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return this.employeeProfileService.remove(id);
  }
}

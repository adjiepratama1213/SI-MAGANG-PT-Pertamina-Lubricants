import { Controller, Get, Body, Param, UseGuards, Query, Post } from '@nestjs/common';
import { PositionService } from './position.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SearchPositionDto } from './dto/search-position.dto';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  // @Post()
  // create(@Body() createPositionDto: CreatePositionDto) {
  //   return this.positionService.create(createPositionDto);
  // }

  @Post('/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: SearchPositionDto, required: false })
  async findSearch(@Body() search?: SearchPositionDto) {
    const { where, skip, take, orderBy, cursor } = search;
    return this.positionService.findAll({
      where,
      orderBy,
      take,
      skip,
      cursor,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(
    @Query('orderBy') orderBy?: Prisma.PositionOrderByWithRelationInput,
    @Body() where?: Prisma.PositionWhereInput
  ) {
    return this.positionService.findAll({
      where,
      orderBy,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
  //   return this.positionService.update(+id, updatePositionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.positionService.remove(+id);
  // }
}

import { Injectable } from '@nestjs/common';
// import { CreatePositionDto } from './dto/create-position.dto';
// import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchPositionDto } from './dto/search-position.dto';
import { Position } from '@prisma/client';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  // create(createPositionDto: CreatePositionDto) {
  //   return 'This action adds a new position';
  // }

  async findAll(search: SearchPositionDto): Promise<{ results: Position[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.position.findMany({
        take,
        skip,
        where,
        orderBy,
        include: {
          Team: true,
        },
      });

      const count = await this.prisma.position.count({ where });
      return { results: results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.prisma.position.findUnique({
        where: { id: id },
        include: {
          Team: true,
        },
      });

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // update(id: number, updatePositionDto: UpdatePositionDto) {
  //   return `This action updates a #${id} position`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} position`;
  // }
}

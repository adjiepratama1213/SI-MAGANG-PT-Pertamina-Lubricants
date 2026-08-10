import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { SearchTeamDto } from './dto/search-team.dto';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    try {
      return this.prisma.organization.create({ data: createTeamDto });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAll(search: SearchTeamDto): Promise<{ results: Team[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.organization.findMany({
        take,
        skip,
        where,
        // cursor,
        orderBy,
        include: {
          positions: { select: { id: true, isHead: true, User: { select: { name: true } } } },
          teams: true,
          _count: { select: { teams: true } },
        },
      });

      const count = await this.prisma.organization.count({ where });

      return { results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findAllWithUser(search: SearchTeamDto): Promise<{ results: Team[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.organization.findMany({
        take,
        skip,
        where,
        // cursor,
        orderBy,
        include: {
          positions: { select: { id: true, isHead: true } },
          teams: {
            include: {
              User: {
                select: { id: true, status: true, name: true, positionId: true, email: true },
              },
            },
          },
        },
      });

      const count = await this.prisma.organization.count({ where });

      return { results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.prisma.organization.findUnique({ where: { id: id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    try {
      return this.prisma.organization.update({
        where: { id: id },
        data: updateTeamDto,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.organization.delete({ where: { id: id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

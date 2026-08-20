import { Injectable } from '@nestjs/common';
import { EmployeeProfile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { SearchEmployeeProfileDto } from './dto/search-employee-profile.dto';

@Injectable()
export class EmployeeProfileService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    search: SearchEmployeeProfileDto
  ): Promise<{ results: EmployeeProfile[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.employeeProfile.findMany({
        take,
        skip,
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          internsMentored: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const count = await this.prisma.employeeProfile.count({ where });

      return { results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.prisma.employeeProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          internsMentored: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findByUserId(userId: string) {
    try {
      return this.prisma.employeeProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              photoUrl: true,
            },
          },
          internsMentored: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(createDto: CreateEmployeeProfileDto) {
    try {
      return this.prisma.employeeProfile.create({
        data: {
          userId: createDto.userId,
          employeeId: createDto.employeeId,
          jabatan: createDto.jabatan,
          direktorat: createDto.direktorat,
          fungsi: createDto.fungsi,
          subFungsi: createDto.subFungsi,
          gender: createDto.gender,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateEmployeeProfileDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...rest } = updateDto;
      return this.prisma.employeeProfile.update({
        where: { id },
        data: rest,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.employeeProfile.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

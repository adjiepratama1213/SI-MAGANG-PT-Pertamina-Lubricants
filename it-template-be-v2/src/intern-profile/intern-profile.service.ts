import { Injectable } from '@nestjs/common';
import { InternProfile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInternProfileDto } from './dto/create-intern-profile.dto';
import { UpdateInternProfileDto } from './dto/update-intern-profile.dto';
import { SearchInternProfileDto } from './dto/search-intern-profile.dto';

@Injectable()
export class InternProfileService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    search: SearchInternProfileDto
  ): Promise<{ results: InternProfile[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.internProfile.findMany({
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
          mentor: {
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

      const count = await this.prisma.internProfile.count({ where });

      return { results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.prisma.internProfile.findUnique({
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
          mentor: {
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
      return this.prisma.internProfile.findUnique({
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
          mentor: {
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

  async create(createDto: CreateInternProfileDto) {
    try {
      return this.prisma.internProfile.create({
        data: {
          userId: createDto.userId,
          internId: createDto.internId,
          university: createDto.university,
          gender: createDto.gender,
          dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined,
          major: createDto.major,
          startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
          endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
          program: createDto.program,
          documentUrls: createDto.documentUrls,
          mentorProfileId: createDto.mentorProfileId,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateInternProfileDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, dateOfBirth, startDate, endDate, ...rest } = updateDto;
      return this.prisma.internProfile.update({
        where: { id },
        data: {
          ...rest,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.internProfile.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

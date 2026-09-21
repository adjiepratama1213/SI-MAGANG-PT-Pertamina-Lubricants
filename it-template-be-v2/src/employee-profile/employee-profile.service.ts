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

  async getOrganizationHierarchy() {
    const allOrgs = await this.prisma.organization.findMany();
    const tree = [];
    const dirs = allOrgs.filter(o => !o.parentId && o.name !== 'Production Unit Jakarta');
    for (const dir of dirs) {
      const fungsi = allOrgs.filter(o => o.parentId === dir.id).map(f => {
        const subFungsi = allOrgs.filter(s => s.parentId === f.id).map(s => ({ id: s.id, name: s.name, kuota: s.kuota }));
        return { id: f.id, name: f.name, kuota: f.kuota, subFungsi };
      });
      tree.push({ id: dir.id, name: dir.name, kuota: dir.kuota, fungsi });
    }
    return tree;
  }

  async addOrganization(data: { name: string; parentId?: string; companyCode?: string; kuota?: number }) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        companyCode: data.companyCode || '2508',
        kuota: data.kuota || 0,
        isPublished: true,
      },
    });
  }

  async updateOrganizationKuota(id: string, kuota: number) {
    return this.prisma.organization.update({
      where: { id },
      data: { kuota },
    });
  }

  async removeOrganization(id: string) {
    // Find all children and recursively delete them first to prevent them from becoming orphaned top-level entities
    const children = await this.prisma.organization.findMany({
      where: { parentId: id },
    });
    
    for (const child of children) {
      await this.removeOrganization(child.id);
    }

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  private async ensureOrganizationHierarchy(direktorat?: string, fungsi?: string, subFungsi?: string) {
    if (!direktorat) return;

    let dirId = null;
    const existingDir = await this.prisma.organization.findFirst({ where: { name: direktorat, parentId: null } });
    if (existingDir) {
      dirId = existingDir.id;
    } else {
      const newDir = await this.prisma.organization.create({ data: { name: direktorat, companyCode: '2508', isPublished: true } });
      dirId = newDir.id;
    }

    if (!fungsi) return;
    let funcId = null;
    const existingFunc = await this.prisma.organization.findFirst({ where: { name: fungsi, parentId: dirId } });
    if (existingFunc) {
      funcId = existingFunc.id;
    } else {
      const newFunc = await this.prisma.organization.create({ data: { name: fungsi, parentId: dirId, companyCode: '2508', isPublished: true } });
      funcId = newFunc.id;
    }

    if (!subFungsi) return;
    const existingSubFunc = await this.prisma.organization.findFirst({ where: { name: subFungsi, parentId: funcId } });
    if (!existingSubFunc) {
      await this.prisma.organization.create({ data: { name: subFungsi, parentId: funcId, companyCode: '2508', isPublished: true } });
    }
  }

  async create(createDto: CreateEmployeeProfileDto) {
    try {
      await this.ensureOrganizationHierarchy(createDto.direktorat, createDto.fungsi, createDto.subFungsi);

      return await this.prisma.employeeProfile.create({
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
      
      await this.ensureOrganizationHierarchy(rest.direktorat, rest.fungsi, rest.subFungsi);

      return await this.prisma.employeeProfile.update({
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

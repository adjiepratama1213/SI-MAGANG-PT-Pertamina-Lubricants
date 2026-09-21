import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// Trigger restart
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
          evaluation: true,
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
          evaluation: true,
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
          evaluation: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async validateMentorQuota(mentorProfileId: string | null, currentInternId?: string) {
    if (!mentorProfileId) return;

    const mentor = await this.prisma.employeeProfile.findUnique({
      where: { id: mentorProfileId }
    });
    if (!mentor || !mentor.subFungsi || !mentor.fungsi || !mentor.direktorat) return;

    const subFungsis = await this.prisma.organization.findMany({
      where: { name: mentor.subFungsi }
    });
    
    let targetOrg = null;
    for (const sf of subFungsis) {
      if (sf.parentId) {
        const f = await this.prisma.organization.findUnique({ where: { id: sf.parentId } });
        if (f && f.name === mentor.fungsi) {
           if (f.parentId) {
             const d = await this.prisma.organization.findUnique({ where: { id: f.parentId }});
             if (d && d.name === mentor.direktorat) {
                targetOrg = sf;
                break;
             }
           }
        }
      }
    }

    if (!targetOrg) return;

    const mentorsInSubFungsi = await this.prisma.employeeProfile.findMany({
      where: {
        direktorat: mentor.direktorat,
        fungsi: mentor.fungsi,
        subFungsi: mentor.subFungsi
      }
    });

    const mentorIds = mentorsInSubFungsi.map(m => m.id);

    const internsCount = await this.prisma.internProfile.count({
      where: {
        mentorProfileId: { in: mentorIds },
        ...(currentInternId ? { id: { not: currentInternId } } : {})
      }
    });

    if (internsCount >= targetOrg.kuota) {
      throw new BadRequestException(`Kuota untuk Sub-Fungsi ${mentor.subFungsi} sudah penuh (Maks: ${targetOrg.kuota}).`);
    }
  }

  async create(createDto: CreateInternProfileDto) {
    try {
      await this.validateMentorQuota(createDto.mentorProfileId || null);

      return await this.prisma.internProfile.create({
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
          bankName: createDto.bankName,
          bankAccount: createDto.bankAccount,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateInternProfileDto) {
    try {
      if (updateDto.mentorProfileId !== undefined) {
        await this.validateMentorQuota(updateDto.mentorProfileId || null, id);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, dateOfBirth, startDate, endDate, ...rest } = updateDto;
      return await this.prisma.internProfile.update({
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

  async requestExtension(internProfileId: string, newEndDateStr: string, reason?: string) {
    try {
      const intern = await this.prisma.internProfile.findUnique({
        where: { id: internProfileId },
      });

      if (!intern) {
        throw new NotFoundException('Intern profile not found');
      }

      if (intern.program === 'Internship Kemnaker') {
        throw new BadRequestException('Program Internship Kemnaker tidak dapat mengajukan perpanjangan');
      }

      const previousEndDate = intern.endDate;
      if (!previousEndDate) {
        throw new BadRequestException('Data magang sebelumnya belum memiliki tanggal selesai');
      }

      const newEndDate = new Date(newEndDateStr);
      
      // Calculate total duration from original start date to new end date
      if (intern.startDate) {
        const tempDate = new Date(intern.startDate);
        tempDate.setMonth(tempDate.getMonth() + 6);
        
        if (newEndDate > tempDate) {
          throw new BadRequestException('Total durasi magang tidak boleh lebih dari 6 bulan (termasuk perpanjangan)');
        }
      }

      return await this.prisma.internExtensionRequest.create({
        data: {
          internProfileId,
          previousEndDate,
          newEndDate,
          reason,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async submitEvaluationByUser(userId: string, data: any) {
    try {
      const intern = await this.prisma.internProfile.findUnique({
        where: { userId },
      });

      if (!intern) {
        throw new NotFoundException('Intern profile not found');
      }

      const internProfileId = intern.id;
      const {
        integritas,
        ketepatanWaktu,
        keahlian,
        kerjasama,
        komunikasi,
        penggunaanTI,
        pengembanganDiri,
        catatan,
      } = data;

      const nilaiRataRata =
        (integritas + ketepatanWaktu + keahlian + kerjasama + komunikasi + penggunaanTI + pengembanganDiri) / 7;

      let kategori = '-';
      if (nilaiRataRata >= 90) kategori = 'Sangat Baik';
      else if (nilaiRataRata >= 76) kategori = 'Baik';
      else if (nilaiRataRata >= 60) kategori = 'Cukup';
      else if (nilaiRataRata >= 50) kategori = 'Kurang';
      else kategori = 'Sangat Kurang';

      return await this.prisma.internEvaluation.upsert({
        where: { internProfileId },
        update: {
          integritas,
          ketepatanWaktu,
          keahlian,
          kerjasama,
          komunikasi,
          penggunaanTI,
          pengembanganDiri,
          catatan,
          nilaiRataRata,
          kategori,
        },
        create: {
          internProfileId,
          integritas,
          ketepatanWaktu,
          keahlian,
          kerjasama,
          komunikasi,
          penggunaanTI,
          pengembanganDiri,
          catatan,
          nilaiRataRata,
          kategori,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async uploadCertificate(internProfileId: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('File is required');
      }

      // Pastikan evaluation exist
      const evaluation = await this.prisma.internEvaluation.findUnique({
        where: { internProfileId },
      });

      if (!evaluation) {
        throw new NotFoundException('Evaluation not found for this intern');
      }

      const fileUrl = `/uploads/certificates/${file.filename}`;

      return await this.prisma.internEvaluation.update({
        where: { internProfileId },
        data: { certificateUrl: fileUrl },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

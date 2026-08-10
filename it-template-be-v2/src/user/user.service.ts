import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as qs from 'qs';
import { firstValueFrom } from 'rxjs';
import { generateRandomNumber } from 'src/common/utils/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { SearchUserDto } from './dto/search-user-item.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IdamanOrganizationEntity } from './entities/idamanOrganization.entity';
import { IdamanTokenEntity } from './entities/idamanToken.entity';
import { IdamanUserEntity } from './entities/idamanUser.entity';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private passwordService: PasswordService,
    private configService: ConfigService
  ) {}

  async findAll(search: SearchUserDto): Promise<{ results: User[]; count: number }> {
    const { skip, take, where, orderBy } = search;
    try {
      const results = await this.prisma.user.findMany({
        take,
        skip,
        where,
        // cursor,
        orderBy,
        include: {
          // Position: { select: { name: true } },
          Position: {
            include: {
              Team: true,
            },
          },
          // _count: { select: { QRCodes: true } },
        },
        // include: {
        //   // FavoritePerson: { select: { name: true, avatarUrl: true } },

        //   // QRCodes: {
        //   //   select: { VendorReal: { select: { id: true } } },
        //   //   where: { vendorRealId: { not: null } },
        //   // },
        // },
        // select: {
        //   id: true,
        //   email: true,
        //   name: true,
        //   role: true,
        //   createdAt: true,
        // },
      });

      const count = await this.prisma.user.count({ where });

      return { results, count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          photoUrl: true,
          idamanId: true,
          status: true,
          positionId: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findByEmailmanager(email: string) {
    try {
      // Cari teamId berdasarkan email user
      const user = await this.prisma.user.findUnique({
        where: {
          email,
          idamanId: { not: null },
          Position: {
            isHead: true,
          },
        },
        select: {
          Position: {
            select: {
              teamId: true,
            },
          },
        },
      });

      if (!user || !user.Position) {
        throw new Error('User atau teamId tidak ditemukan');
      }

      const teamId = user.Position.teamId; // Ambil teamId dari hasil query

      // Cari semua user berdasarkan teamId
      return await this.prisma.user.findMany({
        where: {
          idamanId: { not: null },
          Position: {
            teamId: teamId,
            isHead: false,
          },
        },
        select: {
          name: true,
          Position: {
            select: {
              id: true,
              name: true,
              teamId: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { positionId, teamId: _, ...rest } = updateUserDto;

      return this.prisma.user.update({
        where: { id },
        data: {
          ...rest, // Masukkan semua field lain kecuali positionId
          Position: positionId ? { connect: { id: positionId } } : undefined, // Update position jika ada
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePhoneNumber(id: string, phoneNumber: string) {
    try {
      return this.prisma.user.update({
        where: { id },
        data: {
          phone: phoneNumber,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePasswordByAdmin(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Hash password baru
    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);

    // Update password di database
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async updateWebAuthn(id: string, webAuthnId: string) {
    try {
      return this.prisma.user.update({
        where: { id, webAuthnId },
        data: {
          webAuthnId: generateRandomNumber(12),
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return this.prisma.user.delete({ where: { id: id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTokenIdaman(): Promise<IdamanTokenEntity> {
    const url = this.configService.get<string>('IDAMAN_URL');
    const body = {
      client_id: this.configService.get<string>('IDAMAN_CLIENT_ID'),
      client_secret: this.configService.get<string>('IDAMAN_CLIENT_SECRET'),
      grant_type: this.configService.get<string>('IDAMAN_GRANT_TYPE'),
      scope: this.configService.get<string>('IDAMAN_SCOPE'),
    };
    try {
      const response = await firstValueFrom(this.httpService.post(url, qs.stringify(body)));
      return response.data;
    } catch (error) {
      console.error('Error syncing with Idaman:', error);
      throw error;
    }
  }

  async syncIdamanUser(jwtToken: string) {
    const url = `${this.configService.get<string>('IDAMAN_REST_URL')}v1/users?sortOrder=&searchText=2138&page=1&take=5000`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: 'text/plain',
          },
        })
      );

      const users: IdamanUserEntity[] = response.data.value; // Assuming response.data is an array of user data

      // Iterate over each user and upsert accordingly
      const upsertPromises = users.map(async (user) => {
        const position = user?.position;
        const org = position?.organization;

        const orgId = org?.id;
        const orgName = org?.name;
        const orgCompanyCode = org?.companyCode;
        const orgParent = org?.parent;
        const positionId = position?.id;

        // Step 1: Upsert organization
        if (orgId && orgName && orgCompanyCode) {
          const organization = await this.prisma.organization.findUnique({
            where: { id: orgId },
          });

          if (!organization) {
            await this.prisma.organization.create({
              data: {
                id: orgId,
                name: orgName,
                companyCode: orgCompanyCode,
              },
            });
          }
        }

        // Step 2: Upsert position
        if (positionId && orgId) {
          await this.prisma.position.upsert({
            where: { id: positionId },
            update: {
              name: position.name,
              organizationId: orgId,
              organizationParentId: orgParent,
            },
            create: {
              id: positionId,
              name: position.name,
              organizationId: orgId,
              organizationParentId: orgParent,
              isHead: position.isHead,
              isChief: position.isChief,
              isOwner: position.isOwner,
              isPublished: position.isPublished,
              isSync: position.isSync,
            },
          });
        }

        // Step 3: Upsert user
        const hashedPassword = await this.passwordService.hashPassword(
          user.directoryId ?? generateRandomNumber(12)
        );
        return this.prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.displayName,
            idamanId: user.id,
            password: hashedPassword,
            jobTitle: user.jobTitle,
            positionId: positionId,
            photoUrl: user.photo,
          },
          create: {
            email: user.email,
            password: hashedPassword,
            name: user.displayName,
            idamanId: user.id,
            phone: user.phone,
            jobTitle: user.jobTitle,
            photoUrl: user.photo,
            webAuthnId: generateRandomNumber(12),
            positionId: positionId,
          },
        });
      });

      await Promise.all(upsertPromises);
      return { message: 'Sync idaman successful' };
    } catch (error) {
      console.error('Error syncing with Idaman:', error);
      throw error;
    }
  }

  async syncIdamanPosition(jwtToken: string) {
    const url = `${this.configService.get<string>('IDAMAN_REST_URL')}v1/positions/company/2138/True/True/?sortOrder=&searchText=&page=1&take=5000`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: 'text/plain',
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error('Error syncing with Idaman:', error);
      throw error;
    }
  }

  async syncIdamanOrganization(jwtToken: string) {
    const url = `${this.configService.get<string>('IDAMAN_REST_URL')}v1/organizations/company/2138?sortOrder=&searchText=&page=1&take=5000`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: 'text/plain',
          },
        })
      );

      const organizations: IdamanOrganizationEntity[] = response.data.value; // Assuming response.data is an array of user data

      // Iterate over each user and upsert accordingly
      // create without parent id
      const createPromises = organizations.map((organization) => {
        if (organization.id === null || organization.id === '') {
          return 0;
        }
        this.prisma.organization.upsert({
          where: { id: organization.id }, // Assuming `email` is the unique identifier
          create: {
            // Fields to create if the organization does not exist
            isPublished: organization.isPublished,
            companyCode: organization.companyCode,
            name: organization.name,
          },
          update: {
            // Fields to create if the organization does not exist
            id: organization.id,
            isPublished: organization.isPublished,
            companyCode: organization.companyCode,
            name: organization.name,
          },
        });
      });

      const sortedOrganizations = organizations.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });

      // Iterate over each user and upsert accordingly
      const upsertPromises = sortedOrganizations.map((organization) => {
        try {
          const parentId = organization.parent === '' ? null : organization.parent;

          // Ensure parentId exists before upserting the child
          if (parentId && !sortedOrganizations.find((org) => org.id === parentId)) {
            throw new Error(`Parent organization with id ${parentId} not found.`);
          }

          // update with parent id
          return this.prisma.organization.upsert({
            where: { id: organization.id }, // Assuming `email` is the unique identifier
            update: {
              // Fields to update if the organization exists
              name: organization.name,
              isPublished: organization.isPublished,
              companyCode: organization.companyCode,
              parentId: organization.parent === '' ? null : organization.parent,
              // role: organization.role,
              // Add more fields as needed
            },
            create: {
              // Fields to create if the organization does not exist
              id: organization.id,
              isPublished: organization.isPublished,
              companyCode: organization.companyCode,
              name: organization.name,
              // role: organization.role,
              // Add more fields as needed
            },
          });
        } catch (error) {
          console.error(error);
          console.error(`Error processing organization:`, organization);
          // throw error;
        }
      });

      await Promise.all(createPromises);
      await Promise.all(upsertPromises);
      return organizations;
    } catch (error) {
      console.error('Error syncing with Idaman:', error);
      // throw error;
    }
  }

  async syncTeamBasedOnOrganization() {
    const positions = await this.prisma.position.findMany({});
    const organizations = await this.prisma.organization.findMany({});

    const updatePromises = organizations.map(async (organization) => {
      const existingRecords = await this.prisma.position.findMany({
        where: { organizationId: organization.id },
      });

      if (existingRecords.length > 0) {
        const updateInnerPromises = existingRecords.map(async (record) => {
          return this.prisma.position.update({
            where: { id: record.id },
            data: {
              // Fields to update if the organization exists
              name: organization.name,
              organizationParentId: organization.parentId,
            },
          });
        });
        return Promise.all(updateInnerPromises);
      } else {
        // Optionally handle the case where the record doesn't exist
        console.info(`Record with id ${organization.id} does not exist.`);
        return null;
      }
    });

    await Promise.all(updatePromises);

    // Helper function to find a position by organizationId
    const findPositionByOrganizationId = (organizationId) => {
      return positions.find((position) => position.organizationId === organizationId);
    };

    // Recursive function to populate teamId
    const populateTeamId = (position) => {
      if (position.isHead) {
        position.teamId = position.organizationId;
      } else {
        const parentPosition = findPositionByOrganizationId(position.organizationParentId);
        if (parentPosition) {
          if (parentPosition.isHead) {
            position.teamId = parentPosition.organizationId;
          } else {
            populateTeamId(parentPosition);
            position.teamId = parentPosition.teamId;
          }
        }
      }
    };

    // Iterate through each position and populate teamId
    positions.forEach((position) => {
      populateTeamId(position);
    });

    // Update the positions in the database with the newly computed teamId
    const updateTeamIdPromises = positions.map((position) => {
      return this.prisma.position.update({
        where: { id: position.id },
        data: { teamId: position.teamId },
      });
    });

    await Promise.all(updateTeamIdPromises);

    return positions;
  }
}

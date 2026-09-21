import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { SecurityConfig } from 'src/common/configs/config.interface';
import { generateRandomNumber } from 'src/common/utils/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthEntity } from './entities/auth.entity';
import type { TokenEntity } from './entities/token.entity';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {}

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig.refreshIn as any,
    });
  }

  async validateUser(userId: string): Promise<Partial<UserEntity>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        Position: {
          include: {
            Team: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const modUser: Partial<UserEntity> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.Position?.teamId,
    };
    return modUser;
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Bandingkan oldPassword yang dimasukkan dengan password yang tersimpan
    const passwordMatch = await this.passwordService.comparePassword(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect old password');
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

  async verifyEmail(userId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId, email: email } });

    if (!user) {
      throw new UnauthorizedException('Email doesnt match!');
    }

    // Update password di database
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });

    return { message: 'User already verified' };
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string; teamId: string; isVerified?: boolean }): TokenEntity {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  refreshToken(token: string) {
    try {
      const { userId, teamId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
        teamId,
      });
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException();
    }
  }

  async createUser(payload: any): Promise<Partial<UserEntity>> {
    const hashedPassword = await this.passwordService.hashPassword(payload.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          password: hashedPassword,
          name: payload.name,
          phone: payload.phone,
          jobTitle: payload.jobTitle,
          webAuthnId: generateRandomNumber(12),
          status: payload.status ?? 'pending',
          positionId: payload.positionId,
          role: payload.role ?? 'EMPLOYEE',
        },
        include: {
          Position: {
            include: {
              Team: true,
            },
          },
        },
      });

      // Jika role PESERTA, otomatis buat InternProfile
      if ((payload.role ?? 'EMPLOYEE') === 'PESERTA') {
        await this.prisma.internProfile.create({
          data: {
            userId: user.id,
            internId: payload.internId || null,
            university: payload.university || null,
            gender: payload.gender || null,
            dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
            major: payload.major || null,
            startDate: payload.startDate ? new Date(payload.startDate) : null,
            endDate: payload.endDate ? new Date(payload.endDate) : null,
            program: payload.program || null,
            documentUrls: payload.documentUrls || [],
            bankName: payload.bankName || null,
            bankAccount: payload.bankAccount || null,
          },
        });
      }

      const modUser: Partial<UserEntity> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.Position?.teamId,
      };

      return modUser;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      console.error(e);

      throw new Error(`${e}`);
    }
  }

  async checkUserByEmail(email: string): Promise<Partial<UserEntity>> {
    try {
      // Step 1: Fetch a user with the given email
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          Position: {
            include: {
              Team: true,
            },
          },
        },
      });

      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      const modUser: Partial<UserEntity> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.Position?.teamId,
        photoUrl: user.photoUrl,
        positionId: user.positionId,
        Position: user.Position,
        idamanId: user.idamanId,
        webAuthnId: user.webAuthnId,
      };

      // Step 3: Generate a JWT containing the user's ID and return it
      return modUser;
    } catch (e) {
      console.error(e);
      // throw new UnauthorizedException();
      throw e;
    }
  }

  async login(email: string, password: string): Promise<AuthEntity> {
    try {
      // Step 1: Fetch a user with the given email
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          Position: {
            include: {
              Team: true,
            },
          },
        },
      });

      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      // If pending status
      if (user.status === 'pending') {
        throw new NotFoundException(`Please ask your manager approval!`);
      }

      // Step 2: Check if the password is correct
      const isPasswordValid = await this.passwordService.validatePassword(password, user.password);

      // If password does not match, throw an error
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      // If pending status
      if (user.idamanId !== null && user.Position === null) {
        throw new UnauthorizedException(
          `There is something wrong with your Idaman configuration! Make sure your HC has already assigned your HRIS correctly or contact IT.`
        );
      }

      const isVerified = user.idamanId !== null ? true : false;
      const accessToken = this.generateTokens({
        userId: user.id,
        teamId: user.Position?.teamId,
        isVerified,
      });

      const modUser: Partial<UserEntity> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.Position?.teamId,
        photoUrl: user.photoUrl,
        positionId: user.positionId,
        Position: user.Position,
        idamanId: user.idamanId,
        webAuthnId: user.webAuthnId,
        isVerified,
      };

      // Step 3: Generate a JWT containing the user's ID and return it
      return { ...accessToken, user: modUser };
    } catch (e) {
      console.error(e);
      // throw new UnauthorizedException();
      throw e;
    }
  }

  async webAuthn(webAuthnId: string, req?: Request): Promise<AuthEntity> {
    try {
      // Step 1: Fetch a user with the given webAuthnId
      const user = await this.prisma.user.findUnique({
        where: { webAuthnId },
        include: {
          Position: {
            include: {
              Team: true,
            },
          },
        },
      });

      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for id: ${webAuthnId}`);
      }

      await this.prisma.userLog.create({
        data: {
          userId: user.id,
          endpoint: 'me',
          ip: req?.ip,
          userAgent: req?.headers['user-agent'],
        },
      });

      const accessToken = this.generateTokens({
        userId: user.id,
        teamId: user.Position.teamId,
        isVerified: false,
      });

      const modUser: Partial<UserEntity> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.Position.teamId,
        photoUrl: user.photoUrl,
        positionId: user.positionId,
        Position: user.Position,
        idamanId: user.idamanId,
        webAuthnId: user.webAuthnId,
      };

      // Step 3: Generate a JWT containing the user's ID and return it
      return { ...accessToken, user: modUser };
    } catch (e) {
      console.error(e);
      // throw new UnauthorizedException();
      throw e;
    }
  }

  async createPassword(email: string, newPw: string): Promise<TokenEntity> {
    const hashedPassword = await this.passwordService.hashPassword(`${newPw}`);

    try {
      const user = await this.prisma.user.update({
        where: { email: email },
        data: {
          password: hashedPassword,
        },
        include: {
          Position: true,
        },
      });

      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      return this.generateTokens({
        userId: user.id,
        teamId: user.Position.teamId,
      });
    } catch (e) {
      console.error(e);
    }
  }

  async me(userId: string, req?: Request): Promise<Partial<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          idamanId: true,
          webAuthnId: true,
          photoUrl: true,
          Position: { select: { name: true, Team: true } },
          positionId: true,
        },
      });

      await this.prisma.userLog.create({
        data: {
          userId: userId,
          endpoint: 'me',
          ip: req?.ip,
          userAgent: req?.headers['user-agent'],
        },
      });

      return user;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // ✅ Step 1: create QR token
  async createQrTokenForUser(userId: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 1000 * 5); // 1 menit

    await this.prisma.qrLoginToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return {
      token,
      qrUrl: `${process.env.FRONTEND_URL}/auth/qr/verify?token=${token}`,
      expiresAt,
    };
  }

  // ✅ Step 2: approve QR token (mobile)
  async verifyQrToken(token: string) {
    const qr = await this.prisma.qrLoginToken.findUnique({ where: { token } });
    if (!qr) throw new BadRequestException('QR not found');
    if (qr.status !== 'PENDING') throw new BadRequestException('Already used');
    if (qr.expiresAt < new Date()) throw new BadRequestException('Expired');

    const user = await this.prisma.user.findUnique({
      where: { id: qr.userId },
      include: {
        Position: {
          include: {
            Team: true,
          },
        },
      },
    });

    // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for user id: ${qr.userId}`);
    }

    // If pending status
    if (user.status === 'pending') {
      throw new NotFoundException(`Please ask your manager approval!`);
    }

    // If pending status
    if (user.idamanId !== null && user.Position === null) {
      throw new UnauthorizedException(
        `There is something wrong with your Idaman configuration! Make sure your HC has already assigned your HRIS correctly or contact IT.`
      );
    }

    const isVerified = true;
    const accessToken = this.generateTokens({
      userId: user.id,
      teamId: user.Position.teamId,
      isVerified,
    });

    const modUser: Partial<UserEntity> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.Position.teamId,
      photoUrl: user.photoUrl,
      positionId: user.positionId,
      Position: user.Position,
      idamanId: user.idamanId,
      webAuthnId: user.webAuthnId,
      isVerified,
    };

    await this.prisma.qrLoginToken.update({
      where: { token },
      data: { status: 'USED', usedAt: new Date() },
    });

    // Step 3: Generate a JWT containing the user's ID and return it
    return { status: 'APPROVED', ...accessToken, user: modUser };
  }

  // ✅ Step 3: browser polling
  async checkQrStatus(token: string) {
    const qr = await this.prisma.qrLoginToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!qr) throw new BadRequestException('QR not found');
    if (qr.expiresAt < new Date()) {
      await this.prisma.qrLoginToken.update({
        where: { token },
        data: { status: 'EXPIRED' },
      });
      return { status: 'EXPIRED' };
    }

    // Jika QR sudah di-approve oleh user mobile
    // if (qr.status === 'APPROVED' && qr.userId) {
    //   const jwt = this.generateAccessToken({ userId: qr.userId }); // ✅ pakai helper-mu

    //   await this.prisma.qrLoginToken.update({
    //     where: { token },
    //     data: { status: 'USED', usedAt: new Date() },
    //   });

    //   return { status: 'APPROVED', jwt };
    // }

    return { status: qr.status };
  }
}

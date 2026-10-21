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
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private resetOtpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService
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
        internProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.role === 'PESERTA') {
      const intern = user.internProfile;
      const now = new Date();
      let isDurationExpired = false;
      if (intern?.endDate) {
        const end = new Date(intern.endDate);
        if (end.getHours() === 0 && end.getMinutes() === 0) {
          end.setHours(23, 59, 59, 999);
        }
        isDurationExpired = now > end;
      }

      if (isDurationExpired || user.status === 'banned') {
        if (user.status !== 'banned') {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { status: 'banned' },
          });
          try {
            await this.mailService.sendInternshipExpiredEmail(user.email, user.name);
          } catch (mailErr) {
            console.error('Failed to send expiration email to intern:', user.email, mailErr);
          }
        }
        throw new UnauthorizedException(
          'Akun Anda telah expired karena masa magang telah berakhir. Akses ke portal magang telah dinonaktifkan secara otomatis. Apabila Anda membutuhkan informasi lebih lanjut mengenai berkas, sertifikat, atau proses perpanjangan, silakan hubungi tim Human Capital melalui email: hr.lubricants@pertamina.com.'
        );
      }
    }

    if (user.status === 'banned') {
      throw new UnauthorizedException(
        'Akun Anda telah dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com'
      );
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
    if (payload.startDate && payload.endDate) {
      const startDate = new Date(payload.startDate);
      const endDate = new Date(payload.endDate);
      const maxEndDate = new Date(startDate);
      maxEndDate.setMonth(maxEndDate.getMonth() + 6);

      if (endDate > maxEndDate) {
        throw new BadRequestException('Durasi magang tidak boleh lebih dari 6 bulan dari tanggal mulai');
      }
    }

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
            mentorProfileId: payload.mentorProfileId || null,
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
          internProfile: true,
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

      // Regulasi durasi magang role peserta
      if (user.role === 'PESERTA') {
        const intern = user.internProfile;
        const now = new Date();
        let isDurationExpired = false;
        if (intern?.endDate) {
          const end = new Date(intern.endDate);
          if (end.getHours() === 0 && end.getMinutes() === 0) {
            end.setHours(23, 59, 59, 999);
          }
          isDurationExpired = now > end;
        }

        if (isDurationExpired || user.status === 'banned') {
          // Jika status di DB belum banned, otomatis jadikan tidak aktif (banned) dan kirim email pemberitahuan
          if (user.status !== 'banned') {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { status: 'banned' },
            });
            try {
              await this.mailService.sendInternshipExpiredEmail(user.email, user.name);
            } catch (mailErr) {
              console.error('Failed to send expiration email to intern:', user.email, mailErr);
            }
          }

          throw new UnauthorizedException(
            'Akun Anda telah expired karena masa magang telah berakhir. Akses ke portal magang telah dinonaktifkan secara otomatis. Apabila Anda membutuhkan informasi lebih lanjut mengenai berkas, sertifikat, atau proses perpanjangan, silakan hubungi tim Human Capital melalui email: hr.lubricants@pertamina.com.'
          );
        }
      }

      // Jika user status banned untuk non-peserta
      if (user.status === 'banned') {
        throw new UnauthorizedException(
          'Akun Anda telah dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com'
        );
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
          internProfile: true,
        },
      });

      // If no user is found, throw an error
      if (!user) {
        throw new NotFoundException(`No user found for id: ${webAuthnId}`);
      }

      if (user.role === 'PESERTA') {
        const intern = user.internProfile;
        const now = new Date();
        let isDurationExpired = false;
        if (intern?.endDate) {
          const end = new Date(intern.endDate);
          if (end.getHours() === 0 && end.getMinutes() === 0) {
            end.setHours(23, 59, 59, 999);
          }
          isDurationExpired = now > end;
        }

        if (isDurationExpired || user.status === 'banned') {
          if (user.status !== 'banned') {
            await this.prisma.user.update({
              where: { id: user.id },
              data: { status: 'banned' },
            });
            try {
              await this.mailService.sendInternshipExpiredEmail(user.email, user.name);
            } catch (mailErr) {
              console.error('Failed to send expiration email to intern:', user.email, mailErr);
            }
          }
          throw new UnauthorizedException(
            'Akun Anda telah expired karena masa magang telah berakhir. Akses ke portal magang telah dinonaktifkan secara otomatis. Apabila Anda membutuhkan informasi lebih lanjut mengenai berkas, sertifikat, atau proses perpanjangan, silakan hubungi tim Human Capital melalui email: hr.lubricants@pertamina.com.'
          );
        }
      }

      if (user.status === 'banned') {
        throw new UnauthorizedException(
          'Akun Anda telah dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com'
        );
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

  async sendResetPasswordOtp(email: string): Promise<{ message: string; expiresInSeconds: number }> {
    if (!email) {
      throw new BadRequestException('Alamat email wajib diisi');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException(`Akun dengan email ${cleanEmail} tidak ditemukan`);
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.resetOtpStore.set(cleanEmail, {
      otp,
      expiresAt,
      attempts: 0,
    });

    console.log(`🔑 [FORGOT-PASSWORD] Generated OTP for ${cleanEmail}: ${otp}`);

    try {
      await this.mailService.sendPasswordResetOTPEmail(cleanEmail, otp);
    } catch (err: any) {
      console.warn(
        `⚠️ [FORGOT-PASSWORD] Could not send email to ${cleanEmail}, but OTP is logged: ${otp}`,
        err?.message
      );
    }

    return {
      message: 'Kode verifikasi (OTP) telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.',
      expiresInSeconds: 600,
    };
  }

  async verifyResetPasswordOtp(
    email: string,
    otp: string
  ): Promise<{ message: string; valid: boolean }> {
    if (!email || !otp) {
      throw new BadRequestException('Email dan kode verifikasi wajib diisi');
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = this.resetOtpStore.get(cleanEmail);

    if (!record || record.expiresAt < Date.now()) {
      throw new BadRequestException(
        'Kode verifikasi tidak valid atau telah kedaluwarsa. Silakan minta kode baru.'
      );
    }

    if (record.attempts >= 5) {
      this.resetOtpStore.delete(cleanEmail);
      throw new BadRequestException(
        'Batas percobaan verifikasi terlampaui. Silakan minta kode verifikasi baru.'
      );
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      throw new BadRequestException(
        remaining > 0
          ? `Kode verifikasi salah. Sisa kesempatan: ${remaining} kali.`
          : 'Batas percobaan terlampaui. Silakan minta kode verifikasi baru.'
      );
    }

    return {
      message: 'Kode verifikasi berhasil divalidasi',
      valid: true,
    };
  }

  async resetPassword(email: string, otp: string, newPw: string): Promise<{ message: string }> {
    if (!email || !newPw) {
      throw new BadRequestException('Email dan kata sandi baru wajib diisi');
    }

    if (!otp) {
      throw new BadRequestException('Kode verifikasi OTP wajib diisi untuk keamanan akun');
    }

    const cleanEmail = email.trim().toLowerCase();
    const record = this.resetOtpStore.get(cleanEmail);

    if (!record || record.expiresAt < Date.now()) {
      throw new BadRequestException(
        'Kode verifikasi tidak valid atau telah kedaluwarsa. Silakan minta kode verifikasi baru.'
      );
    }

    if (record.attempts >= 5) {
      this.resetOtpStore.delete(cleanEmail);
      throw new BadRequestException(
        'Batas percobaan terlampaui. Silakan minta kode verifikasi baru.'
      );
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      throw new BadRequestException('Kode verifikasi yang Anda masukkan tidak sesuai');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new NotFoundException(`Akun dengan email ${cleanEmail} tidak ditemukan`);
    }

    if (newPw.length < 8 || newPw.length > 32 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(newPw)) {
      throw new BadRequestException(
        'Kata sandi harus 8-32 karakter dan mengandung kombinasi huruf dan angka'
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(newPw);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate OTP after success
    this.resetOtpStore.delete(cleanEmail);

    return { message: 'Kata sandi berhasil diperbarui' };
  }

  async createPassword(email: string, newPw: string): Promise<TokenEntity> {
    const hashedPassword = await this.passwordService.hashPassword(`${newPw}`);

    try {
      const user = await this.prisma.user.update({
        where: { email: email.toLowerCase() },
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
      throw e;
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
          phone: true,
          jobTitle: true,
          status: true,
          Position: { select: { name: true, Team: true } },
          positionId: true,
          employeeProfile: true,
          internProfile: {
            include: {
              evaluation: true,
              mentor: {
                include: {
                  user: { select: { name: true, email: true, employeeProfile: true } },
                },
              },
            },
          },
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
        internProfile: true,
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

    if (user.role === 'PESERTA') {
      const intern = user.internProfile;
      const now = new Date();
      let isDurationExpired = false;
      if (intern?.endDate) {
        const end = new Date(intern.endDate);
        if (end.getHours() === 0 && end.getMinutes() === 0) {
          end.setHours(23, 59, 59, 999);
        }
        isDurationExpired = now > end;
      }

      if (isDurationExpired || user.status === 'banned') {
        if (user.status !== 'banned') {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { status: 'banned' },
          });
          try {
            await this.mailService.sendInternshipExpiredEmail(user.email, user.name);
          } catch (mailErr) {
            console.error('Failed to send expiration email to intern:', user.email, mailErr);
          }
        }
        throw new UnauthorizedException(
          'Akun Anda telah expired karena masa magang telah berakhir. Akses ke portal magang telah dinonaktifkan secara otomatis. Apabila Anda membutuhkan informasi lebih lanjut mengenai berkas, sertifikat, atau proses perpanjangan, silakan hubungi tim Human Capital melalui email: hr.lubricants@pertamina.com.'
        );
      }
    }

    if (user.status === 'banned') {
      throw new UnauthorizedException(
        'Akun Anda telah dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com'
      );
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

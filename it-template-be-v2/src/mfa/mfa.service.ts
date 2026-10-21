import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';
import { BadRequestError } from 'passport-headerapikey';
import * as QRCode from 'qrcode';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import CryptoService from './crypto.service';
import { UserInfoDto } from './dto/user-info.dto';
import { QrGeneratedEntity } from './entities/qr-generated.entity';
import { UserStatusEntity } from './entities/user-status.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class MfaService {
  private numberOfBytes: number = 20;
  private issuer: string = 'POST_IT';
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private configService: ConfigService,
    private mailService: MailService,
    public cryptoService: CryptoService
  ) {}

  public async getOtpSecretById(id: string, encryptionKey: string): Promise<string> {
    try {
      const record = await this.prisma.user.findUnique({
        where: { email: id },
      });

      if (!record || !record.encryptedSecret) {
        throw new NotFoundException('MFA record not found');
      }

      // Check if it's email MFA (should not be used for validation, but handle gracefully)
      if (
        record.encryptedSecret.startsWith('EMAIL_OTP:') ||
        record.encryptedSecret.includes('EMAIL_MFA_ENABLED')
      ) {
        throw new BadRequestError('Email MFA does not use secret');
      }

      const secret: string = this.cryptoService.decrypt(record.encryptedSecret, encryptionKey);

      return secret;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async encriptData(data: string, key: string) {
    try {
      const secret = this.cryptoService.encryptB64(data, key);
      return secret;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async decryptData(secret: string, key: string) {
    try {
      const data = this.cryptoService.decryptB64(secret, key);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ready
  public async getMfaRecordById(email: string): Promise<UserStatusEntity> {
    try {
      const record = await this.prisma.user.findUnique({
        where: { email: email },
        include: { internProfile: true },
      });
      if (!record) {
        throw new NotFoundException();
      }

      if (record.role === 'PESERTA') {
        const intern = record.internProfile;
        const now = new Date();
        let isDurationExpired = false;
        if (intern?.endDate) {
          const end = new Date(intern.endDate);
          if (end.getHours() === 0 && end.getMinutes() === 0) {
            end.setHours(23, 59, 59, 999);
          }
          isDurationExpired = now > end;
        }

        if (isDurationExpired || record.status === 'banned') {
          if (record.status !== 'banned') {
            await this.prisma.user.update({
              where: { id: record.id },
              data: { status: 'banned' },
            });
            try {
              await this.mailService.sendInternshipExpiredEmail(record.email, record.name);
            } catch (mailErr) {
              console.error('Failed to send expiration email to intern:', record.email, mailErr);
            }
          }
          throw new UnauthorizedException(
            'Akun Anda telah expired karena masa magang telah berakhir. Akses ke portal magang telah dinonaktifkan secara otomatis. Apabila Anda membutuhkan informasi lebih lanjut mengenai berkas, sertifikat, atau proses perpanjangan, silakan hubungi tim Human Capital melalui email: hr.lubricants@pertamina.com.'
          );
        }
      }

      if (record.status === 'banned') {
        throw new UnauthorizedException(
          'Akun Anda telah dinonaktifkan. Silakan hubungi hr.lubricants@pertamina.com'
        );
      }

      const { id, encryptedSecret } = record;

      return {
        id,
        encryptedSecret,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // generate
  public async generateQRcode(id: string): Promise<QrGeneratedEntity> {
    try {
      const secret: string = authenticator.generateSecret(this.numberOfBytes);
      const qrUri: string = authenticator.keyuri(id, this.issuer, secret);
      const qrcode: string = await QRCode.toDataURL(qrUri);
      const data: QrGeneratedEntity = {
        secret,
        qrcode,
      };
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // verify
  public verifyTOTP(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
  }

  public async generateBackupCode(): Promise<string> {
    return this.cryptoService.getRandomString();
  }

  public async saveMfaRecord(record: UserInfoDto, encryptionKey: string): Promise<boolean> {
    try {
      const { id, secret, code } = record;
      const encryptedSecret = this.cryptoService.encrypt(secret, encryptionKey);
      const hashBackupCode = this.cryptoService.getHashString(code);

      const payload: Prisma.UserUpdateInput = {
        encryptedSecret,
        hashBackupCode,
      };

      await this.prisma.user.update({
        where: { email: id },
        data: payload,
      });
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async reset(id: string, code: string): Promise<boolean> {
    try {
      const hashBackupCode = this.cryptoService.getHashString(code);
      const deletedCount = await this.prisma.user.update({
        where: { email: id, hashBackupCode },
        data: { hashBackupCode: null, encryptedSecret: null },
      });

      return !!deletedCount;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError('Reset Failed!');
      }
      console.error(error);
      throw error;
    }
  }

  public async adminReset(id: string): Promise<boolean> {
    try {
      const deletedCount = await this.prisma.user.update({
        where: { email: id },
        data: { hashBackupCode: null, encryptedSecret: null },
      });

      return !!deletedCount;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestError('Reset Failed!');
      }
      console.error(error);
      throw error;
    }
  }

  public async resetByAdmin(adminUserId: string, email: string) {
    try {
      const check = await this.prisma.user.findUnique({
        where: { id: adminUserId },
      });

      if (check.role !== 'SUPERSAIYAN') {
        throw new UnauthorizedException('You are not admin!');
      }

      return this.prisma.user.update({
        where: { email: email },
        data: {
          hashBackupCode: null,
          encryptedSecret: null,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async createVerifiedToken(email: string) {
    try {
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

      const isVerified = user.idamanId !== null ? true : user.encryptedSecret ? true : false;
      const accessToken = this.authService.generateTokens({
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

      return { ...accessToken, user: modUser };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Get MFA type from environment (default: authenticator)
  public getMfaType(): 'authenticator' | 'email' {
    const mfaType = this.configService.get<string>('MFA_TYPE')?.toLowerCase();
    return mfaType === 'email' ? 'email' : 'authenticator';
  }

  // Generate OTP for email MFA (6-digit numeric code)
  public generateEmailOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email with duplicate prevention
  public async sendEmailOTP(email: string): Promise<{ otp: string; expiresAt: Date }> {
    try {
      // Check if there's an existing OTP that was sent recently (within last 10 seconds)
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user?.encryptedSecret && user.encryptedSecret.startsWith('EMAIL_OTP:')) {
        // Format: "EMAIL_OTP:{encryptedOTP}|{sentAtISO}|{expiresAtISO}"
        const afterPrefix = user.encryptedSecret.substring('EMAIL_OTP:'.length);

        // Use | delimiter to avoid conflicts with : in ISO strings
        if (afterPrefix.includes('|')) {
          const parts = afterPrefix.split('|');
          if (parts.length >= 3) {
            const sentAtISO = parts[1];
            const sentAt = new Date(sentAtISO);
            const now = new Date();
            const timeSinceLastSend = now.getTime() - sentAt.getTime();

            // If OTP was sent less than 10 seconds ago, prevent duplicate send
            if (timeSinceLastSend < 10000) {
              console.log(
                `OTP was recently sent to ${email} ${Math.round(timeSinceLastSend / 1000)}s ago, preventing duplicate send`
              );
              throw new Error(
                'OTP baru saja dikirim. Silakan tunggu beberapa detik sebelum mengirim ulang.'
              );
            }
          }
        }
      }

      const otp = this.generateEmailOTP();
      const sentAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

      // Store OTP in database (encrypted)
      // This will overwrite EMAIL_MFA_ENABLED if user has already setup email MFA
      const encryptedOTP = this.cryptoService.encrypt(
        otp,
        this.configService.get<string>('ENCRYPTION_KEY') || ''
      );

      console.log(`Sending OTP to ${email}, storing in database...`);
      await this.prisma.user.update({
        where: { email },
        data: {
          // Store encrypted OTP, sent timestamp, and expiry
          // Format: "EMAIL_OTP:{encryptedOTP}|{sentAtISO}|{expiresAtISO}"
          // Using | delimiter to avoid conflicts with : in ISO strings
          // This will overwrite any existing encryptedSecret (including EMAIL_MFA_ENABLED)
          encryptedSecret: `EMAIL_OTP:${encryptedOTP}|${sentAt.toISOString()}|${expiresAt.toISOString()}`,
        },
      });
      console.log(`OTP stored successfully for ${email}`);
      console.log(`[DEV] Generated OTP: ${otp}`);

      // Send OTP via email with graceful fallback if SMTP is slow/interrupted
      try {
        await this.mailService.sendOTPEmail(email, otp);
        console.log(`OTP email sent successfully to ${email}`);
      } catch (mailError: any) {
        console.warn(
          `⚠️ [MFA] Tidak dapat mengirim email OTP ke ${email} (${mailError?.message || mailError}). Kode OTP tetap aktif di database & log: ${otp}`
        );
      }

      return { otp, expiresAt };
    } catch (error) {
      console.error('Failed to generate/send email OTP:', error);
      throw error;
    }
  }

  // Verify email OTP
  public async verifyEmailOTP(email: string, otp: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.encryptedSecret) {
        console.log('User or encryptedSecret not found');
        return false;
      }

      // Check if it's email OTP format (for validation/login)
      if (user.encryptedSecret.startsWith('EMAIL_OTP:')) {
        // Format: "EMAIL_OTP:{encryptedOTP}|{sentAtISO}|{expiresAtISO}"
        // Using | delimiter to avoid conflicts with : in ISO strings
        const afterPrefix = user.encryptedSecret.substring('EMAIL_OTP:'.length);
        const parts = afterPrefix.split('|');

        if (parts.length < 3) {
          console.log('Invalid EMAIL_OTP format, parts length:', parts.length);
          return false;
        }

        const encryptedOTP = parts[0];
        const expiresAtISO = parts[2];
        const expiresAt = new Date(expiresAtISO);

        // Check if OTP has expired
        if (new Date() > expiresAt) {
          console.log('OTP has expired. Expires at:', expiresAt, 'Current time:', new Date());
          return false;
        }

        // Decrypt and verify OTP
        try {
          const decryptedOTP = this.cryptoService.decrypt(
            encryptedOTP,
            this.configService.get<string>('ENCRYPTION_KEY') || ''
          );
          const isValid = decryptedOTP === otp;
          console.log(
            `OTP verification: ${isValid ? 'VALID' : 'INVALID'}, expected: ${decryptedOTP}, received: ${otp}`
          );
          return isValid;
        } catch (decryptError) {
          console.error('Failed to decrypt OTP:', decryptError);
          return false;
        }
      }

      // If encryptedSecret doesn't start with EMAIL_OTP:, check if it's EMAIL_MFA_ENABLED (encrypted)
      // This means user has already setup email MFA, but OTP hasn't been sent yet for validation
      try {
        const decrypted = this.cryptoService.decrypt(
          user.encryptedSecret,
          this.configService.get<string>('ENCRYPTION_KEY') || ''
        );
        if (decrypted === 'EMAIL_MFA_ENABLED') {
          console.log('User has email MFA enabled, but no OTP found. OTP should be sent first.');
          return false;
        }
      } catch {
        // If decryption fails, it might be authenticator MFA or invalid format
        console.log(
          'Failed to decrypt encryptedSecret, might be authenticator MFA or invalid format'
        );
      }

      return false;
    } catch (error) {
      console.error('Failed to verify email OTP:', error);
      return false;
    }
  }

  // Save email MFA record (after successful verification)
  public async saveEmailMfaRecord(email: string, encryptionKey: string): Promise<string> {
    try {
      // For email MFA, we don't need a secret like authenticator
      // We'll use a special marker to indicate email MFA is enabled
      const encryptedSecret = this.cryptoService.encrypt('EMAIL_MFA_ENABLED', encryptionKey);
      const code = await this.generateBackupCode();
      const hashBackupCode = this.cryptoService.getHashString(code);

      await this.prisma.user.update({
        where: { email },
        data: {
          encryptedSecret,
          hashBackupCode,
        },
      });

      return code;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

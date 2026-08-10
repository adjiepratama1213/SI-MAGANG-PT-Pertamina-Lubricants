import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { TokenEntity } from 'src/auth/entities/token.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateMfaDto } from './dto/create-mfa.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { QrGeneratedEntity } from './entities/qr-generated.entity';
import { UserStatusEntity } from './entities/user-status.entity';
import { MfaService } from './mfa.service';

@ApiTags('Multi Factor Auth')
@Controller('mfa')
export class MfaController {
  private readonly logger = new Logger(MfaController.name);

  private readonly ENCRYPTION_KEY: string;

  constructor(
    private configService: ConfigService,
    private readonly mfaService: MfaService
  ) {
    this.ENCRYPTION_KEY = this.configService.get<string>('ENCRYPTION_KEY');
  }

  @Post('ready')
  @ApiExcludeEndpoint()
  async ready(
    @Body() body: CreateMfaDto
    // @Next() next: NextFunction,
  ): Promise<UserStatusEntity> {
    try {
      if (!body.id) {
        throw new BadRequestException();
      }
      const result = await this.mfaService.getMfaRecordById(body.id);
      return {
        ...result,
        mfaType: this.mfaService.getMfaType(),
      };
    } catch (error) {
      console.error(error);
      // next(error);
      throw error;
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generate(
    @Body() body: CreateMfaDto
    // @Next() next: NextFunction,
  ): Promise<QrGeneratedEntity | { type: 'email'; message: string }> {
    try {
      this.logger.log(`Generate MFA request for: ${body.id}`);

      if (!body.id) {
        this.logger.warn('Generate MFA request missing id');
        throw new BadRequestException('Email is required');
      }

      const mfaType = this.mfaService.getMfaType();
      this.logger.log(`MFA type: ${mfaType}`);

      if (mfaType === 'email') {
        // For email MFA, return type indicator
        this.logger.log(`Returning email MFA type indicator for ${body.id}`);
        return {
          type: 'email',
          message: 'OTP akan dikirim ke email Anda',
        };
      }

      this.logger.log(`Generating QR code for ${body.id}`);
      const generated = await this.mfaService.generateQRcode(body.id);
      this.logger.log(`QR code generated successfully for ${body.id}`);

      return generated;
    } catch (error) {
      this.logger.error(`Generate MFA error for ${body?.id}:`, error);
      throw error;
    }
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async verify(@Body() data: UserInfoDto) {
    const { code, secret, id } = data;
    try {
      if (!code || !id) {
        throw new BadRequestException();
      }
      if (!this.ENCRYPTION_KEY) {
        throw new InternalServerErrorException();
      }

      const mfaType = this.mfaService.getMfaType();

      if (mfaType === 'email') {
        // For email MFA, verify OTP from email
        const isVerified: boolean = await this.mfaService.verifyEmailOTP(id, code);

        if (isVerified) {
          const backupCode: string = await this.mfaService.saveEmailMfaRecord(
            id,
            this.ENCRYPTION_KEY
          );
          return { code: backupCode, isActive: true };
        }
        throw new UnauthorizedException('Invalid OTP');
      }

      // For authenticator MFA
      if (!secret) {
        throw new BadRequestException();
      }

      const isVerified: boolean = this.mfaService.verifyTOTP(secret, code);

      if (isVerified) {
        const backupCode: string = await this.mfaService.generateBackupCode();
        const record: UserInfoDto = {
          code: backupCode,
          secret,
          id,
        };
        const isActive: boolean = await this.mfaService.saveMfaRecord(record, this.ENCRYPTION_KEY);

        return { code: backupCode, isActive };
      }
      throw new UnauthorizedException('Invalid OTP');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async validate(@Body() data: Partial<UserInfoDto>): Promise<TokenEntity> {
    try {
      this.logger.log(
        `Validate MFA request received: ${JSON.stringify({ id: data.id, codeLength: data.code?.length })}`
      );

      const { code, id } = data;

      if (!code || !id) {
        this.logger.warn(
          `Validate MFA request missing required fields: code=${!!code}, id=${!!id}`
        );
        throw new BadRequestException('Code and email are required');
      }
      if (!this.ENCRYPTION_KEY) {
        throw new InternalServerErrorException('Encryption key not configured');
      }

      const mfaType = this.mfaService.getMfaType();
      this.logger.log(`Validating MFA for ${id}, type: ${mfaType}, code length: ${code.length}`);

      let verified = false;

      if (mfaType === 'email') {
        // For email MFA, verify OTP from email
        this.logger.log(`Verifying email OTP for ${id}`);
        verified = await this.mfaService.verifyEmailOTP(id, code);
        this.logger.log(`Email OTP verification result: ${verified}`);
      } else {
        // For authenticator MFA
        this.logger.log(`Verifying authenticator OTP for ${id}`);
        const secret: string = await this.mfaService.getOtpSecretById(id, this.ENCRYPTION_KEY);
        verified = this.mfaService.verifyTOTP(secret, code);
        this.logger.log(`Authenticator OTP verification result: ${verified}`);
      }

      if (!verified) {
        this.logger.warn(`MFA validation failed for ${id}, type: ${mfaType}`);
        throw new BadRequestException('Code invalid!');
      }

      this.logger.log(`MFA validation successful for ${id}`);
      return this.mfaService.createVerifiedToken(id);
    } catch (error) {
      const errorId = data?.id || 'unknown';
      this.logger.error(`MFA validation error for ${errorId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async reset(
    @Body() data: Partial<UserInfoDto>
    // @Next() next: NextFunction
  ) {
    try {
      const { code, id } = data;
      if (!code || !id) {
        throw new BadRequestException();
      }

      const isReset = await this.mfaService.reset(id, code);

      return isReset;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeSecretByAdmin(@Body() data: Partial<UserInfoDto>) {
    try {
      const { id } = data;
      if (!id) {
        throw new BadRequestException();
      }

      const isReset = await this.mfaService.adminReset(id);

      return isReset;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('reset/admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async resetByAdmin(@Body() data: { adminUserId: string; email: string }) {
    try {
      const { adminUserId, email } = data;
      return this.mfaService.resetByAdmin(adminUserId, email);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('encrypt')
  @ApiExcludeEndpoint()
  async encryptData(@Body() data: { value: string }) {
    try {
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
      return this.mfaService.encriptData(data.value, ENCRYPTION_KEY);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('decrypt')
  @ApiExcludeEndpoint()
  async decryptData(@Body() data: { secret: string }) {
    try {
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
      return this.mfaService.decryptData(data.secret, ENCRYPTION_KEY);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('send-otp-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendOTPEmail(@Body() data: CreateMfaDto) {
    try {
      if (!data.id) {
        throw new BadRequestException('Email is required');
      }

      const result = await this.mfaService.sendEmailOTP(data.id);
      return {
        message: 'OTP telah dikirim ke email Anda',
        expiresAt: result.expiresAt,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

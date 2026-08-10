import { Body, Controller, Get, Param, Patch, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { TokenEntity } from './entities/token.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WebAuthnDto } from './dto/webauthn.dto';
import { MailService } from 'src/mail/mail.service';
import { TokenDto } from './dto/token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly mailService: MailService,
    private readonly authService: AuthService
  ) {}

  // Register
  @Post('register')
  async register(@Body() data: SignUpDto) {
    data.email = data.email.toLowerCase();
    const createdUser = await this.authService.createUser(data);
    if (data.status !== 'active') {
      // kirim email
      await this.mailService.sendVerificationEmail(createdUser.email, createdUser.id);
    }
    return createdUser;
  }

  @Post('login')
  @ApiOkResponse({ type: TokenEntity })
  async login(
    @Body()
    { email, password }: LoginDto
  ): Promise<TokenEntity> {
    return this.authService.login(email.toLowerCase(), password);
  }

  //Get / logout
  @Get('logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'The user session has ended' };
  }

  @Patch('verify-email/:id')
  async verifyEmail(@Param('id') id: string, @Body() updatePasswordDto: { email: string }) {
    return this.authService.verifyEmail(id, updatePasswordDto.email);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@Body('userId') userId: string, @Request() req: ExpressRequest) {
    return this.authService.me(userId, req);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: { userId: string; oldPassword: string; newPassword: string }
  ) {
    return this.authService.updatePassword(
      updatePasswordDto.userId !== '' ? updatePasswordDto.userId : req.user.id,
      updatePasswordDto.oldPassword,
      updatePasswordDto.newPassword
    );
  }

  @Post('webauthn')
  @ApiOkResponse({ type: TokenEntity })
  async webAuthn(
    @Body()
    { webAuthnId }: WebAuthnDto,
    @Request() req: ExpressRequest
  ): Promise<TokenEntity> {
    return this.authService.webAuthn(webAuthnId, req);
  }

  // ✅ QR Step 1: Create QR token
  @Post('qr/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Generate QR token' })
  async createQrToken(@Req() req) {
    const userId = req.user.id;
    return this.authService.createQrTokenForUser(userId);
  }

  // ✅ QR Step 2: Approve QR token (mobile)
  @Post('qr/verify')
  @ApiOkResponse({ description: 'Approve QR token' })
  async verifyQrToken(@Body() data: TokenDto) {
    return this.authService.verifyQrToken(data.token);
  }

  // ✅ QR Step 3: Polling QR status (browser)
  @Post('qr/status')
  @ApiOkResponse({ description: 'Check QR token status' })
  async checkQrStatus(@Body() data: TokenDto) {
    return this.authService.checkQrStatus(data.token);
  }
}

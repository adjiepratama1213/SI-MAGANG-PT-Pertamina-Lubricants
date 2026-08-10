import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailDto } from './dto/mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Verification
  @Post('sent-verification')
  async register(@Body() data: MailDto) {
    console.log(`🚀 MailService constructor triggered for ${data.email} with id ${data.id}`);
    return await this.mailService.sendVerificationEmail(data.email, data.id);
  }
}

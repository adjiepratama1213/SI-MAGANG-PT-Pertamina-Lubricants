import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const host = process.env.MAILTRAP_HOST;
    const port = Number(process.env.MAILTRAP_PORT);
    const secure = port === 465; // TLS only for 465

    console.log(`📡 Configuring SMTP...`);
    console.log(`➡️ Host: ${host}`);
    console.log(`➡️ Port: ${port}`);
    console.log(`➡️ Secure: ${secure}`);
    console.log(`➡️ User: ${process.env.MAILTRAP_USER}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // biarkan cert wildcard jalan
      },
      logger: true,
      debug: true,
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    console.log(`📡 func_sendVerificationEmail Configuring SMTP...`);
    console.log(`➡️ func_sendVerificationEmail Host: ${process.env.MAILTRAP_HOST}`);
    console.log(`➡️ func_sendVerificationEmail Port: ${process.env.MAILTRAP_PORT}`);
    console.log(
      `➡️ func_sendVerificationEmail Secure: ${Number(process.env.MAILTRAP_PORT) === 465}`
    );
    console.log(`➡️ func_sendVerificationEmail User: ${process.env.MAILTRAP_USER}`);

    try {
      const info = await this.transporter.sendMail({
        from: `"No Reply POST IT" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'Pertamina On Single Tab - Email Verification',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
            <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
              <h2 style="color: #333;">Welcome to POST! 🎉</h2>
              <p>Thank you for signing up. Click the button below to verify:</p>
              <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Your Account</a>
            </div>
          </div>`,
      });

      console.log(`✅ Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send verification email', error);
      throw error;
    }
  }

  async sendOTPEmail(to: string, otp: string) {
    console.log(`📡 Sent OTP Email Configuring SMTP...`);
    console.log(`➡️ Sent OTP Email Host: ${process.env.MAILTRAP_HOST}`);
    console.log(`➡️ Sent OTP Email Port: ${process.env.MAILTRAP_PORT}`);

    try {
      const info = await this.transporter.sendMail({
        from: `"No Reply POST IT" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'POST IT - Kode OTP Multi-Factor Authentication',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin: auto;">
              <h2 style="color: #3C6DB2; text-align: center;">Kode OTP POST IT</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Terima kasih telah menggunakan POST IT. Gunakan kode OTP berikut untuk menyelesaikan proses Multi-Factor Authentication:
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #3C6DB2; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <h1 style="color: #3C6DB2; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                <strong>Penting:</strong> Kode ini hanya berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                Jika Anda tidak meminta kode ini, abaikan email ini.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                Email ini dikirim secara otomatis oleh sistem POST IT. Mohon jangan membalas email ini.
              </p>
            </div>
          </div>`,
      });

      console.log(`✅ OTP email sent: ${info.messageId}`);
      console.log(`📟 Sent OTP Email: ${otp}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send OTP email', error);
      throw error;
    }
  }
}

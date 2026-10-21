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
      pool: true,
      maxConnections: 1,
      maxMessages: 10,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      logger: false,
      debug: false,
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
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Verifikasi Alamat Email',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #003882;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px; font-weight: 700;">Verifikasi Alamat Email Pendaftaran</h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 16px;">
                Terima kasih telah mendaftar di <strong>Portal Magang PT Pertamina Lubricants</strong>. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun pendaftaran:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #003882; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 12px rgba(0, 56, 130, 0.25);">
                  Verifikasi Akun Saya
                </a>
              </div>
              <p style="color: #64748b; font-size: 12.5px; line-height: 1.5; margin-top: 20px;">
                Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan membuka tautan berikut di peramban Anda:<br>
                <a href="${verificationLink}" style="color: #003882; word-break: break-all;">${verificationLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0; line-height: 1.6;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.<br>&copy; PT Pertamina Lubricants. All rights reserved.
              </p>
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
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Kode OTP Verifikasi Keamanan (MFA)',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #003882;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px; font-weight: 700;">Kode OTP Verifikasi Keamanan (MFA)</h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 16px;">
                Terima kasih telah menggunakan Portal Magang PT Pertamina Lubricants. Gunakan kode One-Time Password (OTP) berikut untuk menyelesaikan proses verifikasi <strong>Multi-Factor Authentication (MFA)</strong>:
              </p>
              <div style="background: linear-gradient(135deg, #F0F4FA 0%, #E8EEF8 100%); border: 2px dashed #003882; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 12px; text-transform: uppercase; color: #475569; letter-spacing: 1.5px; font-weight: 600; display: block; margin-bottom: 8px;">KODE VERIFIKASI (OTP)</span>
                <span style="color: #003882; font-size: 38px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', monospace; display: inline-block;">${otp}</span>
              </div>
              <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #991B1B; font-size: 13px; line-height: 1.5; margin: 0;">
                  <strong>Penting:</strong> Kode verifikasi ini hanya berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan PT Pertamina Lubricants.
                </p>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                Jika Anda tidak sedang melakukan verifikasi akun atau tidak meminta kode ini, silakan abaikan email ini atau segera hubungi tim administrator.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0; line-height: 1.6;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.<br>&copy; PT Pertamina Lubricants. All rights reserved.
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

  async sendPasswordResetOTPEmail(to: string, otp: string) {
    console.log(`📡 Sending Password Reset OTP Email to ${to}...`);
    try {
      const info = await this.transporter.sendMail({
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Kode Verifikasi Reset Kata Sandi',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #003882;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px; font-weight: 700;">Permintaan Atur Ulang Kata Sandi</h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 16px;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Gunakan kode verifikasi (OTP) berikut untuk melanjutkan:
              </p>
              <div style="background: linear-gradient(135deg, #F0F4FA 0%, #E8EEF8 100%); border: 2px dashed #003882; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 12px; text-transform: uppercase; color: #475569; letter-spacing: 1.5px; font-weight: 600; display: block; margin-bottom: 8px;">KODE VERIFIKASI (OTP)</span>
                <span style="color: #003882; font-size: 38px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', monospace; display: inline-block;">${otp}</span>
              </div>
              <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #991B1B; font-size: 13px; line-height: 1.5; margin: 0;">
                  <strong>Penting:</strong> Kode verifikasi ini berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan PT Pertamina Lubricants.
                </p>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan pesan email ini. Kata sandi akun Anda akan tetap aman.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.
              </p>
            </div>
          </div>`,
      });

      console.log(`✅ Reset password OTP email sent: ${info.messageId}`);
      console.log(`📟 Reset Password OTP for ${to}: ${otp}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send password reset OTP email:', error);
      throw error;
    }
  }

  async sendAcceptanceEmail(to: string) {
    console.log(`📡 Sent Acceptance Email Configuring SMTP...`);
    try {
      const loginLink = `${process.env.FRONTEND_URL}/auth/login`;
      const info = await this.transporter.sendMail({
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Selamat! Pendaftaran Magang Anda Diterima',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #16a34a;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 16px; background-color: #dcfce7; color: #15803d; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">
                  PENDAFTARAN DITERIMA 🎉
                </span>
              </div>
              <h3 style="color: #0f172a; font-size: 19px; margin-bottom: 12px; font-weight: 700; text-align: center;">
                Selamat! Anda Diterima Magang
              </h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Selamat! Pendaftaran magang Anda di <strong>PT Pertamina Lubricants</strong> telah berhasil disetujui oleh Administrator.
              </p>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 24px;">
                Silakan masuk ke Portal Magang untuk melihat informasi penempatan unit kerja dan jadwal pelaksanaan magang. Tim kami akan segera menugaskan Mentor profesional untuk membimbing Anda selama program berlangsung.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" style="display: inline-block; padding: 14px 32px; background-color: #003882; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 12px rgba(0, 56, 130, 0.25);">
                  Masuk ke Portal Magang
                </a>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0; line-height: 1.6;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.<br>&copy; PT Pertamina Lubricants. All rights reserved.
              </p>
            </div>
          </div>`,
      });
      console.log(`✅ Acceptance email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send acceptance email', error);
      throw error;
    }
  }

  async sendRejectionEmail(to: string) {
    console.log(`📡 Sent Rejection Email Configuring SMTP...`);
    try {
      const info = await this.transporter.sendMail({
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Pemberitahuan Status Pendaftaran Magang',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #64748b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px; font-weight: 700;">
                Pemberitahuan Status Pendaftaran
              </h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Terima kasih atas ketertarikan dan antusiasme Anda untuk bergabung dalam Program Magang di <strong>PT Pertamina Lubricants</strong>.
              </p>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Setelah melalui proses peninjauan berkas kualifikasi dan mempertimbangkan kuota yang tersedia di unit kerja terkait, mohon maaf saat ini pendaftaran Anda belum dapat kami terima.
              </p>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">
                Tetap semangat dalam menempuh studi dan semoga sukses dalam kesempatan-kesempatan berikutnya!
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0; line-height: 1.6;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.<br>&copy; PT Pertamina Lubricants. All rights reserved.
              </p>
            </div>
          </div>`,
      });
      console.log(`✅ Rejection email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send rejection email', error);
      throw error;
    }
  }

  async sendInternshipExpiredEmail(to: string, internName?: string) {
    console.log(`📡 Sent Internship Expired Email Configuring SMTP...`);
    try {
      const name = internName || 'Peserta Magang';
      const info = await this.transporter.sendMail({
        from: `"PT Pertamina Lubricants" <${process.env.MAILTRAP_SENDER}>`,
        to,
        subject: 'PT Pertamina Lubricants - Masa Magang Telah Berakhir',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f1f5f9;">
            <div style="max-width: 580px; background: #ffffff; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 56, 130, 0.08); margin: auto; border-top: 6px solid #ee2e24;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #003882; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PT PERTAMINA LUBRICANTS</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Portal Magang & PKL Resmi</p>
              </div>
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="display: inline-block; padding: 6px 16px; background-color: #fee2e2; color: #dc2626; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">
                  MASA MAGANG TELAH BERAKHIR
                </span>
              </div>
              <h3 style="color: #0f172a; font-size: 19px; margin-bottom: 12px; font-weight: 700; text-align: center;">
                Pemberitahuan Berakhirnya Periode Magang
              </h3>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Kami menginformasikan bahwa durasi magang Anda di <strong>PT Pertamina Lubricants</strong> telah resmi selesai atau habis. Sesuai dengan regulasi sistem yang berlaku, status akun peserta Anda saat ini telah otomatis menjadi <strong>Tidak Aktif (Expired)</strong>.
              </p>
              <p style="color: #334155; font-size: 14.5px; line-height: 1.6; margin-bottom: 14px;">
                Terima kasih atas kontribusi, kerja keras, dan dedikasi yang telah Anda berikan selama menjalani program magang bersama kami.
              </p>
              <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 24px 0;">
                <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 6px 0;">
                  Butuh Bantuan atau Informasi Perpanjangan?
                </p>
                <p style="color: #475569; font-size: 13.5px; margin: 0; line-height: 1.5;">
                  Apabila Anda memerlukan informasi lebih lanjut mengenai berkas akhir, sertifikat, atau perpanjangan, silakan kirimkan email ke:
                  <br>
                  <a href="mailto:hr.lubricants@pertamina.com" style="color: #003882; font-weight: 700; text-decoration: underline; font-size: 14px;">hr.lubricants@pertamina.com</a>
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;">
              <p style="color: #94a3b8; font-size: 11.5px; text-align: center; margin: 0; line-height: 1.6;">
                Email ini dikirim secara otomatis oleh Portal Magang PT Pertamina Lubricants. Harap tidak membalas email ini.<br>&copy; PT Pertamina Lubricants. All rights reserved.
              </p>
            </div>
          </div>`,
      });
      console.log(`✅ Internship expired email sent: ${info?.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Failed to send internship expired email', error);
    }
  }
}

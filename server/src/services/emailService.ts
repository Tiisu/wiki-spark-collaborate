import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Only create transporter if SMTP credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates for development
        }
      });

      // Verify SMTP connection on startup
      this.verifyConnection();
    } else {
      logger.warn('SMTP credentials not configured, email service will run in development mode');
      // Create a dummy transporter for development
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await this.transporter.verify();
        logger.info('SMTP connection verified successfully');
      }
    } catch (error) {
      logger.error('SMTP connection failed', { error });
      logger.warn('Email functionality will fall back to development mode');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('SMTP credentials not configured, using development mode');
        this.logEmailForDevelopment(options);
        return;
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@wikisparkcollab.org',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      logger.info(`Attempting to send email to ${options.to}`, {
        subject: options.subject,
        from: mailOptions.from
      });

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}`, {
        messageId: info.messageId,
        response: info.response
      });
    } catch (error) {
      logger.error('Failed to send email, falling back to development mode', {
        error: error instanceof Error ? error.message : error,
        to: options.to,
        subject: options.subject
      });

      // In development, log the email instead of failing
      if (process.env.NODE_ENV === 'development') {
        this.logEmailForDevelopment(options);
        return;
      }

      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private logEmailForDevelopment(options: EmailOptions): void {
    logger.info('=== EMAIL (Development Mode) ===');
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Text: ${options.text || 'No text content'}`);
    logger.info('=== END EMAIL ===');

    // Also log to console for easier debugging
    console.log('\n=== EMAIL (Development Mode) ===');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text || 'No text content'}`);
    console.log('=== END EMAIL ===\n');
  }



  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Wiki Spark Collaborate</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>We received a request to reset your password for your Wiki Spark Collaborate account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The Wiki Spark Collaborate Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email}. If you have any questions, please contact us at support@wikisparkcollab.org</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${firstName},
      
      We received a request to reset your password for your Wiki Spark Collaborate account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email.
      
      Best regards,
      The Wiki Spark Collaborate Team
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Wiki Spark Collaborate',
      html,
      text,
    });
  }


}

export const emailService = new EmailService();

import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { EmailTemplateData } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed:', error);
    }
  }

  private getWelcomeEmailTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to WikiWalkthrough</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WikiWalkthrough!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>Welcome to WikiWalkthrough, your gateway to contributing effectively to Wikipedia through structured learning paths, community collaboration, and expert mentorship.</p>
            <p>Your account has been successfully created and you can now access all features of our platform.</p>
            <p>Get started by exploring our learning paths and connecting with the community:</p>
            <a href="${data.loginUrl}" class="button">Start Learning</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy learning!</p>
            <p>The WikiWalkthrough Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WikiWalkthrough. All rights reserved.</p>
            <p>This email was sent to you because you registered for a WikiWalkthrough account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - WikiWalkthrough</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.firstName}!</h2>
            <p>We received a request to reset your password for your WikiWalkthrough account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            </div>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, never share this link with anyone.</p>
            <p>The WikiWalkthrough Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WikiWalkthrough. All rights reserved.</p>
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${data.resetUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(to: string, data: EmailTemplateData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Welcome to WikiWalkthrough!',
        html: this.getWelcomeEmailTemplate(data),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email to ${to}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, data: EmailTemplateData): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Reset Your Password - WikiWalkthrough',
        html: this.getPasswordResetEmailTemplate(data),
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to ${to}:`, error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Test Email - WikiWalkthrough',
        html: '<h1>Test Email</h1><p>This is a test email from WikiWalkthrough.</p>',
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Test email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send test email to ${to}:`, error);
      return false;
    }
  }
}

export default new EmailService();

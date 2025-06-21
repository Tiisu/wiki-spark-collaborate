import nodemailer from 'nodemailer';
import { ICertificate } from '../models/Certificate';
import User from '../models/User';
import Course from '../models/Course';
import logger from '../utils/logger';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface NotificationData {
  studentName: string;
  studentEmail: string;
  courseName: string;
  instructorName: string;
  verificationCode: string;
  certificateId: string;
  verificationUrl: string;
  downloadUrl: string;
  completionDate: Date;
  finalScore?: number;
}

class CertificateNotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send certificate issued notification email
  async sendCertificateIssuedEmail(certificate: ICertificate): Promise<void> {
    try {
      // Get user and course details
      const [user, course] = await Promise.all([
        User.findById(certificate.user),
        Course.findById(certificate.course)
      ]);

      if (!user || !course) {
        throw new Error('User or course not found');
      }

      const notificationData: NotificationData = {
        studentName: certificate.studentName,
        studentEmail: certificate.studentEmail,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        verificationCode: certificate.verificationCode,
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verification.verificationUrl,
        downloadUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/${certificate._id}/download`,
        completionDate: certificate.completionDate,
        finalScore: certificate.finalScore
      };

      const emailTemplate = this.generateCertificateEmailTemplate(notificationData);

      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@wikiwalkthrough.com',
        to: certificate.studentEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      logger.info(`Certificate notification email sent to ${certificate.studentEmail} for certificate ${certificate.certificateId}`);
    } catch (error) {
      logger.error('Failed to send certificate notification email:', error);
      throw error;
    }
  }

  // Generate certificate email template
  private generateCertificateEmailTemplate(data: NotificationData): EmailTemplate {
    const subject = `🎓 Congratulations! Your WikiWalkthrough Certificate is Ready`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Issued - WikiWalkthrough</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .certificate-card { background: white; border: 2px solid #e9ecef; border-radius: 10px; padding: 25px; margin: 20px 0; text-align: center; }
          .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .btn-secondary { background: #6c757d; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .verification-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #007bff; background: #e7f3ff; padding: 10px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Certificate Issued!</h1>
            <p>Congratulations on completing your WikiWalkthrough course!</p>
          </div>
          
          <div class="content">
            <h2>Dear ${data.studentName},</h2>
            
            <p>We're excited to inform you that your certificate for completing <strong>"${data.courseName}"</strong> has been successfully generated and is now ready for download!</p>
            
            <div class="certificate-card">
              <h3>📜 Certificate Details</h3>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Instructor:</strong> ${data.instructorName}</p>
              <p><strong>Completion Date:</strong> ${data.completionDate.toLocaleDateString()}</p>
              ${data.finalScore ? `<p><strong>Final Score:</strong> ${data.finalScore}%</p>` : ''}
              
              <div class="verification-code">
                Verification Code: ${data.verificationCode}
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${data.downloadUrl}" class="btn">📥 Download Certificate</a>
                <a href="${data.verificationUrl}" class="btn btn-secondary">🔍 Verify Certificate</a>
              </p>
            </div>
            
            <h3>🌟 What's Next?</h3>
            <ul>
              <li><strong>Share Your Achievement:</strong> Add your certificate to LinkedIn, your resume, or share it on social media</li>
              <li><strong>Continue Learning:</strong> Explore more WikiWalkthrough courses to expand your Wikipedia editing skills</li>
              <li><strong>Join the Community:</strong> Connect with other Wikipedia editors and contributors</li>
              <li><strong>Apply Your Skills:</strong> Start contributing to Wikipedia articles in your area of expertise</li>
            </ul>
            
            <h3>📋 Certificate Information</h3>
            <p><strong>Certificate ID:</strong> ${data.certificateId}</p>
            <p><strong>Verification URL:</strong> <a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
            <p>This certificate can be verified by anyone using the verification code or URL above.</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #155724; margin-top: 0;">🎯 Your Impact</h4>
              <p style="color: #155724; margin-bottom: 0;">By completing this course, you've gained valuable skills in Wikipedia editing and are now equipped to contribute to the world's largest encyclopedia. Your future contributions will help millions of people access accurate, well-sourced information.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for being part of the WikiWalkthrough community!</p>
            <p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">WikiWalkthrough Platform</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates">My Certificates</a> | 
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses">Browse Courses</a>
            </p>
            <p style="font-size: 12px; color: #999;">
              This email was sent to ${data.studentEmail}. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Congratulations! Your WikiWalkthrough Certificate is Ready

      Dear ${data.studentName},

      We're excited to inform you that your certificate for completing "${data.courseName}" has been successfully generated!

      Certificate Details:
      - Course: ${data.courseName}
      - Instructor: ${data.instructorName}
      - Completion Date: ${data.completionDate.toLocaleDateString()}
      ${data.finalScore ? `- Final Score: ${data.finalScore}%` : ''}
      - Verification Code: ${data.verificationCode}
      - Certificate ID: ${data.certificateId}

      Download your certificate: ${data.downloadUrl}
      Verify your certificate: ${data.verificationUrl}

      What's Next?
      - Share your achievement on LinkedIn or social media
      - Continue learning with more WikiWalkthrough courses
      - Start contributing to Wikipedia articles
      - Join our community of Wikipedia editors

      Thank you for being part of the WikiWalkthrough community!

      WikiWalkthrough Platform
      ${process.env.FRONTEND_URL || 'http://localhost:3000'}
    `;

    return { subject, html, text };
  }

  // Send certificate reminder email (for certificates that haven't been downloaded)
  async sendCertificateReminderEmail(certificate: ICertificate): Promise<void> {
    try {
      const user = await User.findById(certificate.user);
      if (!user) {
        throw new Error('User not found');
      }

      const subject = `📋 Don't Forget to Download Your WikiWalkthrough Certificate`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>📋 Certificate Download Reminder</h2>
          
          <p>Dear ${certificate.studentName},</p>
          
          <p>We noticed that you haven't downloaded your certificate for completing <strong>"${certificate.courseName}"</strong> yet.</p>
          
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3>Your Certificate is Ready!</h3>
            <p><strong>Verification Code:</strong> <code>${certificate.verificationCode}</code></p>
            <p>
              <a href="${certificate.verification.verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a>
            </p>
          </div>
          
          <p>Your certificate represents your achievement in Wikipedia editing skills and can be a valuable addition to your professional profile.</p>
          
          <p>Best regards,<br>The WikiWalkthrough Team</p>
        </div>
      `;

      const text = `
        Certificate Download Reminder

        Dear ${certificate.studentName},

        We noticed that you haven't downloaded your certificate for completing "${certificate.courseName}" yet.

        Your certificate is ready for download!
        Verification Code: ${certificate.verificationCode}
        Download URL: ${certificate.verification.verificationUrl}

        Your certificate represents your achievement in Wikipedia editing skills and can be a valuable addition to your professional profile.

        Best regards,
        The WikiWalkthrough Team
      `;

      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@wikiwalkthrough.com',
        to: certificate.studentEmail,
        subject,
        html,
        text,
      });

      logger.info(`Certificate reminder email sent to ${certificate.studentEmail} for certificate ${certificate.certificateId}`);
    } catch (error) {
      logger.error('Failed to send certificate reminder email:', error);
      throw error;
    }
  }

  // Send bulk certificate notifications
  async sendBulkCertificateNotifications(certificates: ICertificate[]): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const certificate of certificates) {
      try {
        await this.sendCertificateIssuedEmail(certificate);
        sent++;
      } catch (error) {
        failed++;
        errors.push(`Certificate ${certificate.certificateId}: ${error}`);
      }
    }

    logger.info(`Bulk certificate notifications completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, errors };
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email configuration test successful');
      return true;
    } catch (error) {
      logger.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export default new CertificateNotificationService();

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { ICertificate, CertificateTemplate } from '../models/Certificate';
import logger from '../utils/logger';

export interface CertificateData {
  studentName: string;
  courseName: string;
  courseLevel: string;
  courseCategory: string;
  instructorName: string;
  completionDate: Date;
  issuedAt: Date;
  verificationCode: string;
  certificateId: string;
  finalScore?: number;
  timeSpent: number;
  verificationUrl: string;
  metadata: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore?: number;
    courseDuration: number;
    skillsAcquired: string[];
    wikipediaProject: string;
  };
}

export interface PDFGenerationOptions {
  template: CertificateTemplate;
  outputPath: string;
  includeQRCode: boolean;
  includeWatermark: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

class PDFCertificateService {
  private readonly certificatesDir: string;
  private readonly fontsDir: string;

  constructor() {
    this.certificatesDir = path.join(__dirname, '../../uploads/certificates');
    this.fontsDir = path.join(__dirname, '../../assets/fonts');
    
    // Ensure certificates directory exists
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  // Generate PDF certificate
  async generateCertificate(
    certificateData: CertificateData,
    options: PDFGenerationOptions
  ): Promise<{ filePath: string; fileSize: number }> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Create write stream
      const stream = fs.createWriteStream(options.outputPath);
      doc.pipe(stream);

      // Generate certificate based on template
      switch (options.template) {
        case CertificateTemplate.STANDARD:
          await this.generateStandardCertificate(doc, certificateData, options);
          break;
        case CertificateTemplate.PREMIUM:
          await this.generatePremiumCertificate(doc, certificateData, options);
          break;
        case CertificateTemplate.CUSTOM:
          await this.generateCustomCertificate(doc, certificateData, options);
          break;
        default:
          await this.generateStandardCertificate(doc, certificateData, options);
      }

      // Finalize the PDF
      doc.end();

      // Wait for the stream to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Get file size
      const stats = fs.statSync(options.outputPath);
      const fileSize = stats.size;

      logger.info(`Certificate PDF generated: ${options.outputPath} (${fileSize} bytes)`);
      return { filePath: options.outputPath, fileSize };
    } catch (error) {
      logger.error('Failed to generate certificate PDF:', error);
      throw error;
    }
  }

  // Generate standard certificate template
  private async generateStandardCertificate(
    doc: PDFKit.PDFDocument,
    data: CertificateData,
    options: PDFGenerationOptions
  ): Promise<void> {
    const colors = options.customColors || {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#f59e0b'
    };

    // Add border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .stroke(colors.primary);

    // Add inner border
    doc.rect(45, 45, doc.page.width - 90, doc.page.height - 90)
       .lineWidth(1)
       .stroke(colors.secondary);

    // Header section
    doc.fontSize(32)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('CERTIFICATE OF COMPLETION', 0, 100, { align: 'center' });

    // Wikipedia logo area (placeholder)
    doc.fontSize(16)
       .fillColor(colors.secondary)
       .font('Helvetica')
       .text('WikiWalkthrough Platform', 0, 140, { align: 'center' });

    // Main content
    doc.fontSize(18)
       .fillColor('#000000')
       .font('Helvetica')
       .text('This is to certify that', 0, 200, { align: 'center' });

    doc.fontSize(28)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text(data.studentName, 0, 240, { align: 'center' });

    doc.fontSize(18)
       .fillColor('#000000')
       .font('Helvetica')
       .text('has successfully completed the course', 0, 290, { align: 'center' });

    doc.fontSize(24)
       .fillColor(colors.accent)
       .font('Helvetica-Bold')
       .text(data.courseName, 0, 330, { align: 'center' });

    // Course details
    const detailsY = 380;
    doc.fontSize(14)
       .fillColor(colors.secondary)
       .font('Helvetica')
       .text(`Level: ${data.courseLevel}`, 100, detailsY)
       .text(`Category: ${data.courseCategory}`, 100, detailsY + 20)
       .text(`Completion Date: ${data.completionDate.toLocaleDateString()}`, 100, detailsY + 40);

    // Performance metrics
    if (data.finalScore) {
      doc.text(`Final Score: ${data.finalScore}%`, 400, detailsY);
    }
    doc.text(`Time Spent: ${Math.round(data.timeSpent / 60)} hours`, 400, detailsY + 20)
       .text(`Lessons Completed: ${data.metadata.completedLessons}/${data.metadata.totalLessons}`, 400, detailsY + 40);

    // Instructor signature
    doc.fontSize(16)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Instructor:', 100, 480)
       .font('Helvetica')
       .text(data.instructorName, 100, 500);

    // Certificate details
    doc.fontSize(12)
       .fillColor(colors.secondary)
       .text(`Certificate ID: ${data.certificateId}`, 400, 480)
       .text(`Issued: ${data.issuedAt.toLocaleDateString()}`, 400, 495)
       .text(`Verification: ${data.verificationCode}`, 400, 510);

    // QR Code
    if (options.includeQRCode) {
      await this.addQRCode(doc, data.verificationUrl, 650, 450);
    }

    // Footer
    doc.fontSize(10)
       .fillColor(colors.secondary)
       .text('Verify this certificate at: ' + data.verificationUrl, 0, doc.page.height - 80, { align: 'center' });
  }

  // Generate premium certificate template
  private async generatePremiumCertificate(
    doc: PDFKit.PDFDocument,
    data: CertificateData,
    options: PDFGenerationOptions
  ): Promise<void> {
    const colors = options.customColors || {
      primary: '#7c3aed',
      secondary: '#a855f7',
      accent: '#fbbf24'
    };

    // Gradient background effect (simulated with rectangles)
    for (let i = 0; i < 20; i++) {
      const opacity = 0.05 - (i * 0.002);
      doc.rect(0, i * 30, doc.page.width, 30)
         .fillOpacity(opacity)
         .fill(colors.primary);
    }

    // Decorative border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(5)
       .stroke(colors.primary);

    // Inner decorative elements
    doc.circle(100, 100, 30).stroke(colors.accent);
    doc.circle(doc.page.width - 100, 100, 30).stroke(colors.accent);

    // Premium header
    doc.fontSize(36)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('CERTIFICATE', 0, 80, { align: 'center' });

    doc.fontSize(24)
       .fillColor(colors.secondary)
       .text('OF EXCELLENCE', 0, 120, { align: 'center' });

    // Wikipedia branding
    doc.fontSize(14)
       .fillColor(colors.secondary)
       .font('Helvetica-Oblique')
       .text('WikiWalkthrough Educational Platform', 0, 150, { align: 'center' });

    // Achievement section
    doc.fontSize(16)
       .fillColor('#000000')
       .font('Helvetica')
       .text('This certifies that', 0, 200, { align: 'center' });

    doc.fontSize(32)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text(data.studentName, 0, 230, { align: 'center' });

    doc.fontSize(16)
       .fillColor('#000000')
       .font('Helvetica')
       .text('has demonstrated mastery in', 0, 280, { align: 'center' });

    doc.fontSize(26)
       .fillColor(colors.accent)
       .font('Helvetica-Bold')
       .text(data.courseName, 0, 310, { align: 'center' });

    // Skills acquired section
    if (data.metadata.skillsAcquired.length > 0) {
      doc.fontSize(14)
         .fillColor(colors.secondary)
         .font('Helvetica-Bold')
         .text('Skills Acquired:', 100, 370);
      
      data.metadata.skillsAcquired.slice(0, 3).forEach((skill, index) => {
        doc.fontSize(12)
           .fillColor('#000000')
           .font('Helvetica')
           .text(`• ${skill}`, 120, 390 + (index * 15));
      });
    }

    // Performance metrics in a box
    doc.rect(400, 360, 250, 80)
       .lineWidth(1)
       .stroke(colors.secondary);

    doc.fontSize(12)
       .fillColor(colors.primary)
       .font('Helvetica-Bold')
       .text('Achievement Metrics', 410, 370);

    if (data.finalScore) {
      doc.fontSize(11)
         .fillColor('#000000')
         .font('Helvetica')
         .text(`Final Score: ${data.finalScore}%`, 410, 390);
    }
    
    doc.text(`Study Time: ${Math.round(data.timeSpent / 60)} hours`, 410, 405)
       .text(`Completion Rate: 100%`, 410, 420);

    // Signature and verification
    doc.fontSize(14)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Certified by:', 100, 480)
       .font('Helvetica')
       .text(data.instructorName, 100, 500);

    doc.fontSize(10)
       .fillColor(colors.secondary)
       .text(`Certificate ID: ${data.certificateId}`, 100, 520)
       .text(`Verification Code: ${data.verificationCode}`, 100, 535);

    // QR Code with styling
    if (options.includeQRCode) {
      doc.rect(620, 440, 80, 80)
         .lineWidth(2)
         .stroke(colors.primary);
      await this.addQRCode(doc, data.verificationUrl, 630, 450);
    }

    // Date
    doc.fontSize(12)
       .fillColor('#000000')
       .font('Helvetica')
       .text(`Completed: ${data.completionDate.toLocaleDateString()}`, 400, 500)
       .text(`Issued: ${data.issuedAt.toLocaleDateString()}`, 400, 515);
  }

  // Generate custom certificate template
  private async generateCustomCertificate(
    doc: PDFKit.PDFDocument,
    data: CertificateData,
    options: PDFGenerationOptions
  ): Promise<void> {
    // For now, use premium template as base for custom
    // This can be extended to support fully customizable templates
    await this.generatePremiumCertificate(doc, data, options);
  }

  // Add QR code to the PDF
  private async addQRCode(
    doc: PDFKit.PDFDocument,
    url: string,
    x: number,
    y: number
  ): Promise<void> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 60,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Convert data URL to buffer
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Add QR code image to PDF
      doc.image(buffer, x, y, { width: 60, height: 60 });
    } catch (error) {
      logger.error('Failed to add QR code to certificate:', error);
      // Continue without QR code if generation fails
    }
  }

  // Get certificate file path
  getCertificateFilePath(certificateId: string): string {
    return path.join(this.certificatesDir, `${certificateId}.pdf`);
  }

  // Check if certificate file exists
  certificateFileExists(certificateId: string): boolean {
    const filePath = this.getCertificateFilePath(certificateId);
    return fs.existsSync(filePath);
  }

  // Delete certificate file
  deleteCertificateFile(certificateId: string): boolean {
    try {
      const filePath = this.getCertificateFilePath(certificateId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Certificate file deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to delete certificate file:', error);
      return false;
    }
  }
}

export default new PDFCertificateService();

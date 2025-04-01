import nodemailer from 'nodemailer';
import { generateWelcomeEmail, generatePromotionalEmail, generateLaunchEmail } from './templates';

/**
 * Email Service for sending various types of emails
 * Can use a configured SMTP server or fallback to Ethereal for testing
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private fromAddress: string = '';

  constructor() {
    // Initialize the service when needed (lazy loading)
    this.transporter = {} as nodemailer.Transporter;
    this.initializationPromise = null;
  }

  /**
   * Initialize the email service
   * If no email configuration is provided, it creates a test account using Ethereal
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this._initialize();
    }

    return this.initializationPromise;
  }

  /**
   * Private initialization method
   */
  private async _initialize(): Promise<void> {
    try {
      // Check if email configuration is provided
      if (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        // Use configured SMTP server
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT, 10),
          secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        
        this.fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        console.log('Email service initialized with configured SMTP server');
      } else {
        // Create a test account using Ethereal for development/testing
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        this.fromAddress = testAccount.user;
        console.log('Email service initialized with Ethereal test account');
        console.log('Ethereal account:', testAccount.user);
        console.log('View emails at: https://ethereal.email');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email body in HTML format
   */
  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const mailOptions = {
      from: `"Klede Collection" <${this.fromAddress}>`,
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      // If using Ethereal, log the URL where the email can be viewed
      if (info.messageId && info.messageId.includes('ethereal')) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send a welcome email to a new waitlist subscriber
   * @param email Recipient email address
   */
  async sendWelcomeEmail(email: string): Promise<any> {
    const { subject, html } = generateWelcomeEmail(email);
    return this.sendEmail(email, subject, html);
  }

  /**
   * Send a promotional email to a waitlist subscriber
   * @param email Recipient email address
   * @param customMessage Optional custom message to include in the email
   */
  async sendPromotionalEmail(email: string, customMessage?: string): Promise<any> {
    const { subject, html } = generatePromotionalEmail(email, customMessage);
    return this.sendEmail(email, subject, html);
  }

  /**
   * Send a launch announcement email to a waitlist subscriber
   * @param email Recipient email address
   */
  async sendLaunchEmail(email: string): Promise<any> {
    const { subject, html } = generateLaunchEmail(email);
    return this.sendEmail(email, subject, html);
  }
}

// Export a singleton instance
export const emailService = new EmailService();
import nodemailer from "nodemailer";
import { generateWelcomeEmail, generatePromotionalEmail, generateLaunchEmail } from "./templates.js";

/**
 * Email Service for sending various types of emails
 * Can use a configured SMTP server or fallback to Ethereal for testing
 */
export class EmailService {
  private transporter: nodemailer.Transporter;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // We'll initialize lazily when needed
    this.transporter = null as any;
  }

  /**
   * Initialize the email service
   * If no email configuration is provided, it creates a test account using Ethereal
   */
  async initialize(): Promise<void> {
    // Only initialize once
    if (this.initialized) {
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    await this.initializationPromise;
    this.initializationPromise = null;
  }

  /**
   * Private initialization method
   */
  private async _initialize(): Promise<void> {
    try {
      // Check if we have SMTP configuration
      if (
        process.env.EMAIL_HOST &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS
      ) {
        // Create a real SMTP transporter
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT),
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        console.log("Email service initialized with provided SMTP configuration");
      } else {
        // Create a test account using Ethereal for development
        const testAccount = await nodemailer.createTestAccount();

        // Create an Ethereal transporter for testing
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log("Email service initialized with Ethereal test account");
        console.log("Test account credentials:", {
          user: testAccount.user,
          pass: testAccount.pass,
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize email service:", error);
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
    // Make sure the service is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    // Prepare the email
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Klede Waitlist" <no-reply@klede.com>',
      to,
      subject,
      html,
    };

    // Send the email
    const info = await this.transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (info.messageId && info.previewURL) {
      console.log("Email sent:", info.messageId);
      console.log("Preview URL:", info.previewURL);
    }

    return info;
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

// Create a singleton instance
export const emailService = new EmailService();
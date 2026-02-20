import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailJobData } from '../queue.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}: ${job.data.subject}`);

    try {
      // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
      // For now, just log the email
      await this.sendEmail(job.data);
      
      this.logger.log(`Email sent successfully: ${job.data.subject} to ${job.data.to}`);
      return { success: true, emailId: job.id };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error; // Will trigger retry
    }
  }

  private async sendEmail(data: EmailJobData): Promise<void> {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Log email details (replace with actual email service)
    this.logger.debug(`
      ===== EMAIL =====
      To: ${data.to}
      Subject: ${data.subject}
      Template: ${data.template}
      Context: ${JSON.stringify(data.context, null, 2)}
      =================
    `);

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const msg = {
    //   to: data.to,
    //   from: 'noreply@fulccrum.com',
    //   subject: data.subject,
    //   templateId: data.template,
    //   dynamicTemplateData: data.context,
    // };
    // await this.sendgridService.send(msg);
  }
}

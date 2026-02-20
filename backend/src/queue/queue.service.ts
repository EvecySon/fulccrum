import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface NotificationJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  /**
   * Add email to queue
   */
  async sendEmail(data: EmailJobData): Promise<void> {
    try {
      await this.emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Email queued: ${data.subject} to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to queue email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add notification to queue
   */
  async sendNotification(data: NotificationJobData): Promise<void> {
    try {
      await this.notificationQueue.add('send-notification', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Notification queued for user: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to queue notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send bulk notifications (batched)
   */
  async sendBulkNotifications(notifications: NotificationJobData[]): Promise<void> {
    try {
      const jobs = notifications.map(data => ({
        name: 'send-notification',
        data,
        opts: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      }));

      await this.notificationQueue.addBulk(jobs);
      this.logger.log(`Bulk notifications queued: ${notifications.length} items`);
    } catch (error) {
      this.logger.error(`Failed to queue bulk notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getEmailQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return {
      queue: 'email',
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  async getNotificationQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
      this.notificationQueue.getDelayedCount(),
    ]);

    return {
      queue: 'notification',
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Clear all jobs from queues (use with caution)
   */
  async clearAllQueues(): Promise<void> {
    await Promise.all([
      this.emailQueue.empty(),
      this.notificationQueue.empty(),
    ]);
    this.logger.warn('All queues cleared');
  }
}

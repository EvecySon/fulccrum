import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private isInitialized = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    try {
      const projectId = this.config.get('FIREBASE_PROJECT_ID');
      const privateKey = this.config.get('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');

      if (!projectId || !privateKey || !clientEmail) {
        console.log('[FIREBASE] Credentials not configured - push notifications disabled');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
      
      this.isInitialized = true;
      console.log('[FIREBASE] Initialized successfully');
    } catch (error) {
      console.error('[FIREBASE] Initialization error:', error.message);
    }
  }

  async sendPushNotification(tokens: string[], title: string, body: string, data?: any) {
    if (!this.isInitialized) {
      console.log(`[FIREBASE] Would send push: ${title} - ${body} to ${tokens.length} devices`);
      return {
        successCount: 0,
        failureCount: tokens.length,
        message: 'Firebase not initialized - add credentials to .env',
      };
    }

    try {
      const message = {
        notification: { title, body },
        data: data || {},
        tokens,
      };

      const response = await (admin.messaging() as any).sendEachForMulticast(message);
      console.log(`[FIREBASE] Success: ${response.successCount}, Failed: ${response.failureCount}`);
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('[FIREBASE] Error:', error);
      throw error;
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    if (!this.isInitialized) {
      console.log(`[FIREBASE] Would send to topic ${topic}: ${title} - ${body}`);
      return { success: false, message: 'Firebase not initialized' };
    }

    try {
      const message = {
        notification: { title, body },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);
      console.log(`[FIREBASE] Sent to topic ${topic}:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('[FIREBASE] Error:', error);
      throw error;
    }
  }
}

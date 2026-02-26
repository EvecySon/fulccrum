import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(config: ConfigService) {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const projectId = config.get('FIREBASE_PROJECT_ID');
    const clientEmail = config.get('FIREBASE_CLIENT_EMAIL');
    const privateKey = config.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('[FIREBASE] Missing Firebase credentials. Push notifications will not work.');
      return null;
    }

    // Reuse existing app if already initialized
    const existingApps = admin.apps;
    if (existingApps && existingApps.length > 0) {
      firebaseApp = existingApps[0];
      console.log('[FIREBASE] Reusing existing Firebase app');
      return firebaseApp;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log('[FIREBASE] Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('[FIREBASE] Initialization error:', error.message);
    return null;
  }
}

export function getFirebaseMessaging(): admin.messaging.Messaging | null {
  if (!firebaseApp) {
    console.warn('[FIREBASE] Firebase not initialized. Cannot get messaging service.');
    return null;
  }
  return admin.messaging(firebaseApp);
}

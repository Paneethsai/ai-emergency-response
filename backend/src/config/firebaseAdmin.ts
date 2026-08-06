import { getApps, initializeApp, cert } from 'firebase-admin/app';

export const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      if (!process.env.FIREBASE_PROJECT_ID) {
        console.warn('Firebase Admin skipped (no project ID).');
        return;
      }
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized');
    } catch (error) {
      console.warn('Firebase Admin init skipped or failed (check env vars).');
    }
  }
};

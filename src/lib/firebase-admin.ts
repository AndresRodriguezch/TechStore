
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function initializes Firebase Admin SDK and ensures it's a singleton.
function initializeAdminApp() {
  if (getApps().length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('La variable de entorno FIREBASE_PRIVATE_KEY no está configurada.');
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new Error('Faltan credenciales de la cuenta de servicio de Firebase.');
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminApp = initializeAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();

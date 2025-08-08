
'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Customer } from './types';


function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
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
  
  return initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function deleteUserFromAdmin(userId: string) {
  initializeAdminApp();
  const adminAuth = admin.auth();
  const adminDb = getFirestore();

  try {
    // Delete from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    // Firebase Admin SDK errors often have a code property
    if (error.code === 'auth/user-not-found') {
      // If user is not in Auth, maybe they are just in Firestore.
      // Try deleting from Firestore anyway.
      try {
        await adminDb.collection('users').doc(userId).delete();
        return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
      } catch (dbError) {
         console.error('Error deleting user from Firestore after Auth delete failed:', dbError);
         return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
      }
    }
    return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
  }
}

export async function getUsers(): Promise<Customer[]> {
    initializeAdminApp();
    const adminDb = getFirestore();
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Customer));
    return users;
}

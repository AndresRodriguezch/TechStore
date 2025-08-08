
'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Customer, Invoice } from './types';


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
  
  try {
    return initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error: ", error);
    // If it's already initialized, return the existing app.
    // This can happen in some environments like serverless functions.
    if (getApps().length) {
        return getApps()[0]!;
    }
    throw error;
  }
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

export async function getInvoices(user: { id: string; role: 'admin' | 'user' }): Promise<{ invoices: Invoice[], customers: Customer[] }> {
    initializeAdminApp();
    const db = getFirestore();

    let invoiceQuery;

    if (user.role === 'admin') {
      invoiceQuery = db.collection('invoices');
    } else {
      invoiceQuery = db.collection('invoices').where('customerId', '==', user.id);
    }
    
    const invoicesSnapshot = await invoiceQuery.get();
    const invoicesData = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));

    // Get customer data only for the invoices fetched
    const customerIds = [...new Set(invoicesData.map(invoice => invoice.customerId))];
    const customersData: Customer[] = [];

    if (customerIds.length > 0) {
         const customersSnapshot = await db.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', customerIds).get();
         customersData.push(...customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    }
    
    // Add a fallback for deleted customers, just in case
     invoicesData.forEach(invoice => {
        if (!customersData.find(c => c.id === invoice.customerId)) {
            customersData.push({
                id: invoice.customerId,
                name: 'Cliente Eliminado',
                email: 'No disponible',
                phone: 'No disponible',
            });
        }
    });

    return {
        invoices: invoicesData.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
        customers: customersData
    };
}

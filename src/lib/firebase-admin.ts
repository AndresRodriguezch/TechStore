
'use server';

import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Customer, Invoice, User } from './types';

let adminApp: App;
let firestoreDb: Firestore;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    firestoreDb = admin.firestore(adminApp);
    return;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      'La variable de entorno FIREBASE_PRIVATE_KEY no está configurada.'
    );
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firestoreDb = admin.firestore(adminApp);
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.message?.includes('PEM')) {
      console.error(
        'Error de inicialización de Firebase Admin: Credenciales inválidas o clave mal formateada.',
        error.message
      );
      throw new Error(
        'Las credenciales de Firebase Admin son inválidas. Revisa las variables de entorno, especialmente la clave privada.'
      );
    }
    console.error('Error de inicialización de Firebase Admin: ', error);
    throw error;
  }
}

export async function getCustomers(): Promise<Customer[]> {
  initializeAdmin();
  const usersSnapshot = await firestoreDb.collection('users').get();
  const users = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Customer[];
  return users;
}

export async function deleteUser(userId: string) {
    initializeAdmin();
    const { auth } = admin;

    try {
        await auth().deleteUser(userId);
        await firestoreDb.collection('users').doc(userId).delete();
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        if (error.code === 'auth/user-not-found') {
            try {
                await firestoreDb.collection('users').doc(userId).delete();
                return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
            } catch (dbError) {
                console.error('Error al eliminar usuario de Firestore después de fallo de Auth:', dbError);
                 return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
            }
        }
        return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
    }
}

export async function getInvoices(user: User): Promise<{invoices: Invoice[], customers: Record<string, Customer>}> {
  initializeAdmin();
  let invoicesQuery;

  if (user.role === 'admin') {
    invoicesQuery = firestoreDb.collection('invoices');
  } else {
    invoicesQuery = firestoreDb.collection('invoices').where('customerId', '==', user.uid);
  }
  
  const invoicesSnapshot = await invoicesQuery.get();
  const invoicesData = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));

  const customerIds = [...new Set(invoicesData.map(invoice => invoice.customerId))];
  const customersData: Record<string, Customer> = {};

  if (customerIds.length > 0) {
    const customersSnapshot = await firestoreDb.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', customerIds).get();
    customersSnapshot.forEach(doc => {
      customersData[doc.id] = { id: doc.id, ...doc.data() } as Customer;
    });
  }

  invoicesData.forEach(invoice => {
    if (!customersData[invoice.customerId]) {
      customersData[invoice.customerId] = {
        id: invoice.customerId,
        name: 'Cliente Eliminado',
        email: 'No disponible',
        phone: 'No disponible',
      };
    }
  });

  return {
    invoices: invoicesData.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    customers: customersData
  };
}


export async function getInvoiceById(invoiceId: string, user: User): Promise<{ invoice: Invoice | null, customer: Customer | null }> {
    initializeAdmin();

    const invoiceRef = firestoreDb.collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();

    if (!invoiceSnap.exists) {
        return { invoice: null, customer: null };
    }

    const invoiceData = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;

    // Security Check: If user is not admin, they can only access their own invoices
    if (user.role !== 'admin' && invoiceData.customerId !== user.uid) {
        return { invoice: null, customer: null };
    }

    const customerRef = firestoreDb.collection('users').doc(invoiceData.customerId);
    const customerSnap = await customerRef.get();

    let customerData: Customer | null = null;
    if (customerSnap.exists()) {
        customerData = { id: customerSnap.id, ...customerSnap.data() } as Customer;
    } else {
        customerData = {
            id: invoiceData.customerId,
            name: 'Cliente Eliminado',
            email: 'No disponible',
            phone: 'No disponible',
        };
    }

    return { invoice: invoiceData, customer: customerData };
}

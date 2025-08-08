
'use server';

import { getInvoiceById as getInvoiceByIdAdmin, getInvoices as getInvoicesAdmin } from '@/lib/firebase-admin';
import type { Invoice, Customer } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';
import { User } from '@/lib/types';

async function getCurrentUser(): Promise<User | null> {
    const session = cookies().get('session')?.value;
    if (!session) return null;
    
    // Ensure Firebase Admin is initialized
    if (admin.apps.length === 0) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey) {
            console.error('FIREBASE_PRIVATE_KEY is not set');
            return null;
        };
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase Admin SDK initialization error:', error);
            return null;
        }
    }

    try {
        const decodedIdToken = await getAuth().verifySessionCookie(session, true);
        const userDoc = await admin.firestore().collection('users').doc(decodedIdToken.uid).get();
        if (!userDoc.exists) return null;
        
        const userData = userDoc.data();
        return {
            uid: decodedIdToken.uid,
            email: decodedIdToken.email || '',
            name: userData?.name,
            role: userData?.role,
            phone: userData?.phone,
            address: userData?.address,
        };
    } catch (error) {
        console.error('Error verifying session cookie:', error);
        return null;
    }
}


export async function getInvoices(): Promise<{ invoices: Invoice[], customers: Record<string, Customer> }> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    return getInvoicesAdmin(user as any);
}

export async function getInvoiceById(invoiceId: string): Promise<{ invoice: Invoice | null, customer: Customer | null }> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    return getInvoiceByIdAdmin(invoiceId, user as any);
}

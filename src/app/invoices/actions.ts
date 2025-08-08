
'use server';

import { getInvoiceById as getInvoiceByIdAdmin, getInvoices as getInvoicesAdmin } from '@/lib/firebase-admin';
import type { Invoice, Customer } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import admin from 'firebase-admin';

async function getCurrentUser() {
    const session = cookies().get('session')?.value;
    if (!session) return null;
    
    if (admin.apps.length === 0) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey) throw new Error('FIREBASE_PRIVATE_KEY is not set');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
    }

    try {
        const decodedIdToken = await getAuth().verifySessionCookie(session, true);
        const userDoc = await admin.firestore().collection('users').doc(decodedIdToken.uid).get();
        if (!userDoc.exists) return null;
        return { uid: decodedIdToken.uid, ...userDoc.data() } as Customer;
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

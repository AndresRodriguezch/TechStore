
'use server';

import { getInvoices as getInvoicesFromAdmin } from '@/lib/firebase-admin';
import { Customer, Invoice } from '@/lib/types';

export async function getInvoices(user: { id: string; role: 'admin' | 'user' }): Promise<{ invoices: Invoice[], customers: Customer[] }> {
    if (!user || !user.id) {
        return { invoices: [], customers: [] };
    }
    return getInvoicesFromAdmin(user);
}

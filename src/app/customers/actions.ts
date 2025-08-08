
'use server';

import { deleteUserFromAdmin, getUsers } from '@/lib/firebase-admin';
import { Customer } from '@/lib/types';

export async function deleteUser(userId: string) {
    return deleteUserFromAdmin(userId);
}

export async function getCustomers(): Promise<Customer[]> {
    return getUsers();
}

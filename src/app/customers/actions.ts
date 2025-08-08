
'use server';

import { deleteUserFromAdmin as deleteUserFromAdminSDK } from '@/lib/firebase-admin';

export async function deleteUser(userId: string) {
    return deleteUserFromAdminSDK(userId);
}

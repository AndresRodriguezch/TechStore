
'use server';

import { deleteUser as deleteUserFromAdmin } from '@/lib/firebase-admin';

export async function deleteUser(userId: string) {
    return deleteUserFromAdmin(userId);
}

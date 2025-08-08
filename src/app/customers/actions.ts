
'use server';

import { doc, deleteDoc } from 'firebase/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function deleteUser(userId: string) {
  try {
    // Delete from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // Delete from Firestore
    await deleteDoc(doc(adminDb, 'users', userId));

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    // Firebase Admin SDK errors often have a code property
    if (error.code === 'auth/user-not-found') {
      // If user is not in Auth, maybe they are just in Firestore.
      // Try deleting from Firestore anyway.
      try {
        await deleteDoc(doc(adminDb, "users", userId));
        return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
      } catch (dbError) {
         console.error('Error deleting user from Firestore after Auth delete failed:', dbError);
         return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
      }
    }
    return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
  }
}


'use server';

import admin from 'firebase-admin';

// This function needs to be lazy-initialized to avoid trying to access
// process.env variables at build time.
async function initializeAdmin() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('La variable de entorno FIREBASE_PRIVATE_KEY no está configurada.');
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Format the private key correctly.
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
  
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.message?.includes('PEM')) {
            console.error('Error de inicialización de Firebase Admin: Credenciales inválidas o clave mal formateada.', error.message);
            throw new Error('Las credenciales de Firebase Admin son inválidas. Revisa las variables de entorno, especialmente la clave privada.');
        }
        console.error("Error de inicialización de Firebase Admin: ", error);
        throw error;
    }
  }
  return { auth: admin.auth(), firestore: admin.firestore() };
}

export async function deleteUser(userId: string) {
    try {
        const { auth, firestore } = await initializeAdmin();
        await auth.deleteUser(userId);
        await firestore.collection('users').doc(userId).delete();
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        // If user is not in auth, try deleting from firestore only
        if (error.code === 'auth/user-not-found') {
            try {
                const { firestore } = await initializeAdmin();
                await firestore.collection('users').doc(userId).delete();
                return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
            } catch (dbError) {
                console.error('Error al eliminar usuario de Firestore después de fallo de Auth:', dbError);
                 return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
            }
        }
        return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
    }
}

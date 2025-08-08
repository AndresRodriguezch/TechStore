
'use server';

import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Customer } from './types';

let adminApp: App | undefined;
let firestoreDb: Firestore | undefined;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        if (!adminApp) {
            adminApp = admin.app();
        }
        if(!firestoreDb) {
            firestoreDb = admin.firestore();
        }
        return;
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
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        firestoreDb = admin.firestore(adminApp);
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            console.error('Error de inicialización de Firebase Admin: Credenciales inválidas.', error);
            throw new Error('Las credenciales de Firebase Admin son inválidas. Revisa las variables de entorno.');
        }
        console.error("Error de inicialización de Firebase Admin: ", error);
        throw error;
    }
}

async function deleteUserFromAdmin(userId: string) {
    initializeAdminApp();
    const adminAuth = admin.auth(adminApp);

    try {
        await adminAuth.deleteUser(userId);
        await firestoreDb!.collection('users').doc(userId).delete();
        return { success: true };
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        if (error.code === 'auth/user-not-found') {
            try {
                await firestoreDb!.collection('users').doc(userId).delete();
                return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
            } catch (dbError) {
                console.error('Error al eliminar usuario de Firestore después de fallo de Auth:', dbError);
                return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
            }
        }
        return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
    }
}

async function getUsers(): Promise<Customer[]> {
    initializeAdminApp();
    const usersSnapshot = await firestoreDb!.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Customer));
    return users;
}

export { deleteUserFromAdmin, getUsers };


'use server';

import admin from 'firebase-admin';
import { getApps, initializeApp, App, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Customer } from './types';

let adminApp: App;
let firestoreDb: Firestore;

function initializeAdminApp() {
    if (getApps().length > 0) {
        adminApp = getApp();
        firestoreDb = getFirestore(adminApp);
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
        adminApp = initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        firestoreDb = getFirestore(adminApp);
    } catch (error: any) {
        // This might happen in some environments, but getApps().length should prevent it.
        if (error.code === 'auth/invalid-credential') {
            console.error('Firebase Admin initialization error: Invalid credentials.', error);
            throw new Error('Las credenciales de Firebase Admin son inválidas. Revisa las variables de entorno.');
        }
        console.error("Firebase Admin initialization error: ", error);
        throw error;
    }
}

async function deleteUserFromAdmin(userId: string) {
    initializeAdminApp(); // Ensure app is initialized
    const adminAuth = admin.auth(adminApp);

    try {
        await adminAuth.deleteUser(userId);
        await firestoreDb.collection('users').doc(userId).delete();
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        if (error.code === 'auth/user-not-found') {
            try {
                await firestoreDb.collection('users').doc(userId).delete();
                return { success: true, message: "Usuario eliminado solo de la base de datos (no se encontró en autenticación)." };
            } catch (dbError) {
                console.error('Error deleting user from Firestore after Auth delete failed:', dbError);
                return { success: false, message: 'El usuario no se encontró en autenticación y tampoco pudo ser eliminado de la base de datos.' };
            }
        }
        return { success: false, message: error.message || 'Ocurrió un error al eliminar el usuario.' };
    }
}

async function getUsers(): Promise<Customer[]> {
    initializeAdminApp(); // Ensure app is initialized
    const usersSnapshot = await firestoreDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Customer));
    return users;
}

export { deleteUserFromAdmin, getUsers };

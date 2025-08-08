
import { auth } from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}


export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await auth().createSessionCookie(idToken, { expiresIn });
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);

    return response;
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Failed to create session' }, { status: 401 });
  }
}


export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set({
    name: 'session',
    value: '',
    expires: new Date(0),
  });
  return response;
}

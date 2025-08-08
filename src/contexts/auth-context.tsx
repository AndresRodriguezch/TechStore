
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserAndSetData = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    let userData: Partial<User> = {};

    if (userDocSnap.exists()) {
      userData = userDocSnap.data();
    }
    
    // Dynamically check for admin role based on .env variable
    const isAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const finalRole = isAdmin ? 'admin' : userData.role || 'user';

    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: finalRole,
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await fetchUserAndSetData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // After successful sign-in, onAuthStateChanged will trigger and fetch user data.
      return { success: true };
    } catch (error: any) {
       // Firebase returns 'auth/invalid-credential' for both wrong password and user not found
       // This is a security best practice to prevent user enumeration.
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' };
      }
      // Handle other potential errors
      return { success: false, message: 'Ocurrió un error al iniciar sesión.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

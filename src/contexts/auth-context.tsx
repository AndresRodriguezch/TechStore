
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

// Function to set a session cookie
async function setSessionCookie(idToken: string) {
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
}

// Function to clear the session cookie
async function clearSessionCookie() {
    await fetch('/api/auth/session', { method: 'DELETE' });
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userData: User;

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                name: data.name,
                role: data.role,
                phone: data.phone,
                address: data.address,
            };
        } else {
            userData = { uid: firebaseUser.uid, email: firebaseUser.email! };
        }
        setUser(userData);
        
        // Set session cookie on login
        const idToken = await firebaseUser.getIdToken();
        await setSessionCookie(idToken);

        return userData;

      } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          return null;
      }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
        await clearSessionCookie();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
          const fetchedUser = await fetchUserData(userCredential.user);
          if (fetchedUser) {
              setLoading(false);
              return { success: true };
          }
      }
      setLoading(false);
      return { success: false, message: 'No se pudieron obtener los datos del usuario.' };
    } catch (error: any) {
       setLoading(false);
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, message: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' };
      }
      return { success: false, message: 'Ocurrió un error al iniciar sesión.' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await clearSessionCookie();
      // Redirect to login only if not already on a public page
      if (!['/login', '/signup', '/'].includes(pathname)) {
        router.push('/login');
      } else {
        router.refresh(); // Refresh to reflect logged-out state
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
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

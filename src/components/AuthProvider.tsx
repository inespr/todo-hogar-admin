'use client';

import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, googleProvider } from '../lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, (fbUser) => {
        setUser(fbUser);
        setLoading(false);
      });
    } catch (error) {
      console.error('Firebase Auth no pudo inicializarse:', error);
      setLoading(false);
    }
    return () => unsub?.();
  }, []);

  const signOutUser = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    setUser(null);
  };

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const value: AuthContextType = {
    user,
    loading,
    signOutUser,
    signInWithGoogle,
    signInWithEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

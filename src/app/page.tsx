'use client';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Espera a que cargue el estado de auth
    if (user) router.replace('/dashboard');
    else router.replace('/login');
  }, [user, loading, router]);

  return <div className="p-6">Cargando...</div>;
}

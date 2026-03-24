'use client';

import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Box, Spinner } from '@chakra-ui/react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace('/dashboard');
    else router.replace('/login');
  }, [user, loading, router]);

  return (
    <Box p={6} display="flex" alignItems="center" justifyContent="center" minH="90vh">
      <Spinner size="xl" color="orange.500" />
    </Box>
  );
}

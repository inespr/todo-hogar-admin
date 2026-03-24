'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Image,
} from '@chakra-ui/react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningIn(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google');
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box mb={8} textAlign="center">
        <Image src="/todo_hogar_color.svg" alt="Todo Hogar Factory" h={10} mx="auto" mb={3} />
        <Text color="gray.400" fontSize="sm">Panel de administración</Text>
      </Box>

      <Box
        w="full"
        maxW="sm"
        bg="white"
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.100"
        shadow="md"
        p={8}
      >
        <Text fontSize="xl" fontWeight="bold" mb={1} color="gray.800">Bienvenida</Text>
        <Text fontSize="sm" color="gray.400" mb={6}>Inicia sesión para continuar</Text>

        <form onSubmit={handleEmailLogin}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="gray.600">Correo electrónico</FormLabel>
              <Input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                bg="gray.50"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color="gray.600">Contraseña</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                bg="gray.50"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="orange"
              size="lg"
              w="full"
              isLoading={signingIn}
              loadingText="Entrando..."
            >
              Iniciar sesión
            </Button>
          </Stack>
        </form>

        <Box position="relative" my={5}>
          <Divider />
          <Text
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="white"
            px={3}
            fontSize="xs"
            color="gray.400"
          >
            o continúa con
          </Text>
        </Box>

        <Button variant="outline" size="lg" w="full" onClick={handleGoogle} colorScheme="gray">
          Continuar con Google
        </Button>

        {error && (
          <Text color="red.500" fontSize="sm" mt={4} textAlign="center">
            {error}
          </Text>
        )}
      </Box>
    </Box>
  );
}

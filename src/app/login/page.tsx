'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Box, Button, FormControl, FormLabel, Input, Stack, Text, Image as ChakraImage, Card, CardHeader, CardBody } from '@chakra-ui/react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  const handleEmailSignUp = async () => {
    setError(null);
    try {
      await signUpWithEmail(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
    <Box minH="90vh" bg="orange.600" p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      {/* Header con logo */}
      <Box mb={6} textAlign="center">
        <ChakraImage src="/logo-rectangulo.svg" alt="Todo Hogar Factory" width={220} height={32} mx="auto" />
      </Box>

      <Card className="max-w-sm w-full border border-gray-200 shadow-lg">
      <CardHeader title="Inicia sesión" />
        <CardBody>
          <form onSubmit={handleEmailLogin}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Correo</FormLabel>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormControl>

              <Button type="submit" colorScheme="orange" w="full">
                Entrar
              </Button>
            </Stack>
          </form>

          <Stack spacing={2} mt={4}>
            <Button variant="outline" w="full" onClick={handleEmailSignUp}>
              Crear cuenta
            </Button>
            <Button variant="outline" w="full" onClick={handleGoogle}>
              Continuar con Google
            </Button>
          </Stack>

          {error && (
            <Text color="red.500" fontSize="sm" mt={3} textAlign="center">
              {error}
            </Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

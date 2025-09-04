'use client';

import RequireAuth from "../../../components/RequireAuth";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from "../../../lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";

type Electrodomestico = {
  name: string;
  price: number;
  medidas?: string;
  observaciones?: string;
  fotos: string[];
};

export default function NewProductPage() {
  return (
    <RequireAuth>
      <FormProducto />
    </RequireAuth>
  );
}

function FormProducto() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [medidas, setMedidas] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [hasDefect, setHasDefect] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const storage = getFirebaseStorage();
      const db = getFirestoreDb();

      const urls: string[] = [];
      for (const file of imagenes) {
        const fileRef = ref(storage, `electrodomesticos/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      const base: Record<string, unknown> = {
        name,
        price,
        fotos: urls,
        creadoEn: serverTimestamp(),
        hasDefect,
        stock: inStock ? 1 : 0,
      };
      if (medidas.trim()) base.medidas = medidas.trim();
      if (observaciones.trim()) base.observaciones = observaciones.trim();

      await addDoc(collection(db, 'electrodomesticos'), base);

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear el producto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxW="3xl" mx="auto" p={4}>
      <Button mb={4} onClick={() => router.back()} colorScheme="gray">
      ← Volver
    </Button>
      <Card>
        <CardHeader title="Nuevo producto" />
        <CardBody>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  placeholder="Ej: Frigorífico Samsung"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio (€)</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 499.99"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Medidas</FormLabel>
                <Input
                  placeholder="Opcional"
                  value={medidas}
                  onChange={(e) => setMedidas(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Observaciones</FormLabel>
                <Input
                  placeholder="Opcional"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Con algún defecto</FormLabel>
                <Checkbox
                  isChecked={hasDefect}
                  onChange={(e) => setHasDefect(e.target.checked)}
                >
                  Sí
                </Checkbox>
              </FormControl>

              <FormControl>
                <FormLabel>En stock</FormLabel>
                <Checkbox
                  isChecked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                >
                  Disponible
                </Checkbox>
              </FormControl>

              <FormControl>
                <FormLabel>Fotos</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImagenes(Array.from(e.target.files ?? []))}
                />
              </FormControl>

              <Button type="submit" colorScheme="orange" isLoading={submitting}>
                Guardar
              </Button>
              {error && <Text color="red.500">{error}</Text>}
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
}

'use client';

import RequireAuth from '../../../components/RequireAuth';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, deleteField, type DocumentData } from 'firebase/firestore';
import { getFirestoreDb, getFirebaseStorage } from '../../../lib/firebase';
import { deleteObject, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import Image from 'next/image';

type ElectroData = {
  name: string;
  price: number;
  medidas?: string;
  observaciones?: string;
  fotos?: string[];
  hasDefect?: boolean;
  stock?: number;
};

export default function EditElectroPage() {
  return (
    <RequireAuth>
      <Editor />
    </RequireAuth>
  );
}

function Editor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const db = useMemo(() => getFirestoreDb(), []);
  const storage = useMemo(() => getFirebaseStorage(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [medidas, setMedidas] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [hasDefect, setHasDefect] = useState(false);
  const [stock, setStock] = useState<number>(1);

  useEffect(() => {
    const load = async () => {
      try {
        const refDoc = doc(db, 'electrodomesticos', id);
        const snap = await getDoc(refDoc);
        if (!snap.exists()) {
          setError('No encontrado');
          return;
        }
        const data = snap.data() as DocumentData;
        setName(typeof data.name === 'string' ? data.name : '');
        setPrice(typeof data.price === 'number' ? data.price : 0);
        setMedidas(typeof data.medidas === 'string' ? data.medidas : '');
        setObservaciones(typeof data.observaciones === 'string' ? data.observaciones : '');
        setHasDefect(!!data.hasDefect);
        setStock(typeof data.stock === 'number' ? data.stock : 1);
        const img = Array.isArray(data.fotos) ? data.fotos : [];
        setFotos(img);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db, id]);

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    setNuevasImagenes(prev => [...prev, ...Array.from(files)]);
  };

  const handleRemoveExistingImage = async (url: string) => {
    setFotos(prev => prev.filter(u => u !== url));
    try {
      const r = ref(storage, url);
      await deleteObject(r);
    } catch {}
  };

  const handleRemoveNewImage = (name: string) => {
    setNuevasImagenes(prev => prev.filter(f => f.name !== name));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of nuevasImagenes) {
        const fileRef = ref(storage, `electrodomesticos/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      const updated: Partial<ElectroData> = {
        name,
        price,
        fotos: [...fotos, ...urls],
        hasDefect,
        stock,
      };

      updated.medidas = medidas.trim() ? medidas.trim() : deleteField() as unknown as string;
      updated.observaciones = observaciones.trim() ? observaciones.trim() : deleteField() as unknown as string;

      await updateDoc(doc(db, 'electrodomesticos', id), updated);
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm('¿Eliminar este electrodoméstico y sus imágenes?');
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      for (const url of fotos) {
        try {
          const r = ref(storage, url);
          await deleteObject(r);
        } catch {}
      }
      await deleteDoc(doc(db, 'electrodomesticos', id));
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Text color="orange.600" p={6}>Cargando...</Text>;
  if (error) return <Text color="red.500" p={6}>{error}</Text>;

  return (
    <Box maxW="3xl" mx="auto" p={4}>
      <Button mb={4} onClick={() => router.back()} colorScheme="gray">
        ← Volver
      </Button>
      <Card>
        <CardHeader>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold">Editar electrodoméstico</Text>
            <Button colorScheme="red" onClick={handleDelete} isLoading={deleting}>
              Eliminar
            </Button>
          </Box>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Nombre</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Precio</FormLabel>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Medidas</FormLabel>
              <Input value={medidas} onChange={(e) => setMedidas(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Observaciones</FormLabel>
              <Input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Con algún defecto</FormLabel>
              <Checkbox isChecked={hasDefect} onChange={(e) => setHasDefect(e.target.checked)}>
                Sí
              </Checkbox>
            </FormControl>
            <FormControl>
              <FormLabel>En stock</FormLabel>
              <Checkbox isChecked={stock > 0} onChange={(e) => setStock(e.target.checked ? 1 : 0)}>
                Disponible
              </Checkbox>
            </FormControl>

            {/* Imágenes actuales */}
            <Box gridColumn="span 2">
              <FormLabel>Imágenes actuales</FormLabel>
              {fotos.length ? (
                <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2}>
                  {fotos.map(url => (
                    <Box key={url} borderWidth="1px" borderRadius="md" p={2}>
                      <Image src={url} alt="imagen" width={160} height={160} className="rounded-lg object-cover" />
                      <Button size="xs" colorScheme="red" mt={1} onClick={() => handleRemoveExistingImage(url)}>
                        Quitar
                      </Button>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Text fontSize="sm" fontStyle="italic">Sin imágenes</Text>
              )}
            </Box>

            {/* Nuevas imágenes */}
            <Box gridColumn="span 2">
              <FormLabel>Añadir nuevas imágenes</FormLabel>
              <Input type="file" multiple accept="image/*" onChange={(e) => handleAddFiles(e.target.files)} />
              {nuevasImagenes.length > 0 && (
                <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={2} mt={2}>
                  {nuevasImagenes.map(f => (
                    <Box key={f.name} borderWidth="1px" borderRadius="md" p={2}>
                      <Text fontSize="xs" noOfLines={1}>{f.name}</Text>
                      <Button size="xs" colorScheme="orange" mt={1} onClick={() => handleRemoveNewImage(f.name)}>
                        Quitar
                      </Button>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>

            <Box gridColumn="span 2" textAlign="right">
              <Button colorScheme="orange" onClick={handleSave} isLoading={saving}>
                Guardar cambios
              </Button>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}

'use client';

import RequireAuth from '../../../components/RequireAuth';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  type DocumentData,
} from 'firebase/firestore';
import { getFirestoreDb } from '../../../lib/firebase';
import { getFirebaseAuth } from '../../../lib/firebase';
import { ArrowBackIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Image as ChakraImage,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import Image from 'next/image';
import SelectConNuevo from '../../../components/SelectConNuevo';
import {
  getTipos,
  addTipo,
  getAllMarcas,
  addMarca,
  getMedidas,
  addMedida,
} from '../../../lib/catalogo';

type ElectroData = {
  name: string;
  price: number;
  category?: string;
  marca?: string;
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [hasDefect, setHasDefect] = useState(false);
  const [stock, setStock] = useState<number>(1);

  // Catálogos
  const [tipos, setTipos] = useState<string[]>([]);
  const [allMarcas, setAllMarcas] = useState<{ nombre: string; tipo: string }[]>([]);
  const [medidasCatalogo, setMedidasCatalogo] = useState<string[]>([]);

  // Selecciones
  const [tipo, setTipo] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [medidas, setMedidas] = useState('');
  const [nuevaMedida, setNuevaMedida] = useState('');

  const tipoFinalParaMarca = tipo === '__nuevo__' ? nuevoTipo.trim() : tipo;
  const marcasFiltradas = allMarcas
    .filter((m) => m.tipo === tipoFinalParaMarca)
    .map((m) => m.nombre);

  // Opciones con el valor actual incluido aunque no esté en el catálogo
  const tiposOptions = [...new Set([...tipos, ...(tipo && tipo !== '__nuevo__' ? [tipo] : [])])].sort();
  const medidasOptions = [...new Set([...medidasCatalogo, ...(medidas && medidas !== '__nuevo__' ? [medidas] : [])])].sort();
  const marcasOptions = [...new Set([...marcasFiltradas, ...(marca && marca !== '__nuevo__' ? [marca] : [])])].sort();

  useEffect(() => {
    const load = async () => {
      try {
        const refDoc = doc(db, 'electrodomesticos', id);
        const snap = await getDoc(refDoc);
        if (!snap.exists()) { setError('No encontrado'); return; }
        const data = snap.data() as DocumentData;
        setName(typeof data.name === 'string' ? data.name : '');
        setPrice(typeof data.price === 'number' ? data.price : 0);
        setTipo(typeof data.category === 'string' ? data.category : '');
        setMarca(typeof data.marca === 'string' ? data.marca : '');
        setMedidas(typeof data.medidas === 'string' ? data.medidas : '');
        setObservaciones(typeof data.observaciones === 'string' ? data.observaciones : '');
        setHasDefect(!!data.hasDefect);
        setStock(typeof data.stock === 'number' ? data.stock : 1);
        setFotos(Array.isArray(data.fotos) ? data.fotos : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [db, id]);

  useEffect(() => {
    Promise.all([getTipos(), getAllMarcas(), getMedidas()])
      .then(([t, m, med]) => {
        setTipos(t);
        setAllMarcas(m);
        setMedidasCatalogo(med);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  }, [previewUrls]);

  const handleTipoChange = (v: string) => {
    setTipo(v);
    setMarca('');
    setNuevaMarca('');
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setNuevasImagenes((prev) => [...prev, ...fileArray]);
    setPreviewUrls((prev) => [...prev, ...fileArray.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const handleRemoveExistingImage = (url: string) => {
    setFotos((prev) => prev.filter((u) => u !== url));
  };

  const handleRemoveNewImage = (index: number) => {
    if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
    setNuevasImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (!auth.currentUser) throw new Error('Debes estar autenticado');

      const urls: string[] = [];
      for (const file of nuevasImagenes) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir la imagen');
        }
        urls.push((await response.json()).url);
      }

      previewUrls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
      setPreviewUrls([]);
      setNuevasImagenes([]);

      // Guardar nuevos valores en catálogos
      const tipoFinal = tipo === '__nuevo__' ? nuevoTipo.trim() : tipo;
      if (tipo === '__nuevo__' && nuevoTipo.trim()) {
        await addTipo(nuevoTipo.trim());
        setTipos((prev) => [...new Set([...prev, nuevoTipo.trim()])].sort());
      }

      const marcaFinal = marca === '__nuevo__' ? nuevaMarca.trim() : marca;
      if (marca === '__nuevo__' && nuevaMarca.trim() && tipoFinal) {
        await addMarca(nuevaMarca.trim(), tipoFinal);
        setAllMarcas((prev) => [...prev, { nombre: nuevaMarca.trim(), tipo: tipoFinal }]);
      }

      const medidasFinal = medidas === '__nuevo__' ? nuevaMedida.trim() : medidas;
      if (medidas === '__nuevo__' && nuevaMedida.trim()) {
        await addMedida(nuevaMedida.trim());
        setMedidasCatalogo((prev) => [...new Set([...prev, nuevaMedida.trim()])].sort());
      }

      const updated: Partial<ElectroData> & Record<string, unknown> = {
        name,
        price,
        fotos: [...fotos, ...urls],
        hasDefect,
        stock,
      };
      if (tipoFinal) updated.category = tipoFinal;
      else updated.category = deleteField() as unknown as string;
      if (marcaFinal) updated.marca = marcaFinal;
      else updated.marca = deleteField() as unknown as string;
      if (medidasFinal) updated.medidas = medidasFinal;
      else updated.medidas = deleteField() as unknown as string;
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
    if (!window.confirm('¿Eliminar este producto?')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'electrodomesticos', id));
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <Box bg="gray.50" minH="100vh">
        <Box display="flex" alignItems="center" justifyContent="center" minH="60vh">
          <Text color="gray.400">Cargando…</Text>
        </Box>
      </Box>
    );

  return (
    <Box bg="gray.50" minH="100vh">
      <Box maxW="2xl" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Button mb={6} variant="ghost" colorScheme="gray" leftIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Volver
        </Button>

        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={6}>
          Editar producto
        </Text>

        <Stack spacing={4}>
          {/* Información básica */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
            <Text fontWeight="600" color="gray.700" mb={4}>Información básica</Text>
            <Stack spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1} fontWeight="500">Nombre del producto</Text>
                <Input value={name} onChange={(e) => setName(e.target.value)} color="gray.800" />
              </Box>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1} fontWeight="500">Precio (€)</Text>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    color="gray.800"
                  />
                </Box>

                <SelectConNuevo
                  label="Tipo de producto"
                  value={tipo}
                  onSelect={handleTipoChange}
                  nuevoValue={nuevoTipo}
                  onNuevoChange={setNuevoTipo}
                  options={tiposOptions}
                  placeholder="Selecciona el tipo"
                  nuevoPlaceholder="Escribe el tipo (Ej: Colchón)"
                />
              </SimpleGrid>

              <SelectConNuevo
                label="Marca"
                value={marca}
                onSelect={setMarca}
                nuevoValue={nuevaMarca}
                onNuevoChange={setNuevaMarca}
                options={marcasOptions}
                placeholder={tipoFinalParaMarca ? 'Selecciona o añade marca' : 'Selecciona primero el tipo'}
                isDisabled={!tipoFinalParaMarca}
                nuevoPlaceholder="Escribe la marca (Ej: Samsung)"
              />
            </Stack>
          </Box>

          {/* Detalles */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
            <Text fontWeight="600" color="gray.700" mb={4}>Detalles</Text>
            <Stack spacing={4}>
              <SelectConNuevo
                label="Medidas"
                value={medidas}
                onSelect={setMedidas}
                nuevoValue={nuevaMedida}
                onNuevoChange={setNuevaMedida}
                options={medidasOptions}
                placeholder="Selecciona o añade medida"
                nuevoPlaceholder="Ej: 180 x 60 x 60 cm"
              />

              <Box>
                <Text fontSize="sm" color="gray.600" mb={1} fontWeight="500">Observaciones</Text>
                <Input
                  placeholder="Notas adicionales…"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  color="gray.800"
                />
              </Box>

              <HStack spacing={8} pt={1}>
                <Checkbox isChecked={hasDefect} onChange={(e) => setHasDefect(e.target.checked)} colorScheme="orange">
                  <Text fontSize="sm" color="gray.700">Tiene algún defecto <Text as="span" color="gray.400">(Ocasión)</Text></Text>
                </Checkbox>
                <Checkbox isChecked={stock > 0} onChange={(e) => setStock(e.target.checked ? 1 : 0)} colorScheme="green">
                  <Text fontSize="sm" color="gray.700">En stock</Text>
                </Checkbox>
              </HStack>
            </Stack>
          </Box>

          {/* Imágenes actuales */}
          {fotos.length > 0 && (
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
              <Text fontWeight="600" color="gray.700" mb={4}>Imágenes actuales</Text>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                {fotos.map((url) => (
                  <Box key={url} position="relative" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                    <Box h="100px" bg="gray.50">
                      <Image src={url} alt="imagen" width={160} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <IconButton
                      aria-label="Quitar imagen"
                      icon={<CloseIcon boxSize={2.5} />}
                      size="xs"
                      colorScheme="red"
                      borderRadius="full"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => handleRemoveExistingImage(url)}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Añadir imágenes */}
          <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
            <Text fontWeight="600" color="gray.700" mb={4}>
              {fotos.length > 0 ? 'Añadir más imágenes' : 'Imágenes'}
            </Text>
            <Box
              border="2px dashed"
              borderColor="gray.200"
              borderRadius="xl"
              p={8}
              textAlign="center"
              cursor="pointer"
              _hover={{ borderColor: 'orange.300', bg: 'orange.50' }}
              transition="all 0.15s"
              onClick={() => document.getElementById('new-image-upload')?.click()}
            >
              <Text fontSize="2xl" mb={2}>📷</Text>
              <Text color="gray.500" fontSize="sm" fontWeight="500">Haz clic para subir imágenes</Text>
              <Input type="file" multiple accept="image/*" onChange={handleAddFiles} id="new-image-upload" display="none" />
            </Box>

            {previewUrls.length > 0 && (
              <Box mt={4}>
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                  {previewUrls.map((url, index) => (
                    <Box key={index} position="relative" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                      <Box h="100px" bg="gray.50">
                        <ChakraImage src={url} alt={`Vista previa ${index + 1}`} w="100%" h="100%" objectFit="cover" />
                      </Box>
                      <IconButton
                        aria-label="Eliminar"
                        icon={<CloseIcon boxSize={2.5} />}
                        size="xs"
                        colorScheme="red"
                        borderRadius="full"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => handleRemoveNewImage(index)}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Box>

          {error && (
            <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p={4}>
              <Text color="red.600" fontSize="sm">{error}</Text>
            </Box>
          )}

          <Flex gap={3}>
            <Button variant="ghost" colorScheme="gray" onClick={() => router.back()} flex={1}>Cancelar</Button>
            <Button colorScheme="orange" onClick={handleSave} isLoading={saving} loadingText="Guardando..." flex={2}>
              Guardar cambios
            </Button>
          </Flex>

          {/* Zona de peligro */}
          <Box bg="red.50" border="1px solid" borderColor="red.100" borderRadius="2xl" p={5}>
            <Text fontWeight="600" color="red.700" fontSize="sm" mb={1}>Zona de peligro</Text>
            <Text color="red.400" fontSize="xs" mb={3}>Esta acción no se puede deshacer.</Text>
            <Button colorScheme="red" variant="outline" size="sm" onClick={handleDelete} isLoading={deleting} loadingText="Eliminando...">
              Eliminar producto
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

'use client';

import RequireAuth from '../../../components/RequireAuth';
import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from '../../../lib/firebase';
import { getFirebaseAuth } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';
import { ArrowBackIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import SelectConNuevo from '../../../components/SelectConNuevo';
import {
  getTipos,
  addTipo,
  getAllMarcas,
  addMarca,
  getMedidas,
  addMedida,
} from '../../../lib/catalogo';

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
  const [observaciones, setObservaciones] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [hasDefect, setHasDefect] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [isOferta, setIsOferta] = useState(false);

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Marcas filtradas según tipo seleccionado
  const tipoFinalParaMarca = tipo === '__nuevo__' ? nuevoTipo.trim() : tipo;
  const marcasFiltradas = allMarcas
    .filter((m) => m.tipo === tipoFinalParaMarca)
    .map((m) => m.nombre);

  useEffect(() => {
    Promise.all([getTipos(), getAllMarcas(), getMedidas()])
      .then(([t, m, med]) => {
        setTipos(t);
        setAllMarcas(m);
        setMedidasCatalogo(med);
      })
      .catch(() => { });
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setError('Por favor selecciona solo archivos de imagen');
        e.target.value = '';
        return;
      }
      setImagenes((prev) => [...prev, ...imageFiles]);
      const newPreviews = imageFiles
        .map((f) => { try { return URL.createObjectURL(f); } catch { return ''; } })
        .filter(Boolean);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
      setError(null);
      e.target.value = '';
    } catch {
      setError('Error al cargar las imágenes. Por favor intenta de nuevo.');
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const db = getFirestoreDb();
      const auth = getFirebaseAuth();
      if (!auth.currentUser) throw new Error('Debes estar autenticado para subir imágenes');

      // Subir imágenes
      const urls: string[] = [];
      for (const file of imagenes) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir la imagen');
        }
        const data = await response.json();
        urls.push(data.url);
      }

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

      // Guardar producto
      const base: Record<string, unknown> = {
        name,
        price,
        fotos: urls,
        creadoEn: serverTimestamp(),
        hasDefect,
        stock: inStock ? 1 : 0,
        isOferta,
      };
      if (tipoFinal) base.category = tipoFinal;
      if (marcaFinal) base.marca = marcaFinal;
      if (medidasFinal) base.medidas = medidasFinal;
      if (observaciones.trim()) base.observaciones = observaciones.trim();

      await addDoc(collection(db, 'electrodomesticos'), base);

      previewUrls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto.');
      setSubmitting(false);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      <Box maxW="2xl" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        <Button mb={6} variant="ghost" colorScheme="gray" leftIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Volver
        </Button>

        <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={6}>
          Nuevo producto
        </Text>

        <form onSubmit={onSubmit}>
          <Stack spacing={4}>
            {/* Información básica */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
              <Text fontWeight="600" color="gray.700" mb={4}>Información básica</Text>
              <Stack spacing={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1} fontWeight="500">Nombre del producto <Text as="span" color="red.400">*</Text></Text>
                  <Input
                    placeholder="Ej: Frigorífico Samsung Side by Side"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    color="gray.800"
                  />
                </Box>

                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1} fontWeight="500">Precio (€) <Text as="span" color="red.400">*</Text></Text>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      required
                      color="gray.800"
                    />
                  </Box>

                  <SelectConNuevo
                    label="Tipo de producto"
                    value={tipo}
                    onSelect={handleTipoChange}
                    nuevoValue={nuevoTipo}
                    onNuevoChange={setNuevoTipo}
                    options={tipos}
                    placeholder="Ej: Frigorífico, Sofá…"
                    nuevoPlaceholder="Escribe el tipo (Ej: Colchón)"
                  />
                </SimpleGrid>

                <SelectConNuevo
                  label="Marca"
                  value={marca}
                  onSelect={setMarca}
                  nuevoValue={nuevaMarca}
                  onNuevoChange={setNuevaMarca}
                  options={marcasFiltradas}
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
                  options={medidasCatalogo}
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
                  <Checkbox isChecked={inStock} onChange={(e) => setInStock(e.target.checked)} colorScheme="green">
                    <Text fontSize="sm" color="gray.700">En stock</Text>
                  </Checkbox>
                </HStack>

                <HStack spacing={8} pt={2}>
                  <Checkbox isChecked={isOferta} onChange={(e) => setIsOferta(e.target.checked)} colorScheme="red">
                    <Text fontSize="sm" color="gray.700">Mostrar en ofertas</Text>
                  </Checkbox>
                </HStack>
              </Stack>
            </Box>

            {/* Imágenes */}
            <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="gray.100" shadow="sm" p={6}>
              <Text fontWeight="600" color="gray.700" mb={4}>Imágenes</Text>
              <Box
                border="2px dashed"
                borderColor="gray.200"
                borderRadius="xl"
                p={8}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: 'orange.300', bg: 'orange.50' }}
                transition="all 0.15s"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Text fontSize="2xl" mb={2}>📷</Text>
                <Text color="gray.500" fontSize="sm" fontWeight="500">Haz clic para subir imágenes</Text>
                <Text color="gray.300" fontSize="xs" mt={1}>Puedes seleccionar varias a la vez</Text>
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} id="image-upload" display="none" />
              </Box>

              {previewUrls.length > 0 && (
                <Box mt={4}>
                  <Text fontSize="sm" mb={3} color="gray.500">
                    {previewUrls.length} {previewUrls.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                  </Text>
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={3}>
                    {previewUrls.map((url, index) => (
                      <Box key={index} position="relative" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                        <Box h="100px" bg="gray.50">
                          <Image src={url} alt={`Vista previa ${index + 1}`} w="100%" h="100%" objectFit="cover" />
                        </Box>
                        <IconButton
                          aria-label="Eliminar imagen"
                          icon={<CloseIcon boxSize={2.5} />}
                          size="xs"
                          colorScheme="red"
                          borderRadius="full"
                          position="absolute"
                          top={1}
                          right={1}
                          onClick={() => removeImage(index)}
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
              <Button type="submit" colorScheme="orange" isLoading={submitting} loadingText="Guardando..." flex={2}>
                Guardar producto
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}

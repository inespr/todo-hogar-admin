'use client';

import { useEffect, useState } from 'react';
import {
  getDocs,
  collection,
  query,
  deleteDoc,
  doc,
  Timestamp,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  AddIcon,
  CloseIcon,
  DragHandleIcon,
  HamburgerIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Slide,
  Stack,
  Text,
} from '@chakra-ui/react';
import CloudinaryImage from '../../components/CloudinaryImage';

type ElectroItem = {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl?: string;
  hasDefect?: boolean;
  stock?: number;
  createdAt?: Timestamp | null;
};

function ProductsList() {
  const [items, setItems] = useState<ElectroItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ElectroItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<
    'default' | 'priceAsc' | 'priceDesc' | 'dateAsc' | 'dateDesc'
  >('default');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [showOcasionesOnly, setShowOcasionesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const router = useRouter();

  const generateRandomProduct = (): ElectroItem => {
    const cats = ['Frigorífico', 'Lavadora', 'Microondas', 'Horno', 'Televisor', 'Lavavajillas'];
    const randomCategory = cats[Math.floor(Math.random() * cats.length)];
    const randomName = `${randomCategory} ${Math.floor(Math.random() * 1000)}`;
    const randomPrice = parseFloat((Math.random() * 1000 + 50).toFixed(2));
    const randomStock = Math.random() < 0.7 ? Math.floor(Math.random() * 20) + 1 : 0;
    const randomDefect = Math.random() < 0.3;
    return {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: randomName,
      category: randomCategory,
      price: randomPrice,
      stock: randomStock,
      hasDefect: randomDefect,
      imageUrl: '/default.png',
      createdAt: Timestamp.fromDate(new Date()),
    };
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const clearSelection = () => setSelectedItems(new Set());

  const deleteSelected = async () => {
    if (!selectedItems.size) return alert('Selecciona al menos un producto');
    if (!confirm(`¿Eliminar ${selectedItems.size} productos seleccionados?`)) return;
    try {
      const db = getFirestoreDb();
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'electrodomesticos', id));
      }
      setItems((prev) => prev.filter((p) => !selectedItems.has(p.id)));
      setFilteredItems((prev) => prev.filter((p) => !selectedItems.has(p.id)));
      setSelectedItems(new Set());
    } catch (err) {
      console.error(err);
      alert('Error al eliminar productos');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const db = getFirestoreDb();
        const snap = await getDocs(query(collection(db, 'electrodomesticos')));
        const rows: ElectroItem[] = snap.docs.map((d) => {
          const data = d.data();
          const fotos = Array.isArray(data.fotos) ? data.fotos : [];
          const imageUrl =
            fotos.length > 0
              ? fotos[0]
              : typeof data.imageUrl === 'string'
              ? data.imageUrl
              : '/default.png';
          return {
            id: d.id,
            name: typeof data.name === 'string' ? data.name : 'Sin nombre',
            price: typeof data.price === 'number' ? data.price : 0,
            category: typeof data.category === 'string' ? data.category : undefined,
            imageUrl,
            hasDefect: !!data.hasDefect,
            stock: typeof data.stock === 'number' ? data.stock : 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          };
        });
        setItems(rows);
        setFilteredItems(rows);
        const uniqueCategories = Array.from(
          new Set(rows.map((p) => p.category ?? 'Sin categoría'))
        );
        setCategories(['Todos', ...uniqueCategories]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let updated = [...items];
    if (showOcasionesOnly) updated = updated.filter((p) => p.hasDefect);
    if (selectedCategory !== 'Todos')
      updated = updated.filter((p) => (p.category ?? 'Sin categoría') === selectedCategory);
    if (search.trim())
      updated = updated.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'priceAsc') updated.sort((a, b) => a.price - b.price);
    else if (sortBy === 'priceDesc') updated.sort((a, b) => b.price - a.price);
    else if (sortBy === 'dateAsc')
      updated.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
    else if (sortBy === 'dateDesc')
      updated.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    setFilteredItems(updated);
  }, [items, selectedCategory, sortBy, search, showOcasionesOnly]);

  if (loading)
    return (
      <Box bg="gray.50" minH="100vh">
        <Box display="flex" alignItems="center" justifyContent="center" minH="60vh">
          <Text color="gray.400">Cargando productos…</Text>
        </Box>
      </Box>
    );

  return (
    <Box bg="gray.50" minH="100vh">

      {/* Barra de acciones al seleccionar */}
      <Slide direction="top" in={selectedItems.size > 0} style={{ zIndex: 10 }}>
        <Flex
          bg="gray.800"
          color="white"
          px={{ base: 4, md: 6 }}
          py={3}
          justify="space-between"
          align="center"
          shadow="md"
        >
          <Text fontWeight="500">{selectedItems.size} seleccionados</Text>
          <Flex gap={2}>
            <Button size="sm" colorScheme="red" onClick={deleteSelected}>
              Eliminar
            </Button>
            <Button size="sm" variant="outline" color="white" borderColor="whiteAlpha.400" onClick={clearSelection}>
              Cancelar
            </Button>
          </Flex>
        </Flex>
      </Slide>

      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 6 }} py={8}>
        {/* Cabecera de página */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          flexDir={{ base: 'column', sm: 'row' }}
          gap={3}
          mb={6}
          mt={selectedItems.size > 0 ? 14 : 0}
        >
          <Box>
            <Heading size="lg" color="gray.800">Productos</Heading>
            <Text color="gray.400" fontSize="sm" mt={1}>
              {items.length} artículos en total
            </Text>
          </Box>
          <Button
            colorScheme="orange"
            leftIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/new')}
          >
            Nuevo producto
          </Button>
        </Flex>

        {/* Panel de filtros */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.100"
          shadow="sm"
          p={4}
          mb={6}
        >
          {/* Búsqueda + ordenación + vistas */}
          <Flex gap={3} mb={4} wrap="wrap">
            <InputGroup flex={1} minW="180px">
              <InputLeftElement>
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="gray.50"
              />
            </InputGroup>
            <Select
              w={{ base: 'full', sm: '200px' }}
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'default'
                    | 'priceAsc'
                    | 'priceDesc'
                    | 'dateAsc'
                    | 'dateDesc'
                )
              }
              bg="gray.50"
            >
              <option value="default">Ordenar por…</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="dateAsc">Fecha: más antigua</option>
              <option value="dateDesc">Fecha: más reciente</option>
            </Select>
            <Flex gap={1}>
              <IconButton
                aria-label="Vista en grid"
                icon={<DragHandleIcon />}
                colorScheme={view === 'grid' ? 'orange' : 'gray'}
                variant={view === 'grid' ? 'solid' : 'ghost'}
                onClick={() => setView('grid')}
              />
              <IconButton
                aria-label="Vista en lista"
                icon={<HamburgerIcon />}
                colorScheme={view === 'list' ? 'orange' : 'gray'}
                variant={view === 'list' ? 'solid' : 'ghost'}
                onClick={() => setView('list')}
              />
            </Flex>
          </Flex>

          {/* Categorías + ocasión */}
          <Flex wrap="wrap" gap={2} align="center">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'solid' : 'ghost'}
                colorScheme={selectedCategory === cat ? 'orange' : 'gray'}
                borderRadius="full"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
            <Box ml="auto">
              <Checkbox
                isChecked={showOcasionesOnly}
                onChange={(e) => setShowOcasionesOnly(e.target.checked)}
                colorScheme="orange"
                fontSize="sm"
              >
                Solo Ocasión
              </Checkbox>
            </Box>
          </Flex>
        </Box>

        {/* Grid de productos */}
        {view === 'grid' ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {filteredItems.map((p) => {
              const isSelected = selectedItems.has(p.id);
              return (
                <Box
                  key={p.id}
                  bg="white"
                  borderRadius="2xl"
                  overflow="hidden"
                  border="2px solid"
                  borderColor={isSelected ? 'orange.400' : 'gray.100'}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  onClick={() => router.push(`/dashboard/${p.id}`)}
                >
                  <Box position="relative" h="180px" bg="gray.50">
                    <CloudinaryImage
                      src={p.imageUrl ?? '/default.png'}
                      alt={p.name}
                      width={300}
                      height={180}
                      objectFit="cover"
                    />
                    {p.hasDefect && (
                      <Badge
                        position="absolute"
                        top={2}
                        left={2}
                        colorScheme="orange"
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        Ocasión
                      </Badge>
                    )}
                    <IconButton
                      aria-label={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                      icon={<CloseIcon boxSize={2.5} />}
                      size="xs"
                      colorScheme={isSelected ? 'red' : 'blackAlpha'}
                      bg={isSelected ? undefined : 'blackAlpha.300'}
                      _hover={{ bg: isSelected ? undefined : 'blackAlpha.500' }}
                      position="absolute"
                      top={2}
                      right={2}
                      borderRadius="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(p.id);
                      }}
                    />
                  </Box>
                  <Box p={3}>
                    <Text fontWeight="600" fontSize="sm" noOfLines={1} mb={0.5}>
                      {p.name}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mb={2} noOfLines={1}>
                      {p.category ?? 'Sin categoría'}
                    </Text>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="700" color="orange.500" fontSize="sm">
                        {p.price.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </Text>
                      <Badge
                        colorScheme={p.stock ? 'green' : 'red'}
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {p.stock ? 'Disponible' : 'Agotado'}
                      </Badge>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Stack spacing={2}>
            {filteredItems.map((p) => {
              const isSelected = selectedItems.has(p.id);
              return (
                <Box
                  key={p.id}
                  bg="white"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={isSelected ? 'orange.400' : 'gray.100'}
                  overflow="hidden"
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ shadow: 'sm', borderColor: 'gray.200' }}
                  onClick={() => router.push(`/dashboard/${p.id}`)}
                >
                  <Flex align="center" p={3} gap={3}>
                    <IconButton
                      aria-label={isSelected ? 'Deseleccionar' : 'Seleccionar'}
                      icon={<CloseIcon boxSize={2.5} />}
                      size="xs"
                      colorScheme={isSelected ? 'red' : 'gray'}
                      variant={isSelected ? 'solid' : 'ghost'}
                      borderRadius="full"
                      flexShrink={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(p.id);
                      }}
                    />
                    <Box borderRadius="lg" overflow="hidden" flexShrink={0} w="56px" h="56px" bg="gray.50">
                      <CloudinaryImage
                        src={p.imageUrl ?? '/default.png'}
                        alt={p.name}
                        width={56}
                        height={56}
                        objectFit="cover"
                      />
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text fontWeight="600" fontSize="sm" noOfLines={1}>{p.name}</Text>
                      <Text fontSize="xs" color="gray.400">{p.category ?? 'Sin categoría'}</Text>
                    </Box>
                    <Box textAlign="right" flexShrink={0}>
                      <Text fontWeight="700" fontSize="sm" color="orange.500">
                        {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </Text>
                      <Badge
                        colorScheme={p.stock ? 'green' : 'red'}
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {p.stock ? 'Disponible' : 'Agotado'}
                      </Badge>
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        )}

        {filteredItems.length === 0 && (
          <Box textAlign="center" py={16}>
            <Text color="gray.300" fontSize="3xl" mb={2}>📦</Text>
            <Text color="gray.400" fontWeight="500">No se encontraron productos</Text>
            <Text color="gray.300" fontSize="sm" mt={1}>
              Prueba con otros filtros o crea un nuevo producto
            </Text>
          </Box>
        )}

        {/* Botón de desarrollo */}
        <Flex justify="center" mt={10}>
          <Button
            size="sm"
            variant="ghost"
            colorScheme="gray"
            color="gray.300"
            fontSize="xs"
            onClick={async () => {
              const newProducts = Array.from({ length: 5 }, () => generateRandomProduct());
              try {
                const db = getFirestoreDb();
                const savedProducts: ElectroItem[] = [];
                for (const p of newProducts) {
                  const docRef = await addDoc(collection(db, 'electrodomesticos'), {
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    imageUrl: p.imageUrl,
                    hasDefect: p.hasDefect,
                    stock: p.stock,
                    fotos: [],
                    creadoEn: serverTimestamp(),
                  });
                  savedProducts.push({ ...p, id: docRef.id });
                }
                setItems((prev) => [...savedProducts, ...prev]);
                setFilteredItems((prev) => [...savedProducts, ...prev]);
                setCategories((prevCats) => {
                  const combined = [
                    ...prevCats,
                    ...savedProducts.map((p) => p.category ?? 'Sin categoría'),
                  ];
                  return Array.from(new Set(combined));
                });
              } catch (err) {
                console.error('Error al guardar productos en Firebase:', err);
                alert('Error al guardar los productos en Firebase');
              }
            }}
          >
            Generar datos de prueba
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

export default function DashboardPage() {
  return <ProductsList />;
}

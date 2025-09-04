'use client';

import { useEffect, useState } from 'react';
import { getDocs, collection, query, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { DragHandleIcon, HamburgerIcon } from '@chakra-ui/icons';

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Image,
  Input,
  SimpleGrid,
  Text,
  Select,
  Tooltip,
  Stack,
  IconButton,
  Slide,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

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

  const router = useRouter();

  const generateRandomProduct = (): ElectroItem => {
    const categories = ['Frigorífico', 'Lavadora', 'Microondas', 'Horno', 'Televisor', 'Lavavajillas'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomName = `${randomCategory} ${Math.floor(Math.random() * 1000)}`;
    const randomPrice = parseFloat((Math.random() * 1000 + 50).toFixed(2));
    const randomStock = Math.random() < 0.7 ? Math.floor(Math.random() * 20) + 1 : 0;
    const randomDefect = Math.random() < 0.3;
    const randomImage = '/default.png';


    return {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: randomName,
      category: randomCategory,
      price: randomPrice,
      stock: randomStock,
      hasDefect: randomDefect,
      imageUrl: randomImage,
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

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const deleteSelected = async () => {
    if (!selectedItems.size) return alert('Selecciona al menos un producto');
    if (!confirm(`¿Eliminar ${selectedItems.size} productos seleccionados?`)) return;

    try {
      const db = getFirestoreDb();
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'electrodomesticos', id));
      }
      setItems((items) => items.filter((p) => !selectedItems.has(p.id)));
      setFilteredItems((items) => items.filter((p) => !selectedItems.has(p.id)));
      setSelectedItems(new Set());
    } catch (err) {
      console.error(err);
      alert('Error al eliminar productos');
    }
  };

  // Cargar productos
  useEffect(() => {
    const load = async () => {
      try {
        const db = getFirestoreDb();
        const snap = await getDocs(query(collection(db, 'electrodomesticos')));
        const rows: ElectroItem[] = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            name: typeof data.name === 'string' ? data.name : 'Sin nombre',
            price: typeof data.price === 'number' ? data.price : 0,
            category: typeof data.category === 'string' ? data.category : 'Sin categoría',
            imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '/default.png',
            hasDefect: !!data.hasDefect,
            stock: typeof data.stock === 'number' ? data.stock : 0,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          };
        });
        setItems(rows);
        setFilteredItems(rows);
        const uniqueCategories = Array.from(new Set(rows.map(p => p.category ?? 'Sin categoría')));
        setCategories(['Todos', ...uniqueCategories]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [view, setView] = useState<'grid' | 'list'>('grid');


  // Filtros y ordenación
  useEffect(() => {
    let updated = [...items];

    if (showOcasionesOnly) {
      updated = updated.filter((p) => p.hasDefect);
    }

    if (selectedCategory !== 'Todos') {
      updated = updated.filter((p) => p.category === selectedCategory);
    }

    if (search.trim()) {
      updated = updated.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (sortBy === 'priceAsc') updated.sort((a, b) => a.price - b.price);
    else if (sortBy === 'priceDesc') updated.sort((a, b) => b.price - a.price);
    else if (sortBy === 'dateAsc')
      updated.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
    else if (sortBy === 'dateDesc')
      updated.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

    setFilteredItems(updated);
  }, [items, selectedCategory, sortBy, search, showOcasionesOnly]);

  if (loading) return <Text>Cargando productos…</Text>;

  return (
    <Box>
      {/* 🔹 Barra de acciones flotante (aparece solo si hay selección) */}
      <Slide direction="top" in={selectedItems.size > 0} style={{ zIndex: 10 }}>
        <Flex
          bg="gray.800"
          color="white"
          p={3}
          justify="space-between"
          align="center"
          shadow="md"
        >
          <Text>{selectedItems.size} seleccionados</Text>
          <Flex gap={2}>
            <Button size="sm" colorScheme="red" onClick={deleteSelected}>
              Eliminar
            </Button>
            <Button size="sm" colorScheme="blue" onClick={() => alert('Función editar lote')}>
              Editar en lote
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Cancelar
            </Button>
          </Flex>
        </Flex>
      </Slide>

      {/* 🔹 Filtros y búsqueda */}
      <Stack spacing={4} mb={4} mt={selectedItems.size > 0 ? 14 : 0}>
        <Flex gap={2} wrap="wrap" justifyContent="space-between">
          <Flex gap={2} mb={4} wrap="wrap">
          <Button colorScheme="green" onClick={() => router.push('/dashboard/new')}>
            + Nuevo Producto
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              const newProducts = Array.from({ length: 5 }, () => generateRandomProduct());
              setItems((prev) => [...newProducts, ...prev]);
              setFilteredItems((prev) => [...newProducts, ...prev]);

              setCategories((prevCategories) => {
                const combined = [...prevCategories, ...newProducts.map((p) => p.category ?? 'Sin categoría')];
                return Array.from(new Set(combined));
              });
            }}
          >
            Generar Productos Aleatorios
          </Button>
          </Flex>
          <Flex gap={2} mb={4} wrap="wrap">
            <IconButton
              aria-label="Vista en Grid"
              icon={<DragHandleIcon />}
              colorScheme={view === 'grid' ? 'blue' : 'gray'}
              onClick={() => setView('grid')}
            />
            <IconButton
              aria-label="Vista en Lista"
              icon={<HamburgerIcon />}
              colorScheme={view === 'list' ? 'blue' : 'gray'}
              onClick={() => setView('list')}
            />
          </Flex>

        </Flex>


        <Flex gap={4} wrap="wrap" align="center">
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            flex="1"
          />
          <Checkbox isChecked={showOcasionesOnly} onChange={(e) => setShowOcasionesOnly(e.target.checked)}>
            Solo Ocasión
          </Checkbox>
          <Select w="200px" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'default' | 'priceAsc' | 'priceDesc' | 'dateAsc' | 'dateDesc')}>
            <option value="default">Ordenar por…</option>
            <option value="priceAsc">Precio: Menor a Mayor</option>
            <option value="priceDesc">Precio: Mayor a Menor</option>
            <option value="dateAsc">Fecha: Más antigua</option>
            <option value="dateDesc">Fecha: Más reciente</option>
          </Select>
        </Flex>

        {/* Categorías */}
        <Flex wrap="wrap" gap={2}>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              colorScheme={selectedCategory === cat ? 'orange' : 'gray'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </Flex>
      </Stack>

      {/* Grid de productos */}
      {view === 'grid' ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {filteredItems.map((p) => {
            const isSelected = selectedItems.has(p.id);
            return (
              <Tooltip key={p.id} label={isSelected ? 'Deseleccionar' : 'Seleccionar'} hasArrow>
                <Box
                  borderWidth="2px"
                  borderColor={isSelected ? 'red.400' : 'gray.200'}
                  borderRadius="lg"
                  overflow="hidden"
                  position="relative"
                  cursor="pointer"
                  onClick={() => router.push(`/dashboard/${p.id}`)}
                  _hover={{ shadow: 'md' }}
                >
                  <IconButton
                    aria-label={isSelected ? 'Deseleccionar producto' : 'Seleccionar producto'}
                    icon={<CloseIcon />}
                    size="sm"
                    colorScheme={isSelected ? 'red' : 'gray'}
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(p.id);
                    }}
                  />
                  {p.hasDefect && (
                    <Badge position="absolute" top={2} left={2} colorScheme="red">
                      Ocasión
                    </Badge>
                  )}
                  <Image src={p.imageUrl} alt={p.name} objectFit="cover" width={300} height={200} />
                  <Box p={4}>
                    <Flex align="center" justify="space-between" mb={2}>
                      <Text fontWeight="bold">{p.name}</Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.600">{p.category}</Text>
                    <Flex mt={2} justify="space-between" align="center">
                      <Text fontWeight="bold">{p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Text>
                      <Badge colorScheme={p.stock ? 'green' : 'red'} fontSize="0.8em">
                        {p.stock ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </Flex>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </SimpleGrid>
      ) : (
        <Stack spacing={2}>
          {filteredItems.map((p) => {
            const isSelected = selectedItems.has(p.id);
            return (
              <Flex
                key={p.id}
                borderWidth="2px"
                borderColor={isSelected ? 'red.400' : 'gray.200'}
                borderRadius="md"
                overflow="hidden"
                align="center"
                p={2}
                cursor="pointer"
                onClick={() => router.push(`/dashboard/${p.id}`)}
              >
                <IconButton
                  aria-label={isSelected ? 'Deseleccionar producto' : 'Seleccionar producto'}
                  icon={<CloseIcon />}
                  size="sm"
                  colorScheme={isSelected ? 'red' : 'gray'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(p.id);
                  }}
                  mr={2}
                />
                <Image src={p.imageUrl} alt={p.name} boxSize="80px" objectFit="cover" mr={4} />
                <Box flex="1">
                  <Text fontWeight="bold">{p.name}</Text>
                  <Text fontSize="sm" color="gray.600">{p.category}</Text>
                  <Text fontWeight="bold">{p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Text>
                </Box>
                <Badge colorScheme={p.stock ? 'green' : 'red'} fontSize="0.8em">
                  {p.stock ? 'Disponible' : 'No disponible'}
                </Badge>
              </Flex>
            );
          })}
        </Stack>
      )}


    </Box>
  );
}

export default function DashboardPage() {
  return <ProductsList />;
}

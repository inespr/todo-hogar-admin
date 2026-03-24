import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

// ── Tipos de producto ────────────────────────────────────────────────────────

export async function getTipos(): Promise<string[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'catalogoTipos'));
  return snap.docs.map((d) => d.data().nombre as string).sort();
}

export async function addTipo(nombre: string): Promise<void> {
  const db = getFirestoreDb();
  await addDoc(collection(db, 'catalogoTipos'), { nombre: nombre.trim() });
}

// ── Marcas (por tipo) ────────────────────────────────────────────────────────

export async function getAllMarcas(): Promise<{ nombre: string; tipo: string }[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'catalogoMarcas'));
  return snap.docs.map((d) => ({
    nombre: d.data().nombre as string,
    tipo: d.data().tipo as string,
  }));
}

export async function addMarca(nombre: string, tipo: string): Promise<void> {
  const db = getFirestoreDb();
  await addDoc(collection(db, 'catalogoMarcas'), { nombre: nombre.trim(), tipo });
}

// ── Medidas ──────────────────────────────────────────────────────────────────

export async function getMedidas(): Promise<string[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'catalogoMedidas'));
  return snap.docs.map((d) => d.data().valor as string).sort();
}

export async function addMedida(valor: string): Promise<void> {
  const db = getFirestoreDb();
  await addDoc(collection(db, 'catalogoMedidas'), { valor: valor.trim() });
}

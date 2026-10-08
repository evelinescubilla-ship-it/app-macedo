// lib/store.ts
// Estado de la app: productos que vienen del backend + historial guardado en el celular

import { useSyncExternalStore } from 'react';
import type { DatosProducto, Producto } from '@/types/product';
import type { ProductInput } from '@/types/product';
import { ApiError } from '@/services/api';
import {
  createProduct,
  updateProduct as apiUpdate,
  deleteProduct as apiDelete,
  listAllProducts,
  fromApi,
  toApiInput,
} from '@/services/products';
import { logout as apiLogout } from '@/services/auth';
import { clearSession, getAccessToken, getUser, guardarJSON, leerJSON } from '@/lib/session';
import type { SesionUsuario } from '@/lib/session';

export type { Producto, DatosProducto } from '@/types/product';

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string;
  usuario: string;
  fecha: number;
  stockResultante: number;
}

export type Resultado = { ok: true } | { ok: false; error: string; sesionVencida?: boolean };

interface Estado {
  cargando: boolean;
  error: string | null;
  sesionVencida: boolean;
}

let productos: Producto[] = []; // todos los que devuelve la API
let misProductos: Producto[] = []; // solo los del usuario (los únicos que puede modificar)
let movimientos: Movimiento[] = [];
let miId: string | null = null;
let usuarioActual = 'Invitado';
let estado: Estado = { cargando: false, error: null, sesionVencida: false };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const setEstado = (parcial: Partial<Estado>) => {
  estado = { ...estado, ...parcial };
  emit();
};

const setProductos = (lista: Producto[]) => {
  productos = lista;
  misProductos = lista.filter((p) => p.ownerId === miId);
  emit();
};

// Convierte un error de la API en un resultado entendible
function fallo(e: unknown): Resultado {
  if (e instanceof ApiError) {
    if (e.status === 401) {
      setEstado({ sesionVencida: true });
      return { ok: false, error: e.message, sesionVencida: true };
    }
    return { ok: false, error: e.message };
  }
  return { ok: false, error: 'Ocurrió un error inesperado.' };
}

// ---- Lectura ----
export const getProductos = () => productos;
export const getMisProductos = () => misProductos;
export const getMovimientos = () => movimientos;
export const getUsuario = () => usuarioActual;
export const getMiId = () => miId;
export const getEstado = () => estado;
export const getProducto = (id: string) => productos.find((p) => p.id === id);
export const getProductoPorCodigo = (codigo: string) =>
  misProductos.find((p) => p.codigo.trim() !== '' && p.codigo.trim() === codigo.trim());

// Hooks: las pantallas se actualizan solas cuando cambian los datos
export const useProductos = () => useSyncExternalStore(subscribe, getProductos, getProductos);
export const useMisProductos = () => useSyncExternalStore(subscribe, getMisProductos, getMisProductos);
export const useMovimientos = () => useSyncExternalStore(subscribe, getMovimientos, getMovimientos);
export const useUsuario = () => useSyncExternalStore(subscribe, getUsuario, getUsuario);
export const useMiId = () => useSyncExternalStore(subscribe, getMiId, getMiId);
export const useEstado = () => useSyncExternalStore(subscribe, getEstado, getEstado);

// ---- Sesión ----
export async function cargarProductos(): Promise<Resultado> {
  setEstado({ cargando: true, error: null });
  try {
    const lista = await listAllProducts();
    estado = { ...estado, cargando: false };
    setProductos(lista.map(fromApi));
    return { ok: true };
  } catch (e) {
    const r = fallo(e);
    setEstado({ cargando: false, error: r.ok ? null : r.error });
    return r;
  }
}

// Se llama después de un login correcto
export async function abrirSesion(usuario: SesionUsuario): Promise<Resultado> {
  miId = usuario.id;
  usuarioActual = usuario.nombre;
  estado = { cargando: false, error: null, sesionVencida: false };
  movimientos = (await leerJSON<Movimiento[]>(`mov:${usuario.id}`)) ?? [];
  setProductos([]);
  return cargarProductos();
}

// Al abrir la app: si ya había una sesión guardada, se retoma
export async function restaurarSesion(): Promise<boolean> {
  const [usuario, token] = await Promise.all([getUser(), getAccessToken()]);
  if (!usuario || !token) return false;
  const r = await abrirSesion(usuario);
  if (!r.ok && r.sesionVencida) {
    await clearSession();
    cerrarSesionLocal();
    return false;
  }
  return true;
}

export function cerrarSesionLocal() {
  miId = null;
  usuarioActual = 'Invitado';
  productos = [];
  misProductos = [];
  movimientos = [];
  estado = { cargando: false, error: null, sesionVencida: false };
  emit();
}

export async function cerrarSesion() {
  try {
    await apiLogout();
  } catch {
    // aunque falle el aviso al servidor, se cierra la sesión en el celular
  }
  await clearSession();
  cerrarSesionLocal();
}

// ---- Productos ----
export async function addProducto(data: DatosProducto): Promise<Resultado> {
  try {
    const respuesta = await createProduct(toApiInput(data));
    setProductos([fromApi(respuesta.data), ...productos]);
    return { ok: true };
  } catch (e) {
    return fallo(e);
  }
}

export async function updateProducto(id: string, data: DatosProducto): Promise<Resultado> {
  const actual = getProducto(id);
  if (!actual) return { ok: false, error: 'El producto ya no existe.' };

  // PATCH parcial: se envían solo los campos que cambiaron
  const nuevo = toApiInput(data);
  const previo = toApiInput(actual);
  const cambios: Partial<ProductInput> = {};
  if (nuevo.name !== previo.name) cambios.name = nuevo.name;
  if (nuevo.description !== previo.description) cambios.description = nuevo.description;
  if (nuevo.price !== previo.price) cambios.price = nuevo.price;
  if (nuevo.stock !== previo.stock) cambios.stock = nuevo.stock;
  if (Object.keys(cambios).length === 0) return { ok: true };

  try {
    const respuesta = await apiUpdate(id, cambios);
    setProductos(productos.map((p) => (p.id === id ? fromApi(respuesta.data) : p)));
    return { ok: true };
  } catch (e) {
    return fallo(e);
  }
}

export async function deleteProducto(id: string): Promise<Resultado> {
  try {
    await apiDelete(id);
    setProductos(productos.filter((p) => p.id !== id));
    return { ok: true };
  } catch (e) {
    return fallo(e);
  }
}

// ---- Movimientos (entradas y salidas) ----
// El backend no tiene historial: el stock se actualiza en el servidor (PATCH)
// y el detalle del movimiento se guarda en el celular.
export async function registrarMovimiento(
  productoId: string,
  tipo: TipoMovimiento,
  cantidad: number,
  nota = ''
): Promise<Resultado> {
  const producto = misProductos.find((p) => p.id === productoId);
  if (!producto) return { ok: false, error: 'Selecciona un producto tuyo.' };
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return { ok: false, error: 'La cantidad debe ser un número mayor a 0.' };
  }
  if (tipo === 'salida' && cantidad > producto.stock) {
    return { ok: false, error: `Stock insuficiente. Solo hay ${producto.stock} unidades.` };
  }

  const nuevoStock = tipo === 'entrada' ? producto.stock + cantidad : producto.stock - cantidad;

  try {
    const respuesta = await apiUpdate(productoId, { stock: nuevoStock });
    const actualizado = fromApi(respuesta.data);
    movimientos = [
      {
        id: newId(),
        productoId,
        productoNombre: producto.nombre,
        tipo,
        cantidad,
        nota: nota.trim(),
        usuario: usuarioActual,
        fecha: Date.now(),
        stockResultante: actualizado.stock,
      },
      ...movimientos,
    ].slice(0, 500);
    setProductos(productos.map((p) => (p.id === productoId ? actualizado : p)));
    if (miId) guardarJSON(`mov:${miId}`, movimientos);
    return { ok: true };
  } catch (e) {
    return fallo(e);
  }
}

// ---- Utilidades ----
export const getCategorias = (lista: Producto[]) =>
  Array.from(new Set(lista.map((p) => p.categoria.trim()).filter((c) => c !== ''))).sort((a, b) =>
    a.localeCompare(b)
  );

export const formatFecha = (ts: number) => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// Ejemplo: 1200 -> $1.200,00
export const formatPrecio = (n: number) => {
  const [entero, decimales] = n.toFixed(2).split('.');
  return `$${entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales}`;
};
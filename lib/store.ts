// lib/store.ts
// Base de datos en memoria con actualización automática de las pantallas

import { useSyncExternalStore } from 'react';

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
}

export type TipoMovimiento = 'entrada' | 'salida';

export interface Movimiento {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  nota: string;
  fecha: number;
  stockResultante: number;
}

let productos: Producto[] = [
  { id: '1', nombre: 'Laptop HP ProBook 450', categoria: 'Electrónica', stock: 15, minimo: 5 },
  { id: '2', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', stock: 48, minimo: 10 },
  { id: '3', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', stock: 22, minimo: 8 },
  { id: '4', nombre: 'Monitor LG 24" Full HD', categoria: 'Electrónica', stock: 3, minimo: 5 },
  { id: '5', nombre: 'Cable HDMI 2m', categoria: 'Cables', stock: 67, minimo: 20 },
  { id: '6', nombre: 'Webcam HD 1080p', categoria: 'Accesorios', stock: 12, minimo: 6 },
  { id: '7', nombre: 'Auriculares Bluetooth', categoria: 'Audio', stock: 4, minimo: 8 },
];
let movimientos: Movimiento[] = [];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ---- Lectura ----
export const getProductos = () => productos;
export const getMovimientos = () => movimientos;
export const getProducto = (id: string) => productos.find((p) => p.id === id);

// Hooks: las pantallas se actualizan solas cuando cambian los datos
export const useProductos = () => useSyncExternalStore(subscribe, getProductos, getProductos);
export const useMovimientos = () => useSyncExternalStore(subscribe, getMovimientos, getMovimientos);

// ---- Productos ----
export const addProducto = (data: Omit<Producto, 'id'>) => {
  const nuevo: Producto = { ...data, id: newId() };
  productos = [nuevo, ...productos];
  emit();
  return nuevo;
};

export const updateProducto = (id: string, data: Partial<Omit<Producto, 'id'>>) => {
  productos = productos.map((p) => (p.id === id ? { ...p, ...data } : p));
  emit();
};

export const deleteProducto = (id: string) => {
  productos = productos.filter((p) => p.id !== id);
  emit();
};

// ---- Movimientos (entradas y salidas) ----
export type Resultado = { ok: true } | { ok: false; error: string };

export const registrarMovimiento = (
  productoId: string,
  tipo: TipoMovimiento,
  cantidad: number,
  nota = ''
): Resultado => {
  const producto = getProducto(productoId);
  if (!producto) return { ok: false, error: 'Selecciona un producto.' };
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    return { ok: false, error: 'La cantidad debe ser un número mayor a 0.' };
  }
  if (tipo === 'salida' && cantidad > producto.stock) {
    return { ok: false, error: `Stock insuficiente. Solo hay ${producto.stock} unidades.` };
  }

  const nuevoStock = tipo === 'entrada' ? producto.stock + cantidad : producto.stock - cantidad;
  productos = productos.map((p) => (p.id === productoId ? { ...p, stock: nuevoStock } : p));
  movimientos = [
    {
      id: newId(),
      productoId,
      productoNombre: producto.nombre,
      tipo,
      cantidad,
      nota: nota.trim(),
      fecha: Date.now(),
      stockResultante: nuevoStock,
    },
    ...movimientos,
  ];
  emit();
  return { ok: true };
};

// ---- Utilidades ----
export const formatFecha = (ts: number) => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
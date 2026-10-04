 // lib/store.ts
// Simula una base de datos en memoria

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
}

// Productos iniciales de ejemplo
let productos: Producto[] = [
  { id: '1', nombre: 'Laptop HP ProBook 450', categoria: 'Electrónica', stock: 15, minimo: 5 },
  { id: '2', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', stock: 48, minimo: 10 },
  { id: '3', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', stock: 22, minimo: 8 },
  { id: '4', nombre: 'Monitor LG 24" Full HD', categoria: 'Electrónica', stock: 3, minimo: 5 },
  { id: '5', nombre: 'Cable HDMI 2m', categoria: 'Cables', stock: 67, minimo: 20 },
  { id: '6', nombre: 'Webcam HD 1080p', categoria: 'Accesorios', stock: 12, minimo: 6 },
  { id: '7', nombre: 'Auriculares Bluetooth', categoria: 'Audio', stock: 4, minimo: 8 },
];

// Funciones para leer y escribir
export const getProductos = () => productos;

export const addProducto = (producto: Omit<Producto, 'id'>) => {
  const nuevoProducto: Producto = {
    ...producto,
    id: Date.now().toString(), // ID único basado en la hora
  };
  productos = [nuevoProducto, ...productos]; // Agrega al principio
  return nuevoProducto;
};
// types/product.ts

// Producto tal como lo devuelve la API
export type Product = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  price: string; // la API lo devuelve como string
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

// Lo que se envía a la API al crear o editar
export type ProductInput = {
  name: string;
  description?: string;
  price: number; // al enviar se manda como número
  stock?: number;
  active?: boolean;
};

// Producto tal como lo usa la app (incluye campos propios de Inventario360)
export type Producto = {
  id: string;
  ownerId: string;
  nombre: string;
  categoria: string;
  codigo: string;
  proveedor: string;
  precio: number;
  stock: number;
  minimo: number;
};

export type DatosProducto = Omit<Producto, 'id' | 'ownerId'>;


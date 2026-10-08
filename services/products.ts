// services/products.ts
import { apiRequest } from './api';
import type { DatosProducto, Producto, Product, ProductInput } from '@/types/product';

type ProductListResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export function listProducts(page = 1, limit = 20, search = '') {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) query.set('search', search.trim());

  return apiRequest<ProductListResponse>(`/api/v1/products?${query.toString()}`, { auth: true });
}

// Trae todas las páginas (de a 100) para tener el inventario completo
export async function listAllProducts(): Promise<Product[]> {
  const todos: Product[] = [];
  const limit = 100;
  for (let page = 1; page <= 10; page++) {
    const respuesta = await listProducts(page, limit);
    todos.push(...respuesta.data);
    if (todos.length >= respuesta.meta.total || respuesta.data.length < limit) break;
  }
  return todos;
}

export function createProduct(input: ProductInput) {
  return apiRequest<{ data: Product }>('/api/v1/products', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  });
}

export function updateProduct(id: string, input: Partial<ProductInput>) {
  return apiRequest<{ data: Product }>(`/api/v1/products/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string) {
  return apiRequest<void>(`/api/v1/products/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

// ---------------------------------------------------------------------------
// El backend solo tiene: name, description, price, stock y active.
// Los campos propios de la app (categoría, código, proveedor y stock mínimo)
// se guardan dentro de "description" con una marca, y se leen al cargar.
// Si el producto viene de otra persona y no tiene la marca, se usan valores por defecto.
// ---------------------------------------------------------------------------
const MARCA = '[i360]';

type Extras = { categoria?: string; codigo?: string; proveedor?: string; minimo?: number };

export function fromApi(p: Product): Producto {
  let extras: Extras = {};
  const descripcion = p.description ?? '';
  if (descripcion.startsWith(MARCA)) {
    try {
      extras = JSON.parse(descripcion.slice(MARCA.length)) as Extras;
    } catch {
      extras = {};
    }
  }
  return {
    id: p.id,
    ownerId: p.owner_id,
    nombre: p.name,
    categoria: extras.categoria?.trim() || 'Sin categoría',
    codigo: extras.codigo ?? '',
    proveedor: extras.proveedor ?? '',
    precio: Number(p.price) || 0,
    stock: p.stock,
    minimo: Number(extras.minimo) || 0,
  };
}

export function toApiInput(d: DatosProducto): ProductInput {
  return {
    name: d.nombre,
    description:
      MARCA +
      JSON.stringify({
        categoria: d.categoria,
        codigo: d.codigo,
        proveedor: d.proveedor,
        minimo: d.minimo,
      }),
    price: Math.round(d.precio * 100) / 100,
    stock: d.stock,
  };
}
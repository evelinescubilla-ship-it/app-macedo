 // services/api.ts
// Función común para todas las llamadas al backend

import { getAccessToken, getRefreshToken, saveSession } from '@/lib/session';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://backend-proyecto.n7softwares.com';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

// Traduce los mensajes más comunes a español
function traducir(status: number, code: string | undefined, message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ese correo ya está registrado.';
  if (code === 'unauthorized' || code === 'invalid_token') return 'Tu sesión venció. Inicia sesión de nuevo.';
  if (code === 'not_found') return 'No existe o no es un producto tuyo.';
  if (code === 'invalid_json') return 'El servidor rechazó los datos enviados.';
  if (status === 502) return 'El servicio de autenticación no está disponible. Intenta más tarde.';
  if (status >= 500) return 'Error del servidor. Intenta de nuevo en un momento.';
  return message;
}

// Si el access_token venció, pedimos uno nuevo con el refresh_token
let renovando: Promise<boolean> | null = null;

async function renovarToken(): Promise<boolean> {
  if (!renovando) {
    renovando = (async () => {
      try {
        const refresh = await getRefreshToken();
        if (!refresh) return false;
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data?.access_token || !data?.refresh_token) return false;
        await saveSession(data.access_token, data.refresh_token);
        return true;
      } catch {
        return false;
      }
    })();
  }
  const resultado = await renovando;
  renovando = null;
  return resultado;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  reintentar = true
): Promise<T> {
  const { auth, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = await getAccessToken();
    if (!token) throw new ApiError('No hay una sesión iniciada.', 401, 'unauthorized');
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión a internet.', 0, 'network');
  }

  if (response.status === 401 && auth && reintentar && (await renovarToken())) {
    return apiRequest<T>(path, options, false);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const code: string | undefined = body?.error?.code;
    const message: string =
      body?.error?.message ?? // errores propios del backend
      body?.msg ?? // errores de Supabase Auth
      `Error HTTP ${response.status}`;
    throw new ApiError(traducir(response.status, code, message), response.status, code);
  }

  return body as T;
}
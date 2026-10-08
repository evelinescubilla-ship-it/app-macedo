// lib/session.ts
// Guarda en el celular los tokens, el usuario y los datos locales

import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const USER = 'user_info';

export interface SesionUsuario {
  id: string;
  email: string;
  nombre: string;
}

export async function saveSession(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN, accessToken],
    [REFRESH_TOKEN, refreshToken],
  ]);
}

export const getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN);
export const getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN);

export async function saveUser(usuario: SesionUsuario) {
  await AsyncStorage.setItem(USER, JSON.stringify(usuario));
}

export async function getUser(): Promise<SesionUsuario | null> {
  try {
    const raw = await AsyncStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as SesionUsuario) : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN, USER]);
}

// El backend no guarda el nombre, así que lo recordamos en el celular
const claveNombre = (email: string) => `nombre:${email.trim().toLowerCase()}`;
export const saveNombre = (email: string, nombre: string) =>
  AsyncStorage.setItem(claveNombre(email), nombre.trim());
export const getNombre = (email: string) => AsyncStorage.getItem(claveNombre(email));

// Utilidades para guardar datos locales (por ejemplo el historial)
export async function guardarJSON(clave: string, valor: unknown) {
  try {
    await AsyncStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // si falla el guardado local no interrumpimos la app
  }
}

export async function leerJSON<T>(clave: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
